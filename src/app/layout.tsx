import React from 'react';
import { Metadata } from 'next';
import type { Viewport } from 'next';
import { Inter } from 'next/font/google';
import '@radix-ui/themes/styles.css';
import './globals.css';
import './theme-config.css';
import { Theme } from '@radix-ui/themes';
import StoreProvider from './store-provider';

const inter = Inter({ subsets: ['latin'] });

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: 'RanChat Web',
  description: 'Random Video Chat Web Application',
  authors: [{ name: 'Diaz Linggaputra' }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <StoreProvider>
          <Theme
            accentColor="purple"
            grayColor="gray"
            panelBackground="solid"
            scaling="100%"
            radius="full"
          >
            {children}
          </Theme>
        </StoreProvider>
      </body>
    </html>
  );
}
