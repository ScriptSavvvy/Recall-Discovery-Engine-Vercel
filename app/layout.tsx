import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Recall | Photo Retrieval Discovery",
  description: "Analyse structured photo-retrieval episodes, compare problem mechanisms, and inspect evidence-grounded opportunity areas.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
