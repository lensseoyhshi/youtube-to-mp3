import { NextResponse } from 'next/server';
import { TransformStream } from 'stream/web';
import ytdl from 'ytdl-core';

// 获取视频信息的辅助函数
async function getVideoInfo(url: string) {
  try {
    const info = await ytdl.getInfo(url);
    const audioFormat = ytdl.chooseFormat(info.formats, { quality: 'highestaudio' });
    
    return {
      title: info.videoDetails.title,
      thumbnail: info.videoDetails.thumbnails[info.videoDetails.thumbnails.length - 1].url,
      duration: parseInt(info.videoDetails.lengthSeconds),
      audioUrl: audioFormat.url
    };
  } catch (error) {
    console.error('Error getting video info:', error);
    throw error;
  }
}

// GET方法处理SSE连接，提供实时进度更新
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');

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
    try {
      // 发送初始进度
      await sendProgress(writer, 10);

      // 验证URL是否有效
      if (!ytdl.validateURL(url)) {
        throw new Error('无效的YouTube URL');
      }
      await sendProgress(writer, 30);

      // 获取视频信息和音频URL
      const info = await getVideoInfo(url);
      await sendProgress(writer, 60);

      // 处理完成，发送100%进度和结果
      await sendProgress(writer, 100);
      
      // 发送完成信息和音频数据
      await sendComplete(writer, info);
    } catch (error) {
      console.error('Error extracting audio:', error);
      const errorData = JSON.stringify({ error: 'Failed to extract audio' });
      await writer.write(encoder.encode(`data: ${errorData}\n\n`));
      await writer.close();
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
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    // 验证URL是否有效
    if (!ytdl.validateURL(url)) {
      return NextResponse.json({ error: '无效的YouTube URL' }, { status: 400 });
    }

    // 使用ytdl-core获取视频信息和音频URL
    const info = await getVideoInfo(url);

    // 返回视频信息和音频URL
    return NextResponse.json(info)
  } catch (error) {
    console.error('Error extracting audio:', error);
    return NextResponse.json(
      { error: 'Failed to extract audio' },
      { status: 500 }
    );
  }
}