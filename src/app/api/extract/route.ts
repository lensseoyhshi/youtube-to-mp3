import { NextResponse } from 'next/server';
import ytdl from 'ytdl-core';

export async function POST(request: Request) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    // 验证URL是否为有效的YouTube链接
    if (!ytdl.validateURL(url)) {
      return NextResponse.json({ error: 'Invalid YouTube URL' }, { status: 400 });
    }

    // 获取视频信息
    const info = await ytdl.getInfo(url);
    const audioFormat = ytdl.chooseFormat(info.formats, { quality: 'highestaudio'  ,filter: 'audioonly'});

    // 返回音频流URL和视频信息
    return NextResponse.json({
      audioUrl: audioFormat.url,
      title: info.videoDetails.title,
      thumbnail: info.videoDetails.thumbnails[0].url,
      duration: info.videoDetails.lengthSeconds
    });
  } catch (error) {
    console.error('Error extracting audio:', error);
    return NextResponse.json(
      { error: 'Failed to extract audio' },
      { status: 500 }
    );
  }
}