import type { Metadata } from 'next';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: 'Empanadas Árabes Abdonur — Pedí Online',
  description:
    'Hacé tu pedido de empanadas árabes online y recibilo por WhatsApp. Elegí tu sucursal y armá tu pedido. Simplemente excepcionales.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="flex min-h-screen flex-col bg-surface-900 text-stone-100">
        <Header />
        <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
