import { Suspense } from 'react';
import { connection } from 'next/server';
import { redirect } from 'next/navigation';

import { createClient } from '@/lib/supabase/server';

async function AdminContent({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    await connection();

    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    const { data: profile, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .maybeSingle();

    if (error || profile?.role !== 'admin') {
        redirect('/menu');
    }

    return <>{children}</>;
}

function AdminFallback() {
    return (
        <main className="mx-auto max-w-6xl px-6 py-10">
            <p className="text-gray-500">Loading admin dashboard...</p>
        </main>
    );
}

export default function AdminLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <Suspense fallback={<AdminFallback />}>
            <AdminContent>{children}</AdminContent>
        </Suspense>
    );
}