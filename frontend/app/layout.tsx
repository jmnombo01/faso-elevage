import type { Metadata } from 'next';
import './globals.css';
import Header from '../components/Header';

export const metadata: Metadata = {
  title: 'Faso Élevage - Vente animaux Burkina Faso',
  description: 'Plateforme n°1 de vente d animaux d élevage au Burkina: poulets, bovins, ovins, caprins, porcins, lapins. Contact direct éleveur.',
  manifest: '/manifest.json',
  themeColor: '#16A34A',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Faso Élevage',
  },
  icons: {
    icon: [
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [{ url: '/icon-192.png', sizes: '192x192' }],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body>
        <Header />
        <main className="max-w-6xl mx-auto px-4 pb-24 md:pb-8 pt-6">{children}</main>
        <footer className="mt-12 border-t bg-white">
          <div className="max-w-6xl mx-auto px-4 py-8 text-sm text-gray-500 flex flex-col md:flex-row justify-between gap-4">
            <div>🇧🇫 Faso Élevage • MVP Phase 1+2 • Ouagadougou • Prix en FCFA • PWA</div>
            <div className="flex gap-4"><span>WhatsApp direct</span><span>•</span><span>Validation manuelle anti-arnaque</span></div>
          </div>
        </footer>
        <script dangerouslySetInnerHTML={{ __html: `
          if ('serviceWorker' in navigator) {
            window.addEventListener('load', function() {
              navigator.serviceWorker.register('/sw.js').then(function(reg) {
                console.log('SW registered', reg.scope);
              }).catch(function(err) {
                console.log('SW failed', err);
              });
            });
          }
        `}} />
      </body>
    </html>
  );
}
