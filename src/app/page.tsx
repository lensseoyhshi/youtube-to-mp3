'use client';

import { useState } from 'react';
import { ArrowDownTrayIcon } from '@heroicons/react/24/outline';

const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL;


// 在文件顶部添加这些接口定义
interface ConvertResponse {
  fileId: string;
  status: string;
  statusUrl: string;
  success: boolean;
  taskId: string;
  error?: string;  // 添加可选的 error 字段
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


  // 添加状态轮询函数
  const pollStatus = async (fileId: string): Promise<StatusResponse> => {
    try {
      const response = await fetch(`${baseURL}/api/status/${fileId}`);
      const data = await response.json() as StatusResponse;

      if (!data.success) {
        throw new Error(data.error || '转换失败');
      }

      if (data.status === 'pending' || data.status === 'processing') {
        setProgress((prev) => Math.min(prev + 10, 90));
        await new Promise(resolve => setTimeout(resolve, 10000));
        return pollStatus(fileId);
      } else if (data.status === 'completed') {
        setProgress(100);
        return data;
      } else if (data.status === 'failed') {
        throw new Error('转换失败');
      }

      throw new Error('未知状态');
    } catch (err) {
      throw err;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
        throw new Error('转换请求失败');
      }

      const data = await response.json() as ConvertResponse;
      if (!data.success) {
        throw new Error(data.error || '转换失败');
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
      setError(err instanceof Error ? err.message : '转换音频时发生错误');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    try {
      if (!audioInfo?.audioUrl) {
        throw new Error('音频地址不存在');
      }
      window.location.href = `${baseURL}${audioInfo.audioUrl}`;
    } catch (err) {
      setError(err instanceof Error ? err.message : '下载音频时发生错误');
    }
  };

  return (
      <div className="min-h-screen bg-white text-black py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-2">
              YouTube 音频提取器
            </h1>
            <p className="text-sm text-gray-600">
              输入YouTube视频链接，一键提取并下载音频
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8">
            <div className="flex gap-2 flex-col sm:flex-row">
              <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="paste the link here"
                  className="flex-1 px-4 py-2 rounded-md border border-black bg-white text-black focus:ring-1 focus:ring-black focus:outline-none"
                  required
              />
              <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 focus:outline-none disabled:opacity-50 transition-colors duration-200 font-medium"
              >
                {loading ? '处理中...' : '提取音频'}
              </button>
            </div>
          </form>

          {/* 添加进度条 */}
          {loading && (
              <div className="mt-6">
                <div className="w-full bg-gray-200 rounded-full h-1.5 mb-2">
                  <div
                      className="bg-blue-600 h-1.5 rounded-full transition-all duration-300 ease-in-out"
                      style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 text-center">
                  {progress === 0 ? '准备中...' : `处理进度: ${progress}%`}
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
                <div className="flex items-start gap-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-black mb-3">
                      {audioInfo.title}
                    </h3>
                    <button
                        onClick={handleDownload}
                        className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none transition-colors duration-200 text-sm font-medium"
                    >
                      <ArrowDownTrayIcon className="w-4 h-4" />
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
