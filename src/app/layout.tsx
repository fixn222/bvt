import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BVTalent — The Crowd Decides",
  description:
    "Official digital voting platform for the live talent show competition. One eligible voter = one vote = one team.",
  icons: {
    icon: "/favicon.ico",
  },
  appleWebApp: {
    capable: true,
    title: "BVTalent",
    statusBarStyle: "black-translucent",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#130924",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-party-bg text-slate-100 antialiased min-h-screen flex flex-col selection:bg-party-pink selection:text-white">
        {children}
      </body>
    </html>
  );
}
