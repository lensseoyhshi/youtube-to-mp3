import { NextResponse } from 'next/server';
import { spawn } from 'child_process';
import { promisify } from 'util';
import { exec } from 'child_process';
import { TransformStream } from 'stream/web';
import { writeCookieToTempFile, cleanupTempCookieFile } from '../../utils/cookie';

const execAsync = promisify(exec);

// GET方法处理SSE连接，提供实时进度更新
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');
  const cookieStr = searchParams.get('cookie') || '';

  if (!url) {
    return NextResponse.json({ error: 'URL is required' }, { status: 400 });
  }

  // 创建一个TransformStream用于发送SSE事件
  const { readable, writable } = new TransformStream();
  const encoder = new TextEncoder();

  const sendProgress = async (writer: WritableStreamDefaultWriter, progress: number) => {
    const data = JSON.stringify({ progress });
    await writer.write(encoder.encode(`data: ${data}\n\n`));
  };

  const sendComplete = async (writer: WritableStreamDefaultWriter, info: {
    title: string;
    thumbnail: string;
    duration: number;
    audioUrl: string;
  }) => {
    const data = JSON.stringify({ complete: true, info });
    await writer.write(encoder.encode(`data: ${data}\n\n`));
    await writer.close();
  };

  // 在后台处理视频提取
  const processVideo = async () => {
    const writer = writable.getWriter();
    let cookiePath = '';
    
    try {
      // 发送初始进度
      await sendProgress(writer, 10);
      
      // 如果有cookie，写入临时文件
      if (cookieStr) {
        cookiePath = await writeCookieToTempFile(cookieStr);
      }
      
      // 使用cookie路径或默认cookie文件
      const cookieOption = cookiePath || 'public/cookie';

      // 获取视频信息
      const { stdout } = await execAsync(`yt-dlp -j --cookies ${cookieOption} ${url}`);
      const info = JSON.parse(stdout);
      await sendProgress(writer, 30);

      // 获取音频URL
      const ytDlp = spawn('yt-dlp', [
        '-f', 'bestaudio',
        '-g',
        '--cookies', cookieOption,
        url
      ]);

      let audioUrl = '';
      for await (const data of ytDlp.stdout) {
        audioUrl += data.toString();
        await sendProgress(writer, 60);
      }

      // 处理完成，发送100%进度和结果
      await sendProgress(writer, 100);
      
      // 发送完成信息和音频数据
      await sendComplete(writer, {
        title: info.title,
        thumbnail: info.thumbnail,
        duration: info.duration,
        audioUrl: audioUrl.trim()
      });
    } catch (error) {
      console.error('Error extracting audio:', error);
      const errorData = JSON.stringify({ error: 'Failed to extract audio' });
      await writer.write(encoder.encode(`data: ${errorData}\n\n`));
      await writer.close();
    } finally {
      // 清理临时cookie文件
      if (cookiePath) {
        await cleanupTempCookieFile(cookiePath);
      }
    }
  };

  // 启动处理过程
  processVideo().catch(console.error);

  // 返回SSE响应
  return new Response(readable as unknown as BodyInit, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    }
  });
}

export async function POST(request: Request) {
  let cookiePath = '';
  
  try {
    const { url, cookie } = await request.json();

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }
    
    // 如果有cookie，写入临时文件
    if (cookie) {
      cookiePath = await writeCookieToTempFile(cookie);
    }
    
    // 使用cookie路径或默认cookie文件
    const cookieOption = cookiePath || 'public/cookie.txt';

    // 使用yt-dlp获取视频信息
    const { stdout } = await execAsync(`yt-dlp -j --cookies ${cookieOption} ${url}`);
    const info = JSON.parse(stdout);

    // 获取音频URL
    const ytDlp = spawn('yt-dlp', [
      '-f', 'bestaudio',
      '-g',  // 获取直接下载URL
      '--cookies', cookieOption,
      url
    ]);

    let audioUrl = '';
    for await (const data of ytDlp.stdout) {
      audioUrl += data.toString();
    }

    // 返回视频信息和音频URL
    return NextResponse.json({
      title: info.title,
      thumbnail: info.thumbnail,
      duration: info.duration,
      audioUrl: audioUrl.trim()
    })
  } catch (error) {
    console.error('Error extracting audio:', error);
    return NextResponse.json(
      { error: 'Failed to extract audio' },
      { status: 500 }
    );
  } finally {
    // 清理临时cookie文件
    if (cookiePath) {
      await cleanupTempCookieFile(cookiePath);
    }
  }
}