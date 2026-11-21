import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Atelier APC — Studio IA pour Fiches Pédagogiques',
  description:
    'Application IA professionnelle pour générer, retoucher, structurer en tableau et exporter en Word et PDF vos fiches pédagogiques APC.',
  openGraph: {
    title: 'Atelier APC — Studio IA pour Fiches Pédagogiques',
    description:
      'Application IA professionnelle pour générer, retoucher, structurer en tableau et exporter en Word et PDF vos fiches pédagogiques APC.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Atelier APC — Studio IA pour Fiches Pédagogiques',
    description:
      'Application IA professionnelle pour générer, retoucher, structurer en tableau et exporter en Word et PDF vos fiches pédagogiques APC.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 antialiased selection:bg-sky-100 selection:text-sky-900 dark:selection:bg-sky-900 dark:selection:text-sky-100"
      >
        {children}
      </body>
    </html>
  );
}
