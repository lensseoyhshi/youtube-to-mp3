'use client';

import { useState, useEffect } from 'react';
import { ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';

export default function Home() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(0); // 添加进度状态
  const [audioInfo, setAudioInfo] = useState<{
    audioUrl: string;
    title: string;
    thumbnail: string;
    duration: string;
  } | null>(null);
  const [cookieStr, setCookieStr] = useState('');  // 添加cookie状态
  const [downloadProgress, setDownloadProgress] = useState(0); // 添加下载进度状态
  const [downloadLoading, setDownloadLoading] = useState(false); // 下载按钮状态

  // 获取浏览器cookie
  useEffect(() => {
    setCookieStr(document.cookie);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setAudioInfo(null);
    setProgress(0); // 重置进度

    try {
      // 更新cookie状态
      setCookieStr(document.cookie);

      // 创建事件源来接收进度更新，传递cookie参数
      const eventSource = new EventSource(`/api/extract?url=${encodeURIComponent(url)}&cookie=${encodeURIComponent(cookieStr)}`);

      eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.progress) {
          setProgress(data.progress);
        }

        if (data.complete) {
          setAudioInfo(data.info);
          eventSource.close();
          setLoading(false);
        }
      };

      eventSource.onerror = (error) => {
        console.error('EventSource error:', error);
        eventSource.close();
        setError('提取音频时发生错误');
        setLoading(false);
      };

    } catch (err) {
      setError(err instanceof Error ? err.message : '提取音频时发生错误');
      setLoading(false);
    }
  };

  const [downloadUrl, setDownloadUrl] = useState<string | null>(null); // 添加下载URL状态

  const handleDownload = async () => {
    if (!audioInfo) return;

    try {
      setDownloadLoading(true);
      setCookieStr(document.cookie);
      setError(''); // 清除之前的错误

      // 显示下载进度状态
      setDownloadProgress(10);
      console.log('开始下载处理...');

      // 1. 先从YouTube下载MP3
      console.log('从API获取MP3数据...');
      const response = await fetch('/api/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, cookie: cookieStr })
      });

      if (!response.ok) {
        throw new Error(`下载失败: ${response.status} ${response.statusText}`);
      }

      // 获取blob数据
      const blob = await response.blob();
      console.log('获取到Blob数据大小:', blob.size, 'bytes', 'MIME类型:', blob.type);

      if (blob.size === 0) {
        throw new Error('下载的文件大小为0，请检查下载API');
      }

      setDownloadProgress(50);

      // 2. 创建FormData对象用于上传
      const fileName = `${audioInfo.title.replace(/[^\w\s.-]/g, '')}.mp3`; // 清理文件名
      const file = new File([blob], fileName, { type: 'audio/mpeg' });
      console.log('创建的File对象大小:', file.size, 'bytes');

      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', audioInfo.title || '');

      // 检查FormData内容
      console.log('FormData内容:');
      for (let [key, value] of formData.entries()) {
        if (value instanceof File) {
          console.log(`${key}: File, size=${value.size}, type=${value.type}, name=${value.name}`);
        } else {
          console.log(`${key}: ${value}`);
        }
      }

      setDownloadProgress(70);

      // 3. 上传到后端 - 使用相对路径
      console.log('开始上传到服务器...');
      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        // 不设置Content-Type，让浏览器自动处理
        body: formData
      });

      console.log('上传响应状态:', uploadResponse.status);

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        console.error('上传失败详情:', errorText);
        throw new Error(`上传失败: ${uploadResponse.status} ${uploadResponse.statusText}`);
      }

      setDownloadProgress(90);

      const uploadResult = await uploadResponse.json();
      console.log('上传结果:', uploadResult);

      if (uploadResult.success) {
        setDownloadProgress(100);
        setDownloadUrl(uploadResult.downloadUrl);

        // 4. 使用后端返回的下载链接进行下载
        const link = document.createElement('a');
        link.href = uploadResult.downloadUrl;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        throw new Error(uploadResult.error || '上传处理失败');
      }
    } catch (err) {
      console.error('下载处理错误:', err);
      setError(err instanceof Error ? err.message : '下载或上传音频时发生错误');
    } finally {
      setDownloadLoading(false);
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
                  {/*<div className="w-32 h-32 relative flex-shrink-0">*/}
                  {/*  <Image*/}
                  {/*      src={audioInfo.thumbnail}*/}
                  {/*      alt={audioInfo.title}*/}
                  {/*      fill*/}
                  {/*      className="rounded-md object-cover"*/}
                  {/*  />*/}
                  {/*</div>*/}
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-black mb-1">
                      {audioInfo.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3">
                      时长: {Math.floor(Number(audioInfo.duration) / 60)}分{Number(audioInfo.duration) % 60}秒
                    </p>
                    <button
                        onClick={handleDownload}
                        className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none transition-colors duration-200 text-sm font-medium"
                        disabled={downloadLoading}
                    >
                      <ArrowDownTrayIcon className="w-4 h-4" />
                      {downloadLoading ? '处理中...' : '下载MP3'}
                    </button>

                    {/* 下载进度条 */}
                    {downloadLoading && (
                        <div className="mt-3">
                          <div className="w-full bg-gray-200 rounded-full h-1.5 mb-1">
                            <div
                                className="bg-green-500 h-1.5 rounded-full transition-all duration-300 ease-in-out"
                                style={{ width: `${downloadProgress}%` }}
                            ></div>
                          </div>
                          <p className="text-xs text-gray-500">
                            {downloadProgress < 50 ? '下载中...' :
                                downloadProgress < 90 ? '上传中...' : '完成中...'}
                          </p>
                        </div>
                    )}

                    {downloadUrl && (
                        <p className="mt-2 text-sm text-gray-600">
                          文件已上传，可以重复下载：
                          <a
                              href={downloadUrl}
                              className="text-blue-600 hover:text-blue-800 underline ml-1"
                              download
                          >
                            点击下载
                          </a>
                        </p>
                    )}
                  </div>
                </div>
              </div>
          )}
        </div>
      </div>
  );
}
