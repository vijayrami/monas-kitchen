import type { Metadata } from 'next';

import './globals.css';

export const metadata: Metadata = {
    title: "Mona's Kitchen",
    description: 'Fresh, homemade food for your society.',
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body>{children}</body>
        </html>
    );
}