import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "YouTube to MP3 Converter App | Desktop Application",
  description: "Download our YouTube to MP3 converter desktop application for Windows and Mac. Convert YouTube videos to MP3 with batch processing and automatic tagging.",
  keywords: "YouTube to MP3 app, YouTube converter software, YouTube MP3 desktop app, YouTube downloader application",
  openGraph: {
    title: "YouTube to MP3 Converter Desktop Application",
    description: "Download our YouTube to MP3 converter desktop application for Windows and Mac. Convert YouTube videos to MP3 with batch processing and automatic tagging.",
    url: "https://www.youtube-to-mp3.net/app",
    siteName: "YouTube to MP3 Converter",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "YouTube to MP3 Converter Desktop Application",
    description: "Download our YouTube to MP3 converter desktop application for Windows and Mac. Convert YouTube videos to MP3 with batch processing and automatic tagging.",
  },
  alternates: {
    canonical: "https://www.youtube-to-mp3.net/app",
  },
};

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}