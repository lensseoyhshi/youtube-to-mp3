import { NextResponse } from 'next/server';
import { spawn } from 'child_process';
import { Readable } from 'stream';

export async function POST(request: Request) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    // 使用yt-dlp下载音频，添加cookies参数解决人机验证问题
    const ytDlp = spawn('yt-dlp', [
      '-f', 'bestaudio',
      '-o', '-',  // 输出到stdout
      '--cookies-from-browser', 'chrome',
      url
    ]);

    // 创建一个可读流
    const stream = new Readable({
      read() {
        // 实现read方法
      }
    });

    // 处理yt-dlp输出
    ytDlp.stdout.on('data', (chunk) => {
      stream.push(chunk);
    });

    ytDlp.stdout.on('end', () => {
      stream.push(null);
    });

    ytDlp.stderr.on('data', (data) => {
      console.error(`yt-dlp error: ${data}`);
    });

    // 设置响应头
    const headers = new Headers();
    headers.set('Content-Type', 'audio/mpeg');
    headers.set('Transfer-Encoding', 'chunked');

    // 返回音频流
    return new NextResponse(stream as unknown as ReadableStream, {
      headers,
    });
  } catch (error) {
    console.error('Error downloading audio:', error);
    return NextResponse.json(
      { error: '下载音频失败' },
      { status: 500 }
    );
  }
}