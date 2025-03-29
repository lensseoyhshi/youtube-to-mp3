import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t border-gray-200 py-8 bg-gray-50 mt-auto">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-center space-x-8 mb-6">
          <Link href="/privacy" className="text-gray-600 hover:text-red-600 text-sm font-medium">
            Privacy Policy
          </Link>
          <Link href="/terms" className="text-gray-600 hover:text-red-600 text-sm font-medium">
            Terms of Service
          </Link>
          <Link href="/about" className="text-gray-600 hover:text-red-600 text-sm font-medium">
            Contact Us
          </Link>
        </div>
        
        <div className="text-center">
          <p className="text-gray-500 text-sm">
            ©This site is for technical exchange purposes only. Copyright infringement is strictly prohibited.
          </p>
          <p className="text-gray-500 text-sm mt-2">
            © {new Date().getFullYear()} YouTube MP3 Converter. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}