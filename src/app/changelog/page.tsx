'use client';

import Link from 'next/link';
import { Footer } from '@/components/Footer';

export default function Changelog() {
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
                <Link href="/changelog" className="border-b-2 border-red-600 text-gray-900 inline-flex items-center px-1 pt-1 text-lg">
                  Log
                </Link>
                <Link href="/about" className="border-transparent text-gray-700 hover:text-gray-900 hover:border-gray-300 inline-flex items-center px-1 pt-1 border-b-2 text-lg">
                  About
                </Link>
              </div>
            </div>
          </div>
        </div>
      </nav>

    

      <div className="flex-grow w-full max-w-6xl mx-auto mt-10 px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold mb-6">Changelog</h1>
        
        <div className="space-y-8">
          <div className="border-b pb-6">
            <div className="flex items-center mb-2">
              <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">v1.2.0</span>
              <span className="ml-2 text-gray-500 text-sm">May 10, 2024</span>
            </div>
            <h2 className="text-xl font-semibold mb-2">Performance Improvements</h2>
            <ul className="list-disc pl-5 space-y-1 text-gray-600">
              <li>Improved conversion speed by 30%</li>
              <li>Added support for longer videos (up to 3 hours)</li>
              <li>Fixed UI issues on mobile devices</li>
              <li>Enhanced error handling and user feedback</li>
            </ul>
          </div>
          
          <div className="border-b pb-6">
            <div className="flex items-center mb-2">
              <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">v1.1.0</span>
              <span className="ml-2 text-gray-500 text-sm">April 15, 2024</span>
            </div>
            <h2 className="text-xl font-semibold mb-2">New Features</h2>
            <ul className="list-disc pl-5 space-y-1 text-gray-600">
              <li>Added progress bar for conversion process</li>
              <li>Implemented better YouTube URL validation</li>
              <li>Added support for YouTube Shorts</li>
            </ul>
          </div>
          
          <div className="border-b pb-6">
            <div className="flex items-center mb-2">
              <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">v1.0.0</span>
              <span className="ml-2 text-gray-500 text-sm">March 1, 2024</span>
            </div>
            <h2 className="text-xl font-semibold mb-2">Initial Release</h2>
            <ul className="list-disc pl-5 space-y-1 text-gray-600">
              <li>Basic YouTube to MP3 conversion</li>
              <li>Simple and intuitive user interface</li>
              <li>Support for standard YouTube videos</li>
            </ul>
          </div>
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