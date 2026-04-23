import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { GlobalProvider } from "@/lib/store";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LinkedUIU | The Elite UIU Alumni & Student Network",
  description: "Connect with the global United International University (UIU) network. Professional networking, job opportunities, and institutional collaboration for verified alumni and students.",
  keywords: ["UIU Alumni", "LinkedUIU", "United International University", "Professional Network", "Alumni Portal"],
  authors: [{ name: "UIU Alumni Protocol" }],
  openGraph: {
    title: "LinkedUIU | Professional Institutional Network",
    description: "The official networking ecosystem for UIU alumni and students.",
    url: "https://linkuiu.com",
    siteName: "LinkedUIU",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "LinkedUIU | UIU Alumni Network",
    description: "Elite professional portal for United International University.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "LinkedUIU",
              "url": "https://linkuiu.com",
              "potentialAction": {
                "@type": "SearchAction",
                "target": "https://linkuiu.com/dashboard/directory?q={search_term_string}",
                "query-input": "required name=search_term_string"
              },
              "description": "Professional networking platform for UIU students and alumni.",
              "publisher": {
                "@type": "Organization",
                "name": "United International University Alumni"
              }
            })
          }}
        />
      </head>
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <GlobalProvider>
          {children}
        </GlobalProvider>
      </body>
    </html>
  );
}
