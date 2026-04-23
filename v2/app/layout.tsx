import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { GlobalProvider } from "@/lib/store";
import { Analytics } from "@vercel/analytics/next";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LinkedUIU | Official UIU Alumni Connect & Professional Network",
  description: "Connect with the United International University (UIU) alumni community. The official platform for UIU Alumni Association, professional networking, job directory, and institutional collaboration.",
  keywords: [
    "LinkedUIU", 
    "UIU Alumni", 
    "Alumni Connect", 
    "UIU Alumni Association", 
    "UIU Alumni Community", 
    "United International University Alumni Directory",
    "United International University Alumni Connect",
    "United International University Alumni Community",
    "Professional Network",
    "UIU Career Hub"
  ],
  authors: [{ name: "UIU Alumni Protocol" }],
  openGraph: {
    title: "LinkedUIU | Elite UIU Alumni & Student Network",
    description: "The official professional networking ecosystem for United International University (UIU) alumni and students.",
    url: "https://linkeduiu.vercel.app/",
    siteName: "LinkedUIU",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "LinkedUIU | UIU Alumni Network",
    description: "Elite professional portal for United International University (UIU) alumni and students.",
  },
  alternates: {
    canonical: "https://linkeduiu.vercel.app/",
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
              "url": "https://linkeduiu.vercel.app/",
              "potentialAction": {
                "@type": "SearchAction",
                "target": "https://linkeduiu.vercel.app/dashboard/directory?q={search_term_string}",
                "query-input": "required name=search_term_string"
              },
              "description": "The official professional networking platform and alumni directory for United International University (UIU).",
              "publisher": {
                "@type": "Organization",
                "name": "United International University Alumni Association",
                "logo": "https://linkeduiu.vercel.app/logo.png"
              }
            })
          }}
        />
      </head>
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <GlobalProvider>
          {children}
        </GlobalProvider>
        <Analytics />
      </body>
    </html>
  );
}
