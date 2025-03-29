'use client';

import Link from 'next/link';
import { Footer } from '@/components/Footer';
import { Metadata } from 'next';

// 注意：在客户端组件中不能直接导出 metadata
// 需要在 about 文件夹中创建一个单独的 metadata.ts 文件

export default function About() {
  return (
    <div className="min-h-screen bg-white text-black flex flex-col">
      {/* 添加导航栏 */}
      <nav>
        <div>
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="hidden sm:ml-6 sm:flex sm:space-x-10">
                <Link href="/" className="border-transparent text-gray-700 hover:text-gray-900 hover:border-gray-300 inline-flex items-center px-1 pt-1 border-b-2 text-lg">
                  Home
                </Link>
                <Link href="/blog" className="border-transparent text-gray-700 hover:text-gray-900 hover:border-gray-300 inline-flex items-center px-1 pt-1 border-b-2 text-lg">
                  Blog
                </Link>
                <Link href="/changelog" className="border-transparent text-gray-700 hover:text-gray-900 hover:border-gray-300 inline-flex items-center px-1 pt-1 border-b-2 text-lg">
                  Log
                </Link>
                <Link href="/about" className="border-b-2 border-red-600 text-gray-900 inline-flex items-center px-1 pt-1 text-lg">
                  About
                </Link>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex-grow max-w-4xl mx-auto mt-10 px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold mb-6">About Us</h1>
        
        <div className="prose max-w-none">
          <p className="mb-4">
            YouTube To MP3 Downloader is a simple, fast, and free online tool that allows you to convert YouTube videos to MP3 format. 
            Our mission is to provide a seamless experience for users who want to enjoy their favorite content offline.
          </p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">Our Story</h2>
          <p className="mb-4">
            Founded in 2024, YouTube MP3 was created by a team of audio enthusiasts and developers who wanted to build a 
            better solution for converting YouTube content to audio format. We noticed that many existing tools were either 
            too complicated, filled with ads, or didn't provide good quality results.
          </p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">How It Works</h2>
          <p className="mb-4">
            Our service uses advanced technology to extract high-quality audio from YouTube videos. We prioritize:
          </p>
          <ul className="list-disc pl-5 mb-4">
            <li>Speed - conversions typically complete within seconds</li>
            <li>Quality - we maintain the highest possible audio quality</li>
            <li>Privacy - we don't store your videos or personal information</li>
            <li>Simplicity - our interface is designed to be intuitive and easy to use</li>
          </ul>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">Contact Us</h2>
          <p>
            Have questions or feedback? We'd love to hear from you! Reach out to us at 
            <a href="mailto:yhuaml@gmail.com" className="text-red-600 ml-1">yhuaml@gmail.com</a>
          </p>
        </div>
        
        {/* 添加返回首页按钮 */}
        <div className="mt-10 text-center mb-8">
          <Link href="/" className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back to Home
          </Link>
        </div>
      </div>
      
      {/* 添加页脚 */}
      <Footer />
    </div>
  );
}