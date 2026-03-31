import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'La Hormiga Borracha — Simulador de Movimiento Aleatorio',
  description:
    'Simulador universitario de movimiento aleatorio (Random Walk). Configura una cuadrícula N×M, posiciona la hormiga y observa su trayectoria paso a paso con visualización en tiempo real.',
  keywords: ['hormiga borracha', 'random walk', 'simulación', 'algoritmo', 'universidad'],
  authors: [{ name: 'Proyecto Universitario' }],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
