import React from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex-1 flex flex-col justify-between">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
