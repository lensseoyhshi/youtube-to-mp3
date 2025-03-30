'use client';

import Link from 'next/link';
import { Footer } from '@/components/Footer';

export default function MP4Page() {
  return (
    <div className="min-h-screen bg-white text-black flex flex-col">
      {/* Navigation bar */}
      <nav>
        <div>
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="hidden sm:ml-6 sm:flex sm:space-x-10">
                <Link href="/" className="border-transparent text-gray-700 hover:text-gray-900 hover:border-gray-300 inline-flex items-center px-1 pt-1 border-b-2 text-lg">
                  Home
                </Link>
               
                <Link href="/mp4" className="border-b-2 border-red-600 text-gray-900 inline-flex items-center px-1 pt-1 text-lg">
                  MP4
                </Link>
                <Link href="/app" className="border-transparent text-gray-700 hover:text-gray-900 hover:border-gray-300 inline-flex items-center px-1 pt-1 border-b-2 text-lg">
                  APP
                </Link>
                <Link href="/blog" className="border-transparent text-gray-700 hover:text-gray-900 hover:border-gray-300 inline-flex items-center px-1 pt-1 border-b-2 text-lg">
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

      <div className="flex-grow flex flex-col items-center justify-center px-4">
        <div className="max-w-2xl w-full text-center">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-6">YouTube to MP4 Downloader</h1>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
              <div className="flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold mb-2">Coming Soon - Under Development</h2>
              <p className="text-gray-600 mb-4">
                We&rsquo;re working hard to bring you the YouTube to MP4 download feature. Stay tuned for updates!
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6">
                <a 
                  href="https://t.me/youtube2mpx" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                >
                  <svg className="w-5 h-5" fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.248-1.97 9.296c-.146.658-.537.818-1.084.51l-3-2.21-1.446 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.121l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.534-.197 1.001.13.832.924z"/>
                  </svg>
                  Join Telegram for Updates
                </a>
                
                <button 
                  onClick={() => {
                    alert('Press Ctrl+D (Windows) or Command+D (Mac) to bookmark this site');
                  }}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                  </svg>
                  Bookmark for Launch Notification
                </button>
              </div>
            </div>
            
            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-4">Upcoming Features:</h3>
              <ul className="space-y-2 text-left">
                <li className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  High-quality MP4 video downloads (up to 4K resolution)
                </li>
                <li className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Batch download YouTube playlists
                </li>
                <li className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Custom video format and quality selection
                </li>
                <li className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Video trimming and editing capabilities
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}