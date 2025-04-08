import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "YouTube to MP3 Converter|APP & GOOGLE EXTENSION",
  description: "Convert YouTube videos to MP3 quickly and safely with our free online converter. Enjoy high-quality audio downloads for music, playlists, and more—on any device!",
  keywords: "YouTube to MP3 converter,320kbps, YouTube converter, download YouTube audio, YouTube MP3 downloader",
  authors: [{ name: "YouTube MP3 Team" }],
  openGraph: {
    title: "Best YouTube to MP3 Converter",
    description: "Convert YouTube videos to MP3 quickly and safely with our free online converter. Enjoy high-quality audio downloads for music, playlists, and more—on any device!",
    url: "https://www.youtube-to-mp3.net",
    siteName: "YouTube to MP3 Converter",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Best YouTube to MP3 Converter",
    description: "Convert YouTube videos to MP3 quickly and safely with our free online converter. Enjoy high-quality audio downloads for music, playlists, and more—on any device!",
  },
  alternates: {
    canonical: "https://www.youtube-to-mp3.net",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/Logo.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
