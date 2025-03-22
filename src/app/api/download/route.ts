import { NextResponse } from 'next/server';
import ytdl from 'ytdl-core';
import { Readable } from 'stream';

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
    
    // 使用ytdl-core下载音频
    const audioStream = ytdl(url, { 
      quality: 'highestaudio',
      filter: 'audioonly'
    });
    
    // 创建一个可读流
    const stream = new Readable({
      read() {
        // 实现read方法
      }
    });
    
    // 处理ytdl-core输出
    audioStream.on('data', (chunk) => {
      stream.push(chunk);
    });
    
    audioStream.on('end', () => {
      stream.push(null);
    });
    
    audioStream.on('error', (error) => {
      console.error(`ytdl-core error: ${error}`);
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