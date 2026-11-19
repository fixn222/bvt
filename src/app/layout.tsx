import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BVTalent — The Crowd Decides",
  description:
    "Official digital voting platform for the live talent show competition. One eligible voter = one vote = one team.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-party-dark text-slate-100 antialiased min-h-screen flex flex-col selection:bg-party-neonPink selection:text-white">
        {children}
      </body>
    </html>
  );
}
