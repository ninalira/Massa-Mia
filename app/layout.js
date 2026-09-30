import '@mantine/core/styles.css';
import './globals.css';
import { MantineProvider } from '@mantine/core';
import { Fredoka, Nunito } from 'next/font/google';
import { theme } from '@/theme';

// Fontes 
const fonteTitulo = Fredoka({ subsets: ['latin'], weight: ['500', '600'], variable: '--font-titulo' });
const fonteTexto = Nunito({ subsets: ['latin'], weight: ['400', '600', '700', '800'], variable: '--font-texto' });

export const metadata = {
  title: 'Massa Mia',
  description: 'Sistema de gestão da pizzaria Massa Mia',
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR" className={`${fonteTitulo.variable} ${fonteTexto.variable}`}>
      <body>
        <MantineProvider theme={theme}>{children}</MantineProvider>
      </body>
    </html>
  );
}
