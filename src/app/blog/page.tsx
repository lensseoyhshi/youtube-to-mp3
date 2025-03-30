'use client';

import Link from 'next/link';
import { Footer } from '@/components/Footer';

export default function Blog() {
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
                <Link href="/mp4" className="border-transparent text-gray-700 hover:text-gray-900 hover:border-gray-300 inline-flex items-center px-1 pt-1 border-b-2 text-lg">
                  MP4
                </Link>
                <Link href="/app" className="border-transparent text-gray-700 hover:text-gray-900 hover:border-gray-300 inline-flex items-center px-1 pt-1 border-b-2 text-lg">
                  APP
                </Link>
                <Link href="/blog" className="border-b-2 border-red-600 text-gray-900 inline-flex items-center px-1 pt-1 text-lg">
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
          </div>
        </div>
      </nav>

      <div className="flex-grow max-w-4xl mx-auto mt-10 px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold mb-6">Blog</h1>
        
        <div className="space-y-10">
          <article className="border-b pb-6">
            <h2 className="text-2xl font-semibold mb-2">How to Convert YouTube Videos to MP3</h2>
            <p className="text-gray-500 mb-4">Published on March 15, 2025</p>
            <p className="mb-4">
              Converting YouTube videos to MP3 format allows you to enjoy your favorite content offline. 
              This guide explains how to use our tool effectively...
            </p>
            <Link href="#" className="text-red-600 hover:text-red-800">
              Read more →
            </Link>
          </article>
          
          <article className="border-b pb-6">
            <h2 className="text-2xl font-semibold mb-2">Best Music Channels on YouTube</h2>
            <p className="text-gray-500 mb-4">Published on March 28, 2024</p>
            <p className="mb-4">
              Discover the best music channels on YouTube that offer high-quality content for various genres...
            </p>
            <Link href="#" className="text-red-600 hover:text-red-800">
              Read more →
            </Link>
          </article>
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