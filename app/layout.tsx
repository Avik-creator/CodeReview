import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { QueryProvider } from "@/components/providers/queryProvider";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CodeReviewer",
  description:
    "Having Trouble Getting your PR reviewed, worry not! CodeReviewer is here to save the day.",
  openGraph: {
    title: "CodeReviewer",
    description:
      "Having Trouble Getting your PR reviewed, worry not! CodeReviewer is here to save the day.",
    url: "https://codereviewer.avikmukherjee.me",
    siteName: "Avik Mukherjee's Portfolio",
    images: [
      {
        url: "/og-image.webp",
        width: 1200,
        height: 630,
        alt: "CodeReviewer",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    title: "CodeReviewer",
    card: "summary_large_image",
    creator: "@avikm744",
    site: "@avikm744",
    siteId: "@avikm744",
    description:
      "Having Trouble Getting your PR reviewed, worry not! CodeReviewer is here to save the day.",
    images: ["/og-image.webp"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <QueryProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <Toaster position="bottom-right" richColors />
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
