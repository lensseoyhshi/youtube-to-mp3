'use client';

import Link from 'next/link';
import { Footer } from '@/components/Footer';

export default function Terms() {
  return (
    <div className="min-h-screen bg-white text-black">
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
                <Link href="/about" className="border-transparent text-gray-700 hover:text-gray-900 hover:border-gray-300 inline-flex items-center px-1 pt-1 border-b-2 text-lg">
                  About
                </Link>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto mt-10 px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
        
        <div className="prose max-w-none">
          <p className="mb-4">
            Last updated: {new Date().toLocaleDateString()}
          </p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">1. Acceptance of Terms</h2>
          <p className="mb-4">
            By accessing or using our service, you agree to be bound by these Terms of Service. If you disagree with any part of the terms, 
            you may not access the service.
          </p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">2. Use of Service</h2>
          <p className="mb-4">
            Our service allows you to convert YouTube videos to MP3 format for personal, non-commercial use only. 
            You agree not to use our service:
          </p>
          <ul className="list-disc pl-5 mb-4">
            <li>In any way that violates any applicable national or international law or regulation</li>
            <li>For the purpose of exploiting, harming, or attempting to exploit or harm minors in any way</li>
            <li>To infringe upon or violate our intellectual property rights or the intellectual property rights of others</li>
            <li>To transmit any material that is defamatory, obscene, indecent, abusive, offensive, harassing, violent, hateful, inflammatory, or otherwise objectionable</li>
          </ul>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">3. Copyright Policy</h2>
          <p className="mb-4">
            We respect the intellectual property rights of others. It is our policy to respond to any claim that content 
            posted on our service infringes on the copyright or other intellectual property rights of any person or entity.
          </p>
          <p className="mb-4">
            Our service is intended for personal use only. You are responsible for ensuring that your use of our service 
            complies with applicable copyright laws. We do not encourage or condone the illegal copying or distribution of copyrighted content.
          </p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">4. Limitation of Liability</h2>
          <p className="mb-4">
            In no event shall YouTube MP3 Converter, nor its directors, employees, partners, agents, suppliers, or affiliates, 
            be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, 
            loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or 
            inability to access or use the service.
          </p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">5. Contact Us</h2>
          <p className="mb-4">
            If you have any questions about these Terms, please contact us at:
            <a href="mailto:support@youtubemp3.example.com" className="text-red-600 ml-1">support@youtubemp3.example.com</a>
          </p>
        </div>
        
        {/* 添加返回首页按钮 */}
        <div className="mt-10 text-center">
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