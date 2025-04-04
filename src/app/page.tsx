'use client';

// Remove unused Head import
import { useState } from 'react';
import { ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import { YouTubeLogo } from '@/components/YouTubeLogo';
import { Footer } from '@/components/Footer';
import Link from 'next/link';


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
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(0); // 添加进度状态
  const [audioInfo, setAudioInfo] = useState<{
    audioUrl: string;
    title: string;
  } | null>(null);
  
  // 添加热门视频数据
  const [popularVideos] = useState([
    { id: 'dQw4w9WgXcQ', title: 'Rick Astley - Never Gonna Give You Up' },
    { id: 'kJQP7kiw5Fk', title: 'Luis Fonsi - Despacito ft. Daddy Yankee' },
    { id: 'RgKAFK5djSk', title: 'Wiz Khalifa - See You Again ft. Charlie Puth' },
    { id: '9bZkp7q19f0', title: 'PSY - GANGNAM STYLE(강남스타일)' },
    { id: 'OPf0YbXqDm0', title: 'Mark Ronson - Uptown Funk ft. Bruno Mars' },
    { id: 'fRh_vgS2dFE', title: 'Justin Bieber - Sorry (PURPOSE)' },
  ]);

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
          <div >
            <div className="flex justify-between h-16">
              <div className="flex">
                <div className="hidden sm:ml-6 sm:flex sm:space-x-10">
                  <Link href="/" className="border-b-2 border-red-600 text-gray-900 inline-flex items-center px-1 pt-1 text-lg">
                    Home
                  </Link>
                
                  <Link href="/mp4" className="border-transparent text-gray-700 hover:text-gray-900 hover:border-gray-300 inline-flex items-center px-1 pt-1 border-b-2 text-lg">
                  MP4
                </Link>
                <Link href="/app" className="border-transparent text-gray-700 hover:text-gray-900 hover:border-gray-300 inline-flex items-center px-1 pt-1 border-b-2 text-lg">
                  APP
                </Link>
                <Link href="/blog" className="border-transparent text-gray-700 hover:text-gray-900 hover:border-gray-300 inline-flex items-center px-1 pt-1 border-b-2 text-lg ">
                    Blog
                  </Link>
                  {/* <Link href="/changelog" className="border-transparent text-gray-700 hover:text-gray-900 hover:border-gray-300 inline-flex items-center px-1 pt-1 border-b-2 text-lg">
                    Log
                  </Link>
                  <Link href="/about" className="border-transparent text-gray-700 hover:text-gray-900 hover:border-gray-300 inline-flex items-center px-1 pt-1 border-b-2 text-lg">
                    About
                  </Link> */}
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
      
        <div className="max-w-4xl w-full mx-auto mt-[10vh] px-4 sm:px-6 lg:px-8">
          <div className="text-center">
          <h1 className="text-white bg-white select-none absolute  m-2">youtube to mp3 converter</h1>
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

             {/* 添加热门下载部分 */}
             <div className="mt-16">
            <h2 className="text-xl font-semibold mb-4 text-l">Convert Trends</h2>
            <div className="grid grid-cols-2 gap-4">
              {popularVideos.map((video, index) => (
                <a 
                  key={video.id} 
                  href={`https://www.youtube.com/watch?v=${video.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-3 hover:bg-gray-50 transition-colors"
                >
                  <p className="text-sm text-gray-800 truncate font-medium">
                    <span className="font-bold mr-2">{index + 1}.</span>
                    {video.title}
                  </p>
                </a>
              ))}
            </div>
          </div>


                  {/* 添加免责声明 */}
      <div className="mt-[10vh]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
          <p className="text-gray-500 text-sm text-center">
            For technical exchange, illegal activities are strictly prohibited!
          </p>
        </div>
      </div>
          
          {/* 网站介绍部分 - 增加更大的上边距确保在首屏之外 */}
          <div className="mt-148 pt-24 mb-16 border-t border-gray-400">
            <h2 className="text-2xl font-bold mb-8 text-center">Best YouTube to MP3 Converter Online</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-16">
              <div>
                <h3 className="text-xl font-semibold mb-4">Free YouTube to MP3 Converter - 320kbps High Quality</h3>
                <p className="text-gray-700 mb-4">
                  Our YouTube to MP3 converter is the perfect tool for music enthusiasts, offering free conversion of YouTube videos to high-quality 320kbps MP3 files with just one click.
                </p>
                <p className="text-gray-700">
                  Whether you need to download YouTube music, podcasts, or lectures, our online converter helps you extract audio content safely and efficiently for offline enjoyment anytime, anywhere.
                </p>
              </div>
              <div className="bg-gray-50 p-6 rounded-lg shadow-sm border border-gray-100">
                <div className="aspect-video bg-red-50 rounded-md flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <div className="flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2 text-center">Fast & Free Conversion</h3>
                <p className="text-gray-700 text-center">
                  Convert YouTube videos to MP3 in seconds with our lightning-fast servers. Download YouTube audio to MP3 format completely free, with no registration required.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <div className="flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2 text-center">320kbps High-Quality Audio</h3>
                <p className="text-gray-700 text-center">
                  Our YouTube to MP3 converter delivers premium 320kbps audio quality, preserving the original sound clarity and detail for the best listening experience.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <div className="flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2 text-center">Safe & Reliable</h3>
                <p className="text-gray-700 text-center">
                  We value user privacy and do not store your personal information or converted content, ensuring a safe and reliable experience.
                </p>
              </div>
            </div>
            <h2 className="text-2xl font-bold mb-8 text-center">Questions About Youtube To MP3</h2>
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
                    <h3 className="font-medium text-lg">How to convert YouTube videos to MP3?</h3>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 faq-icon transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <div className="hidden px-6 py-4 bg-gray-50 border-t border-gray-200">
                    <p className="text-gray-700">
                      Converting YouTube videos to MP3 with our tool is incredibly simple and takes just a few steps:
                    </p>
                    <ol className="list-decimal pl-5 mt-2 space-y-2 text-gray-700">
                      <li>Copy the YouTube video URL from your browser&rsquo;s address bar.</li>
                      <li>Paste the URL into our converter box at the top of this page.</li>
                      <li>Click the &rsquo;Convert to MP3&rsquo; button and wait for the conversion to complete.</li>
                      <li>Once finished, click the &rsquo;Download MP3&rsquo; button to save the audio file to your device.</li>
                    </ol>
                    <p className="mt-3 text-gray-700">
                      The entire process typically takes less than a minute, depending on the length of the video. Our converter works with all YouTube videos and supports high-quality 320kbps audio output.
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
                    <h3 className="font-medium text-lg">What is the quality of the MP3 files?</h3>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 faq-icon transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <div className="hidden px-6 py-4 bg-gray-50 border-t border-gray-200">
                    <p className="text-gray-700">
                      Our YouTube to MP3 converter provides high-quality audio output at up to 320kbps bitrate, which is the highest quality available for MP3 format. This ensures that:
                    </p>
                    <ul className="list-disc pl-5 mt-2 space-y-2 text-gray-700">
                      <li>The audio clarity and detail from the original video are preserved</li>
                      <li>Music sounds crisp and full, with clear highs and deep bass</li>
                      <li>Spoken content like podcasts and lectures remains clear and intelligible</li>
                      <li>The file size remains reasonable while maintaining excellent audio quality</li>
                    </ul>
                    <p className="mt-3 text-gray-700">
                      320kbps is considered audiophile quality for MP3 files and is suitable for listening on high-end audio equipment. Most streaming services use 128-256kbps, so our 320kbps quality exceeds industry standards.
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
                      Converting YouTube videos to MP3 on an iPhone is straightforward with our web-based converter:
                    </p>
                    <ol className="list-decimal pl-5 mt-2 space-y-2 text-gray-700">
                      <li>Open Safari browser on your iPhone and visit our website</li>
                      <li>Open the YouTube app, find your desired video, and tap the &rsquo;Share&rsquo; button</li>
                      <li>Select &rsquo;Copy Link&rsquo; to copy the video URL</li>
                      <li>Return to our converter in Safari and paste the URL into the conversion box</li>
                     
                      <p className="text-gray-700">
                        Click &quot;Convert to MP3&quot; and wait for the process to complete
                      </p>
                      
                      <p className="text-gray-700">
                        Click &quot;Share&quot; button
                      </p>
                      
                      <p className="text-gray-700">
                        Select &quot;Copy Link&quot; to copy the video URL
                      </p>
                      <li>Tap &rsquo;Convert to MP3&rsquo; and wait for the process to complete</li>
                      <li>When finished, tap &rsquo;Download MP3&rsquo; to save the file</li>
                      <li>The file will download to your Files app, where you can play it or move it to your Music app</li>
                    </ol>
                    <p className="mt-3 text-gray-700">
                      Our converter works directly in your browser, so there&rsquo;s no need to install any apps. This makes it the easiest way to download YouTube audio on iOS devices. The downloaded MP3 files can be played offline anytime.
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
                    <h3 className="font-medium text-lg">Is this YouTube to MP3 converter safe to use?</h3>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 faq-icon transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <div className="hidden px-6 py-4 bg-gray-50 border-t border-gray-200">
                    <p className="text-gray-700">
                      Yes, our YouTube to MP3 converter is completely safe to use. We&rsquo;ve implemented several security measures to ensure user safety:
                    </p>
                    <ul className="list-disc pl-5 mt-2 space-y-2 text-gray-700">
                      <li>No software installation required - everything works in your browser</li>
                      <li>No account registration needed - convert videos anonymously</li>
                      <li>We don&rsquo;t store your converted files on our servers - files are deleted after download</li>
                      <li>No personal data collection - we respect your privacy</li>
                      <li>Secure HTTPS connection - all data transfers are encrypted</li>
                      <li>No ads with malicious code or misleading download buttons</li>
                    </ul>
                    <p className="mt-3 text-gray-700">
                      Our converter is trusted by millions of users worldwide. We focus on providing a clean, straightforward service without the security risks often associated with downloadable converter software or less reputable websites.
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
                    <h3 className="font-medium text-lg">Can I convert YouTube playlists to MP3?</h3>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 faq-icon transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <div className="hidden px-6 py-4 bg-gray-50 border-t border-gray-200">
                    <p className="text-gray-700">
                      While our converter is optimized for individual YouTube videos, you can convert videos from playlists one by one. Here&rsquo;s how to efficiently convert multiple videos from a playlist:
                    </p>
                    <ol className="list-decimal pl-5 mt-2 space-y-2 text-gray-700">
                      <li>Open the YouTube playlist in your browser</li>
                      <li>Copy the URL of the first video you want to convert</li>
                      <li>Paste it into our converter and start the conversion</li>
                      <li>While the first video is converting, you can prepare the next video URL</li>
                      <li>After downloading the first MP3, paste the next URL and repeat the process</li>
                    </ol>
                    <p className="mt-3 text-gray-700">
                      This method allows you to convert multiple videos from playlists efficiently. Each MP3 file will be named according to the original video title, making it easy to organize your music collection. For frequent users who need to convert many videos, we recommend bookmarking our site for quick access.
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
      )}
