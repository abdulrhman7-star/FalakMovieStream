import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'فلك Falak — مشاهدة أحدث الأفلام والمسلسلات مترجمة مجاناً بجودة 4K/HD',
  description: 'منصة فلك (Falak TV) لمشاهدة وتحميل الأفلام والمسلسلات المترجمة والمدبلجة أونلاين مجاناً بأعلى جودة HD و 4K.',
  icons: {
    icon: 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 64 64%22%3E%3Cdefs%3E%3ClinearGradient id=%22fG%22 x1=%220%25%22 y1=%220%25%22 x2=%22100%25%22 y2=%22100%25%22%3E%3Cstop offset=%220%25%22 stop-color=%22%23ff1e27%22/%3E%3Cstop offset=%22100%25%22 stop-color=%22%238a0309%22/%3E%3C/linearGradient%3E%3C/defs%3E%3Ccircle cx=%2232%22 cy=%2232%22 r=%2230%22 fill=%22%2308090d%22 stroke=%22url(%23fG)%22 stroke-width=%223%22/%3E%3C/svg%3E',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="preconnect" href="https://api.themoviedb.org" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="font-sans antialiased bg-[#07080b] text-white">{children}</body>
    </html>
  );
}
