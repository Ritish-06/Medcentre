import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ToastProvider } from '@/context/ToastContext';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import { HeaderNav } from '@/components/HeaderNav';
import { Footer } from '@/components/Footer';
import { AIAssistant } from '@/components/AIAssistant';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'MedCentre — Healthcare Platform & Medical Hub',
  description: 'Intelligent digital healthcare platform connecting patients with verified pharmacies, digital prescriptions, specialist physicians, and secure health records.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="antialiased bg-slate-50 text-slate-900 min-h-screen flex flex-col justify-between font-sans">
        <ToastProvider>
          <AuthProvider>
            <CartProvider>
              <HeaderNav />
              <div className="flex-1">{children}</div>
              <Footer />
              <AIAssistant />
            </CartProvider>
          </AuthProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
