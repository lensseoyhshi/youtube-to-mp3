import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "YouTube to MP4 Converter | Download YouTube Videos Free",
  description: "Convert and download YouTube videos to MP4 format in high quality. Free online YouTube video downloader - no software installation required.",
  keywords: "YouTube to MP4, YouTube video downloader, download YouTube videos, YouTube converter, MP4 converter",
  openGraph: {
    title: "YouTube to MP4 Converter - Download Videos in High Quality",
    description: "Convert and download YouTube videos to MP4 format in high quality. Free online YouTube video downloader - no software installation required.",
    url: "https://www.youtube-to-mp3.net/mp4",
    siteName: "YouTube to MP3 Converter",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "YouTube to MP4 Converter - Download Videos in High Quality",
    description: "Convert and download YouTube videos to MP4 format in high quality. Free online YouTube video downloader - no software installation required.",
  },
  alternates: {
    canonical: "https://www.youtube-to-mp3.net/mp4",
  },
};

export default function MP4Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}