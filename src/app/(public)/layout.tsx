import React from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { MobileTabBar } from "@/components/layout/MobileTabBar";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-1 flex-col justify-between pb-[calc(4.25rem+env(safe-area-inset-bottom))] md:pb-0">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      <MobileTabBar />
    </div>
  );
}
