import type { Metadata } from 'next';
import './globals.css';
import { Sidebar } from '@/components/sidebar';
import { Header } from '@/components/header';

export const metadata: Metadata = {
  title: 'ApplyTrack - Job Application Management Platform',
  description: 'Track job applications, resume ROI, recruiter communications, interviews, and hiring journey timelines.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#0A0A0A] text-[#EFECEC] antialiased font-sans flex min-h-screen">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0 bg-[#0A0A0A]">
          <Header />
          <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto bg-[#0A0A0A]">{children}</main>
        </div>
      </body>
    </html>
  );
}
