'use client';

import { useState } from 'react';
import { ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';

export default function Home() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [audioInfo, setAudioInfo] = useState<{
    audioUrl: string;
    title: string;
    thumbnail: string;
    duration: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setAudioInfo(null);

    try {
      const response = await fetch('/api/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '提取音频失败');
      }

      setAudioInfo(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '提取音频时发生错误');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!audioInfo?.audioUrl) return;
    
    const link = document.createElement('a');
    link.href = audioInfo.audioUrl;
    link.download = `${audioInfo.title}.mp3`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            YouTube 音频提取器
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            输入YouTube视频链接，一键提取并下载音频
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-12">
          <div className="flex gap-4 flex-col sm:flex-row">
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="请输入YouTube视频URL"
              className="flex-1 px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 transition-colors duration-200"
            >
              {loading ? '处理中...' : '提取音频'}
            </button>
          </div>
        </form>

        {error && (
          <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/50 rounded-lg">
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {audioInfo && (
          <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <div className="flex items-start gap-6">
              <div className="w-40 h-40 relative flex-shrink-0">
                <Image
                  src={audioInfo.thumbnail}
                  alt={audioInfo.title}
                  fill
                  className="rounded-lg object-cover"
                />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {audioInfo.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  时长: {Math.floor(Number(audioInfo.duration) / 60)}分{Number(audioInfo.duration) % 60}秒
                </p>
                <button
                  onClick={handleDownload}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors duration-200"
                >
                  <ArrowDownTrayIcon className="w-5 h-5" />
                  下载MP3
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
