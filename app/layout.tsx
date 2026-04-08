import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";

export const metadata: Metadata = {
  title: "English Speaking Coach",
  description: "AI-powered workplace English speaking practice",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-gray-50 font-sans">
        <nav className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
            <Link
              href="/"
              className="text-lg font-bold text-indigo-600 hover:text-indigo-700"
            >
              🎤 SpeakCoach
            </Link>
            <div className="flex items-center gap-6">
              <Link
                href="/"
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Scenarios
              </Link>
              <Link
                href="/history"
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                History
              </Link>
            </div>
          </div>
        </nav>
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}

