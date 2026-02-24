import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: '#0a0a0a',
};

export const metadata: Metadata = {
  metadataBase: new URL('https://art3m1s.me'),
  title: "Bill Zhang | AI Engineer Portfolio",
  description: "Interactive voice-driven portfolio of Bill Zhang, AI Engineer at Scale AI. Explore projects, experience, and education through conversation.",
  keywords: ['AI Engineer', 'Bill Zhang', 'Portfolio', 'Machine Learning', 'Conversational AI', 'Scale AI', 'USC'],
  authors: [{ name: 'Bill Zhang' }],
  creator: 'Bill Zhang',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://art3m1s.me',
    siteName: 'Bill Zhang Portfolio',
    title: 'Bill Zhang | AI Engineer Portfolio',
    description: 'Interactive voice-driven portfolio. AI Engineer at Scale AI.',
    images: [{ url: '/profile.webp', width: 1200, height: 630, alt: 'Bill Zhang' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Bill Zhang | AI Engineer Portfolio',
    description: 'Interactive voice-driven portfolio. AI Engineer at Scale AI.',
    images: ['/profile.webp'],
  },
  robots: { index: true, follow: true },
  alternates: { canonical: 'https://art3m1s.me' },
  icons: {
    icon: [
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/icon.ico', rel: 'icon' },
    ],
    shortcut: '/icon.ico',
    apple: '/apple-touch-icon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning style={{ colorScheme: 'dark' }}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Person',
              name: 'Bill Zhang',
              jobTitle: 'AI Engineer',
              worksFor: { '@type': 'Organization', name: 'Scale AI' },
              alumniOf: [
                { '@type': 'EducationalOrganization', name: 'University of Southern California' },
                { '@type': 'EducationalOrganization', name: 'University of California, Santa Cruz' }
              ],
              url: 'https://art3m1s.me',
              knowsAbout: ['Artificial Intelligence', 'Machine Learning', 'Conversational AI', 'NLP']
            })
          }}
        />
        <a 
          href="#main-content" 
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded"
        >
          Skip to main content
        </a>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
