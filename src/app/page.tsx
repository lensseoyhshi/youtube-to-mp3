'use client';

import { useState, useEffect } from 'react';
import { ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import { YouTubeLogo } from '@/components/YouTubeLogo';
import { Footer } from '@/components/Footer';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MouseEvent } from 'react';

const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL;

// 在文件顶部添加这些接口定义
interface ConvertResponse {
  fileId: string;
  status: string;
  statusUrl: string;
  success: boolean;
  taskId: string;
  error?: string;  // Optional error field
}

interface StatusResponse {
  downloadUrl: string;
  fileId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  success: boolean;
  title: string;
  error?: string;
}

export default function Home() {
  const router = useRouter();
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(0); // 添加进度状态
  const [audioInfo, setAudioInfo] = useState<{
    audioUrl: string;
    title: string;
  } | null>(null);
  const [isNavigationBlocked, setIsNavigationBlocked] = useState(false);

  // 修改函数定义
  // 添加导航阻止功能
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isNavigationBlocked) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isNavigationBlocked]);

  // 在加载状态改变时更新导航阻止状态
  useEffect(() => {
    setIsNavigationBlocked(loading);
  }, [loading]);


  // 处理内部导航链接点击
  // 修改 handleLinkClick 函数的类型定义
  const handleLinkClick = (e: MouseEvent<HTMLAnchorElement>, href: string): void => {
    if (loading) {
      e.preventDefault();
      if (confirm('转换过程正在进行中，离开页面将中断转换。确定要离开吗？')) {
        // 用户确认离开
        setLoading(false); // 停止加载状态
        router.push(href);
      }
    }
    // 如果不在加载状态，正常导航
  };

  // 创建自定义链接组件来处理导航
  // 修改 NavLink 组件
  const NavLink = ({ href, className, children }: { href: string, className?: string, children: React.ReactNode }) => {
    return (
        <Link
            href={href}
            className={className}
            onClick={(e) => handleLinkClick(e as MouseEvent<HTMLAnchorElement>, href)}
        >
          {children}
        </Link>
    );
  };

  // 添加状态轮询函数
  const pollStatus = async (fileId: string): Promise<StatusResponse> => {
    try {
      const response = await fetch(`${baseURL}/api/status/${fileId}`);
      const data = await response.json() as StatusResponse;

      if (!data.success) {
        throw new Error(data.error || 'Conversion failed');
      }

      if (data.status === 'pending' || data.status === 'processing') {
        setProgress((prev) => Math.min(prev + 10, 90));
        await new Promise(resolve => setTimeout(resolve, 10000));
        return pollStatus(fileId);
      } else if (data.status === 'completed') {
        setProgress(100);
        return data;
      } else if (data.status === 'failed') {
        throw new Error('Conversion failed');
      }

      throw new Error('Unknown status');
    } catch (err) {
      throw err;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!url.trim()) {
      setError('Please paste a YouTube URL to convert');
      return;
    }

    if (!isValidYouTubeUrl(url)) {
      setError('Invalid YouTube URL. Please check and try again');
      return;
    }

    setLoading(true);
    setError('');
    setAudioInfo(null);
    setProgress(0);

    try {
      // 第一步：发起转换请求
      const response = await fetch(`${baseURL}/api/convert`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url })
      });

      if (!response.ok) {
        throw new Error('Failed to start conversion');
      }

      const data = await response.json() as ConvertResponse;
      if (!data.success) {
        throw new Error(data.error || 'Conversion failed');
      }

      // 第二步：开始轮询状态
      setProgress(10);
      const statusResult = await pollStatus(data.fileId);

      // 第三步：设置下载信息
      setAudioInfo({
        audioUrl: statusResult.downloadUrl,
        title: statusResult.title,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error converting audio');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    try {
      if (!audioInfo?.audioUrl) {
        throw new Error('Audio URL not found');
      }
      window.location.href = `${baseURL}${audioInfo.audioUrl}`;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error downloading audio');
    }
  };

  // 添加 YouTube URL 验证函数
  const isValidYouTubeUrl = (url: string) => {
    const pattern = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)[a-zA-Z0-9_-]{11}$/;
    return pattern.test(url);
  };

  return (
      <div className="min-h-screen bg-white text-black flex flex-col">
        {/* 添加结构化数据 */}
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "WebApplication",
                "name": "YouTube to MP3 Converter",
                "applicationCategory": "MultimediaApplication",
                "operatingSystem": "Web",
                "offers": {
                  "@type": "Offer",
                  "price": "0",
                  "priceCurrency": "USD"
                },
                "description": "Free online YouTube to MP3 converter. Extract high-quality audio from YouTube videos with one click.",
                "url": "https://www.youtube-to-mp3.net"
              })
            }}
        />

        {/* 添加导航栏 */}
        <nav>
          <div>
            <div className="flex justify-between h-16">
              <div className="flex">
                <div className="hidden sm:ml-6 sm:flex sm:space-x-10">
                  <NavLink href="/" className="border-b-2 border-red-600 text-gray-900 inline-flex items-center px-1 pt-1 text-lg">
                    Home
                  </NavLink>

                  <NavLink href="/mp4" className="border-transparent text-gray-700 hover:text-gray-900 hover:border-gray-300 inline-flex items-center px-1 pt-1 border-b-2 text-lg">
                    MP4
                  </NavLink>
                  <NavLink href="/app" className="border-transparent text-gray-700 hover:text-gray-900 hover:border-gray-300 inline-flex items-center px-1 pt-1 border-b-2 text-lg">
                    APP
                  </NavLink>
                  <NavLink href="/blog" className="border-transparent text-gray-700 hover:text-gray-900 hover:border-gray-300 inline-flex items-center px-1 pt-1 border-b-2 text-lg ">
                    Blog
                  </NavLink>
                  {/* <NavLink href="/changelog" className="border-transparent text-gray-700 hover:text-gray-900 hover:border-gray-300 inline-flex items-center px-1 pt-1 border-b-2 text-lg">
                  Log
                </NavLink>
                <NavLink href="/about" className="border-transparent text-gray-700 hover:text-gray-900 hover:border-gray-300 inline-flex items-center px-1 pt-1 border-b-2 text-lg">
                  About
                </NavLink> */}
                </div>
              </div>

              {/* 添加收藏按钮 */}
              <div className="flex items-center space-x-4 mr-6">
                <button
                    onClick={() => {
                      alert('Press Ctrl+D (Windows) or Command+D (Mac) to bookmark this site');
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-full hover:bg-red-100 transition-colors text-sm font-medium"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                  </svg>
                  Bookmark & Stay Updated
                </button>

                {/* 电报群链接移到这里并调整样式 */}
                <a
                    href="https://t.me/youtube2mpx"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 transition-colors text-sm font-medium"
                >
                  <svg className="h-4 w-4" fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.248-1.97 9.296c-.146.658-.537.818-1.084.51l-3-2.21-1.446 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.121l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.534-.197 1.001.13.832.924z"/>
                  </svg>
                  Telegram
                </a>
              </div>
            </div>
          </div>
        </nav>

        <div className="max-w-4xl w-full mx-auto mt-[8vh] px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-white bg-white select-none absolute m-2">youtube to mp3 converter</h1>
            <div className="flex items-center justify-center gap-3 mb-8">
              <span className="text-5xl font-bold text-red-600">YouTube</span>
              <div className="w-16">
                <YouTubeLogo />
              </div>
              <span className="text-5xl font-bold text-red-600">MP3</span>
            </div>

            <form onSubmit={handleSubmit} noValidate>
              <div className="flex sm:flex-row mt-[3vh]">
                <input
                    type="text"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder={url.trim() ? "Please enter a valid YouTube URL" : "Paste YouTube URL here to convert to MP3"}
                    className={`flex-1 px-10 py-3 rounded-l-md border-2 ${!url.trim() || isValidYouTubeUrl(url) ? 'border-black' : 'border-red-500'} bg-white text-black focus:ring-1 focus:ring-black focus:outline-none`}
                />
                <button
                    type="submit"
                    className="px-6 py-3 bg-black text-white rounded-r-md hover:bg-gray-800 focus:outline-none transition-colors duration-200 font-medium whitespace-nowrap border border-l-0 border-black"
                >
                  {loading ? 'Converting...' : 'Convert to MP3'}
                </button>
              </div>
            </form>
          </div>

          {/* 添加进度条 */}
          {loading && (
              <div className="mt-6">
                <div className="w-full bg-gray-200 rounded-full h-1.5 mb-2">
                  <div
                      className="bg-black h-1.5 rounded-full transition-all duration-300 ease-in-out"
                      style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 text-center">
                  {progress === 0 ? 'Initializing...' : `Progress: ${progress}%`}
                </p>
              </div>
          )}

          {error && (
              <div className="mt-6 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
          )}

          {audioInfo && (
              <div className="mt-8 bg-white rounded-md border border-gray-200 shadow-md p-4">
                <div className="flex flex-col">
                  <h3 className="text-lg font-medium text-black mb-3">
                    {audioInfo.title}
                  </h3>
                  <div className="flex justify-start">
                    <button
                        onClick={handleDownload}
                        className="inline-flex items-center gap-2 px-3 py-1.5 bg-black text-white rounded-md hover:bg-gray-800 focus:outline-none transition-colors duration-200 text-sm font-medium"
                    >
                      <ArrowDownTrayIcon className="w-4 h-4" />
                      Download MP3
                    </button>
                  </div>
                </div>
              </div>
          )}

          {/* 添加热门下载部分 - 使用热门搜索关键词 */}
          <div className="mt-16">
            <h2 className="text-xl mb-4 text-l">Youtube Trends</h2>
            <div className="grid grid-cols-2 gap-4">
              {/* 使用热门搜索关键词替换原有内容 */}
              <a
                  href="https://www.youtube.com/results?search_query=youtube+to+mp3+converter+free"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-3 hover:bg-gray-50 transition-colors"
              >
                <p className="text-sm text-gray-800 truncate font-medium">
                  <span className="font-bold mr-2">1.</span>
                  YouTube to MP3 Converter Free
                </p>
              </a>
              <a
                  href="https://www.youtube.com/results?search_query=youtube+to+mp3+download"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-3 hover:bg-gray-50 transition-colors"
              >
                <p className="text-sm text-gray-800 truncate font-medium">
                  <span className="font-bold mr-2">2.</span>
                  YouTube to MP3 Download
                </p>
              </a>
              <a
                  href="https://www.youtube.com/results?search_query=youtube+to+mp3+320kbps"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-3 hover:bg-gray-50 transition-colors"
              >
                <p className="text-sm text-gray-800 truncate font-medium">
                  <span className="font-bold mr-2">3.</span>
                  YouTube to MP3 320kbps
                </p>
              </a>
              <a
                  href="https://www.youtube.com/results?search_query=youtube+video+to+mp3+converter"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-3 hover:bg-gray-50 transition-colors"
              >
                <p className="text-sm text-gray-800 truncate font-medium">
                  <span className="font-bold mr-2">4.</span>
                  YouTube Video to MP3 Converter
                </p>
              </a>
              <a
                  href="https://www.youtube.com/results?search_query=youtube+to+mp3+download"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-3 hover:bg-gray-50 transition-colors"
              >
                <p className="text-sm text-gray-800 truncate font-medium">
                  <span className="font-bold mr-2">5.</span>
                  YouTube to MP3 Download
                </p>
              </a>
              <a
                  href="https://www.youtube.com/results?search_query=youtube+music+to+mp3"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-3 hover:bg-gray-50 transition-colors"
              >
                <p className="text-sm text-gray-800 truncate font-medium">
                  <span className="font-bold mr-2">6.</span>
                  YouTube Music to MP3
                </p>
              </a>
            </div>
          </div>

          {/* 新增 What is YouTube to MP3 部分 */}
          <div className="mt-24" id="what-is">
            <h2 className="text-2xl mb-6">What is YouTube to MP3 Converter?</h2>
            <div className="bg-gray-50 rounded-lg p-6 shadow-sm border border-gray-100">
              <p className="text-gray-700 mb-4">
                YouTube to MP3 Converter is an online tool that extracts audio from YouTube videos and converts it into MP3 format. With features like high-quality 320kbps conversion, safe and free downloads, and support for long videos and playlists, it lets you easily transform your favorite YouTube content into portable audio files for offline listening. This converter—often described as a fast, reliable, and user-friendly solution is perfect for anyone looking to convert YouTube videos to MP3 quickly and securely.
              </p>
            </div>
          </div>

          {/* 优化 Features 部分 - 增加关键词密度 */}
          <div className="mt-16" id="features">
            <h2 className="text-2xl mb-8">YouTube to MP3 Converter Benefits & Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2 text-center">Fast YouTube to MP3 Conversion</h3>
                <p className="text-gray-700 text-center">
                  Convert YouTube videos to MP3 in seconds with our free YouTube to MP3 converter. Download YouTube to MP3 faster than any other converter.
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2 text-center">320kbps High Quality MP3</h3>
                <p className="text-gray-700 text-center">
                  Our YouTube to MP3 320kbps converter delivers premium audio quality. Convert YouTube to MP3 320kbps for the best sound experience.
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2 text-center">Safe YouTube to MP3 Download</h3>
                <p className="text-gray-700 text-center">
                  Our safe YouTube to MP3 converter requires no registration or software installation. Download YouTube to MP3 securely every time.
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2 text-center">YouTube Video to MP3 Online</h3>
                <p className="text-gray-700 text-center">
                  Convert YouTube video to MP3 online without any software. Our YouTube to MP3 online converter works directly in your browser.
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2 text-center">YouTube Music to MP3</h3>
                <p className="text-gray-700 text-center">
                  Download YouTube music to MP3 format on any device. Our YouTube to MP3 converter works on mobile, tablet, and desktop.
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2 text-center">Free YouTube to MP3 Converter</h3>
                <p className="text-gray-700 text-center">
                  Our free YouTube to MP3 converter supports all video formats. Convert YouTube to MP3 free with no limits on file size or conversion time.
                </p>
              </div>
            </div>
          </div>

          {/* 新增 How to Use 部分 */}
          <div className="mt-16" id="how-to">
            <h2 className="text-2xl mb-8">How to Convert YouTube to MP3 Online</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 relative">
                <div className="absolute -top-4 -left-4 w-10 h-10 bg-red-500 rounded-full flex items-center justify-center text-white font-bold text-lg">1</div>
                <h3 className="text-lg font-semibold mb-3 mt-2">Copy YouTube Video URL</h3>
                <p className="text-gray-700">
                  Find your favorite YouTube video and copy the YouTube URL from your browser. Our YouTube to MP3 converter supports all YouTube video formats and links.
                </p>
                <div className="mt-4 bg-gray-50 p-3 rounded-md border border-gray-100">
                  <code className="text-sm text-gray-600">https://www.youtube.com/watch?v=...</code>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 relative">
                <div className="absolute -top-4 -left-4 w-10 h-10 bg-red-500 rounded-full flex items-center justify-center text-white font-bold text-lg">2</div>
                <h3 className="text-lg font-semibold mb-3 mt-2">Paste & Convert YouTube to MP3</h3>
                <p className="text-gray-700">
                  Paste the YouTube link into our free YouTube to MP3 converter box above and click the &rdquo;Convert to MP3&rdquo; button to start the conversion process.
                </p>
                <div className="mt-4 flex justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 relative">
                <div className="absolute -top-4 -left-4 w-10 h-10 bg-red-500 rounded-full flex items-center justify-center text-white font-bold text-lg">3</div>
                <h3 className="text-lg font-semibold mb-3 mt-2">Download High Quality MP3</h3>
                <p className="text-gray-700">
                  Once the YouTube to MP3 conversion is complete, click the &rdquo;Download MP3&rdquo; button to save the 320kbps high-quality MP3 file to your device for offline listening.
                </p>
                <div className="mt-4 flex justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* 新增 Why Choose Us 部分 */}
          <div className="mt-16" id="why-choose">
            <h2 className="text-2xl mb-8">Why Choose Our YouTube to MP3 Download Converter</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold mb-3 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  High Quality YouTube to MP3 Download
                </h3>
                <p className="text-gray-700">
                  Our YouTube to MP3 download service provides 320kbps high-quality audio conversion, ensuring you get the best possible audio experience from YouTube videos with crystal-clear sound.
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold mb-3 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  No Software Required for YouTube MP3 Download
                </h3>
                <p className="text-gray-700">
                  Our web-based YouTube to MP3 download converter works directly in your browser, eliminating the need to download and install potentially risky software on your device.
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold mb-3 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Privacy-Protected MP3 Download Service
                </h3>
                <p className="text-gray-700">
                  We do not store your YouTube to MP3 download files or personal information. Once you download your MP3 file, it is immediately removed from our servers for complete privacy.
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold mb-3 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Cross-Platform YouTube MP3 Download
                </h3>
                <p className="text-gray-700">
                  Our YouTube to MP3 download converter supports all major platforms including Windows, Mac, iOS, and Android, allowing you to easily download YouTube MP3s on any device.
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold mb-3 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  User-Friendly YouTube Download Interface
                </h3>
                <p className="text-gray-700">
                  Our simple, intuitive design makes YouTube to MP3 download conversion quick and hassle-free, even for first-time users looking to download music from YouTube.
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold mb-3 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Fast & Reliable MP3 Download Servers
                </h3>
                <p className="text-gray-700">
                  Our powerful cloud infrastructure ensures quick processing times and reliable YouTube to MP3 download conversions, even during peak usage periods for consistent performance.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-2 pt-24 mb-4">
            <h2 className="text-2xl mb-8">Frequently Asked Questions About YouTube to MP3 Download</h2>
            <div className="bg-gray-50 p-8 rounded-lg border border-gray-100">
              <div className="space-y-4">
                {/* FAQ Item 1 */}
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <button
                      className="w-full px-6 py-4 text-left bg-white hover:bg-gray-50 flex justify-between items-center transition-colors"
                      onClick={(e) => {
                        const content = e.currentTarget.nextElementSibling;
                        if (content) {
                          content.classList.toggle('hidden');
                          const icon = e.currentTarget.querySelector('.faq-icon');
                          if (icon) {
                            icon.classList.toggle('rotate-180');
                          }
                        }
                      }}
                  >
                    <h3 className="font-medium text-lg">How to download YouTube to MP3 in high quality?</h3>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 faq-icon transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <div className="hidden px-6 py-4 bg-gray-50 border-t border-gray-200">
                    <p className="text-gray-700">
                      Downloading YouTube to MP3 with our free converter is incredibly simple and takes just a few steps:
                    </p>
                    <ol className="list-decimal pl-5 mt-2 space-y-2 text-gray-700">
                      <li>Copy the YouTube video URL from your browser&rsquo;s address bar.</li>
                      <li>Paste the URL into our YouTube to MP3 converter box at the top of this page.</li>
                      <li>Click the &rsquo;Convert to MP3&rsquo; button and wait for the YouTube to MP3 conversion to complete.</li>
                      <li>Once finished, click the &rsquo;Download MP3&rsquo; button to save the high-quality 320kbps MP3 file to your device.</li>
                    </ol>
                    <p className="mt-3 text-gray-700">
                      The entire YouTube to MP3 download process typically takes less than a minute, depending on the length of the video. Our YouTube to MP3 converter works with all YouTube videos and supports high-quality 320kbps audio output for the best listening experience.
                    </p>
                  </div>
                </div>

                {/* FAQ Item 2 */}
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <button
                      className="w-full px-6 py-4 text-left bg-white hover:bg-gray-50 flex justify-between items-center transition-colors"
                      onClick={(e) => {
                        const content = e.currentTarget.nextElementSibling;
                        if (content) {
                          content.classList.toggle('hidden');
                          const icon = e.currentTarget.querySelector('.faq-icon');
                          if (icon) {
                            icon.classList.toggle('rotate-180');
                          }
                        }
                      }}
                  >
                    <h3 className="font-medium text-lg">What is the quality of YouTube to MP3 downloads?</h3>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 faq-icon transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <div className="hidden px-6 py-4 bg-gray-50 border-t border-gray-200">
                    <p className="text-gray-700">
                      YouTube to MP3 download converter provides high-quality audio output at up to 320kbps bitrate, which is the highest quality available for MP3 format. This ensures that:
                    </p>
                    <ul className="list-disc pl-5 mt-2 space-y-2 text-gray-700">
                      <li>The audio clarity and detail from the original YouTube video are preserved in your MP3 download</li>
                      <li>Music sounds crisp and full when you download YouTube to MP3, with clear highs and deep bass</li>
                      <li>Spoken content like podcasts and lectures remains clear and intelligible after YouTube to MP3 conversion</li>
                      <li>The MP3 file size remains reasonable while maintaining excellent audio quality</li>
                    </ul>
                    <p className="mt-3 text-gray-700">
                      320kbps is considered audiophile quality for MP3 files and is suitable for listening on high-end audio equipment. Most streaming services use 128-256kbps, so our YouTube to MP3 download quality at 320kbps exceeds industry standards.
                    </p>
                  </div>
                </div>

                {/* FAQ Item 3 */}
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <button
                      className="w-full px-6 py-4 text-left bg-white hover:bg-gray-50 flex justify-between items-center transition-colors"
                      onClick={(e) => {
                        const content = e.currentTarget.nextElementSibling;
                        if (content) {
                          content.classList.toggle('hidden');
                          const icon = e.currentTarget.querySelector('.faq-icon');
                          if (icon) {
                            icon.classList.toggle('rotate-180');
                          }
                        }
                      }}
                  >
                    <h3 className="font-medium text-lg">How to download YouTube music to MP3 on iPhone?</h3>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 faq-icon transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <div className="hidden px-6 py-4 bg-gray-50 border-t border-gray-200">
                    <p className="text-gray-700">
                      Downloading YouTube to MP3 on an iPhone is straightforward with our web-based YouTube to MP3 converter:
                    </p>
                    <ol className="list-decimal pl-5 mt-2 space-y-2 text-gray-700">
                      <li>Open Safari browser on your iPhone and visit our YouTube to MP3 download website</li>
                      <li>Open the YouTube app, find your desired video, and tap the &rsquo;Share&rsquo; button</li>
                      <li>Select &rsquo;Copy Link&rsquo; to copy the YouTube video URL</li>
                      <li>Return to our YouTube to MP3 converter in Safari and paste the URL into the conversion box</li>
                      <li>Tap &rsquo;Convert to MP3&rsquo; and wait for the YouTube to MP3 download process to complete</li>
                      <li>When finished, tap &rsquo;Download MP3&rsquo; to save the file to your iPhone</li>
                      <li>The MP3 file will download to your Files app, where you can play it or move it to your Music app</li>
                    </ol>
                    <p className="mt-3 text-gray-700">
                      YouTube to MP3 converter works directly in your browser, so there&rsquo;s no need to install any apps. This makes it the easiest way to download YouTube audio on iOS devices. The downloaded MP3 files can be played offline anytime.
                    </p>
                  </div>
                </div>

                {/* FAQ Item 4 */}
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <button
                      className="w-full px-6 py-4 text-left bg-white hover:bg-gray-50 flex justify-between items-center transition-colors"
                      onClick={(e) => {
                        const content = e.currentTarget.nextElementSibling;
                        if (content) {
                          content.classList.toggle('hidden');
                          const icon = e.currentTarget.querySelector('.faq-icon');
                          if (icon) {
                            icon.classList.toggle('rotate-180');
                          }
                        }
                      }}
                  >
                    <h3 className="font-medium text-lg">Is this YouTube to MP3 download converter safe to use?</h3>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 faq-icon transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <div className="hidden px-6 py-4 bg-gray-50 border-t border-gray-200">
                    <p className="text-gray-700">
                      Yes, YouTube to MP3 download converter is completely safe to use. We&rsquo;ve implemented several security measures to ensure user safety:
                    </p>
                    <ul className="list-disc pl-5 mt-2 space-y-2 text-gray-700">
                      <li>No software installation required - our YouTube to MP3 converter works directly in your browser</li>
                      <li>No account registration needed - download YouTube to MP3 anonymously</li>
                      <li>We don&rsquo;t store your converted MP3 files on our servers - files are deleted after download</li>
                      <li>No personal data collection - we respect your privacy when you download YouTube to MP3</li>
                      <li>Secure HTTPS connection - all YouTube to MP3 download transfers are encrypted</li>
                      <li>No ads with malicious code or misleading download buttons</li>
                    </ul>
                    <p className="mt-3 text-gray-700">
                      YouTube to MP3 download converter is trusted by millions of users worldwide. We focus on providing a clean, straightforward service without the security risks often associated with downloadable converter software or less reputable YouTube to MP3 websites.
                    </p>
                  </div>
                </div>

                {/* FAQ Item 5 */}
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <button
                      className="w-full px-6 py-4 text-left bg-white hover:bg-gray-50 flex justify-between items-center transition-colors"
                      onClick={(e) => {
                        const content = e.currentTarget.nextElementSibling;
                        if (content) {
                          content.classList.toggle('hidden');
                          const icon = e.currentTarget.querySelector('.faq-icon');
                          if (icon) {
                            icon.classList.toggle('rotate-180');
                          }
                        }
                      }}
                  >
                    <h3 className="font-medium text-lg">Can I download YouTube playlists to MP3?</h3>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 faq-icon transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <div className="hidden px-6 py-4 bg-gray-50 border-t border-gray-200">
                    <p className="text-gray-700">
                      While our YouTube to MP3 download converter is optimized for individual YouTube videos, you can convert videos from playlists one by one. Here&rsquo;s how to efficiently download multiple YouTube videos to MP3:
                    </p>
                    <ol className="list-decimal pl-5 mt-2 space-y-2 text-gray-700">
                      <li>Open the YouTube playlist in your browser</li>
                      <li>Copy the URL of the first video you want to download to MP3</li>
                      <li>Paste it into our YouTube to MP3 converter and start the conversion</li>
                      <li>While the first video is converting, you can prepare the next video URL</li>
                      <li>After downloading the first MP3, paste the next URL and repeat the YouTube to MP3 download process</li>
                    </ol>
                    <p className="mt-3 text-gray-700">
                      This method allows you to download multiple YouTube videos to MP3 efficiently. Each MP3 file will be named according to the original YouTube video title, making it easy to organize your music collection. For frequent users who need to convert many videos, we recommend bookmarking our YouTube to MP3 download site for quick access.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 添加页脚 */}
        <Footer />
      </div>
  );
}
