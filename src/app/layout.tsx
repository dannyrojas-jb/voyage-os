import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Voyage OS - Travel agency operations',
  description:
    'A demo travel-agency operations platform: CRM, AI itinerary builder, client portal, and commission tracking. Built by TruePulse OS.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
