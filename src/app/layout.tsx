import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "YouTube to MP3 Converter - Free & Online & High Quality",
  description: "Download your YouTube videos as MP3 audio files for free with the fastest and best YouTube Converter,anytime, anywhere!",
  //keywords: "YouTube to MP3, YouTube converter, MP3 converter, audio extractor, YouTube audio, download YouTube audio, YouTube MP3 downloader",
  authors: [{ name: "YouTube MP3 Team" }],
  openGraph: {
    title: "Best YouTube to MP3 Converter -- Free & High Quality & Online",
    description: "Try our best online YouTube to MP3 converter—free, safe, and easy to use. Convert YouTube videos to MP3 in 320kbps, download playlists, and enjoy high-quality audio instantly. Perfect for quick, secure conversions from YouTube to MP3 anytime, anywhere!",
    url: "https://www.youtube-to-mp3.net",
    siteName: "YouTube to MP3 Converter",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Best YouTube to MP3 Converter -- Free & High Quality & Online",
    description: "Try our best online YouTube to MP3 converter—free, safe, and easy to use. Convert YouTube videos to MP3 in 320kbps, download playlists, and enjoy high-quality audio instantly. Perfect for quick, secure conversions from YouTube to MP3 anytime, anywhere!",
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
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
