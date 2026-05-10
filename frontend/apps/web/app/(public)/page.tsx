import type { Metadata } from 'next';
import { CustomerHome } from '@repo/ui-web';

export const metadata: Metadata = {
  title: 'KOBİ AI — Müşteri İşlem Merkezi',
  description: 'Sipariş sorgulama, kargo takibi ve stok durumu sorgulama merkezi.',
};

export default function HomePage() {
  return <CustomerHome />;
}
