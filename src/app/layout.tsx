import type { Metadata } from 'next';
import { Suspense } from 'react';

import { Header } from '@/components/layout/header';

import './globals.css';

export const metadata: Metadata = {
    title: "Mona's Kitchen",
    description: 'Fresh, homemade food for your society.',
};

function HeaderFallback() {
    return (
        <header className="border-b bg-white">
            <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
                <div className="text-xl font-bold text-orange-600">
                    Mona&apos;s Kitchen
                </div>

                <div className="h-9 w-32" />
            </div>
        </header>
    );
}

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body>
                <Suspense fallback={<HeaderFallback />}>
                    <Header />
                </Suspense>

                {children}
            </body>
        </html>
    );
}