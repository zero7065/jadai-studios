import React from 'react';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import MobileBottomDock from '../../components/layout/MobileBottomDock';

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col justify-between relative bg-[#050404] text-[#c4c0bb]">
      <Header />
      <main className="flex-1 w-full pb-16 md:pb-0">{children}</main>
      <MobileBottomDock />
      <Footer />
    </div>
  );
}
