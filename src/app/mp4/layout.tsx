import { Metadata } from 'next';

// export const metadata: Metadata = {
//   robots: 'noindex, nofollow'
// };

export default function MP4Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}