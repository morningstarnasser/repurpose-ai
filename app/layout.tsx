import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RepurposeAI - Transform Your Content with AI",
  description:
    "Turn one piece of content into dozens. Repurpose podcasts, blogs, and videos with AI-powered transformation. Free to start.",
  keywords: [
    "content repurposing",
    "AI content",
    "podcast to social media",
    "blog to video",
    "content marketing",
    "repurpose content",
  ],
  openGraph: {
    title: "RepurposeAI - Transform Your Content with AI",
    description:
      "Turn one piece of content into dozens. Podcasts to tweets, blogs to reels, videos to threads — all in seconds.",
    type: "website",
    locale: "en_US",
    siteName: "RepurposeAI",
  },
  twitter: {
    card: "summary_large_image",
    title: "RepurposeAI - Transform Your Content with AI",
    description:
      "Turn one piece of content into dozens with AI. Free to start.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
