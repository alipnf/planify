'use client';

import { usePathname } from 'next/navigation';
import { Toaster } from 'sonner';
import { Navbar } from './navbar';
import { Footer } from './footer';

interface LayoutWrapperProps {
  children: React.ReactNode;
}

export function LayoutWrapper({ children }: LayoutWrapperProps) {
  const pathname = usePathname();
  const isAuthPage =
    pathname === '/auth/login' || pathname === '/auth/register';

  return (
    <>
      {!isAuthPage && <Navbar />}
      {children}
      {!isAuthPage && <Footer />}
      <Toaster position="bottom-right" expand={true} closeButton />
    </>
  );
}
