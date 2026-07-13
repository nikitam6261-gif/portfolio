import type { Metadata } from 'next';
import { Manrope, Unbounded } from 'next/font/google';
import './globals.css';

const manrope = Manrope({ subsets: ['cyrillic', 'latin'], variable: '--font-manrope' });
const unbounded = Unbounded({ subsets: ['cyrillic', 'latin'], variable: '--font-unbounded' });

export const metadata: Metadata = {
  title: 'Пегас-Авто | Управляемая холодовая цепь',
  description: 'Температурная логистика, Control Tower, 3PL, LTL Cold и цифровой контроль перевозок.',
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru" className={`${manrope.variable} ${unbounded.variable}`}>
      <body>{children}</body>
    </html>
  );
}
