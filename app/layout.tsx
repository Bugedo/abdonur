import type { Metadata } from 'next';
import { Cinzel, Montserrat } from 'next/font/google';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import '@/styles/globals.css';

const cinzel = Cinzel({
  subsets: ['latin'],
  variable: '--font-cinzel',
  display: 'swap',
});

const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-montserrat',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Abdonur',
  description:
    'Hacé tu pedido de empanadas árabes online y recibilo por WhatsApp. Elegí tu sucursal y armá tu pedido. Simplemente excepcionales.',
  icons: {
    icon: '/images/branding/abdonur-logo-mark.png',
    apple: '/images/branding/abdonur-logo-mark.png',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${cinzel.variable} ${montserrat.variable}`}>
      <body className="flex min-h-screen flex-col font-sans antialiased text-[#e0e0e0]">
        <Header />
        <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
