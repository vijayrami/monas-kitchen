import { Suspense } from 'react';
import { connection } from 'next/server';
import { notFound } from 'next/navigation';
import { z } from 'zod';

import { ScheduledMenuForm } from '@/components/admin/scheduled-menu-form';
import { getScheduledMenuById } from '@/lib/menu/scheduled-menu';

interface EditScheduledMenuPageProps {
    params: Promise<{
        id: string;
    }>;
}

async function EditScheduledMenuContent({
    id,
}: {
    id: string;
}) {
    await connection();

    const validId = z.string().uuid().safeParse(id);

    if (!validId.success) {
        notFound();
    }

    const menu = await getScheduledMenuById(validId.data);

    if (!menu) {
        notFound();
    }

    return (
        <main className="mx-auto max-w-6xl space-y-8 px-6 py-10">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">
                    Edit Scheduled Menu
                </h1>

                <p className="mt-2 text-gray-600">
                    Update the lunch and dinner menu components for this date.
                </p>
            </div>

            {menu.is_published && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                    This menu is currently published. Changes may become
                    visible to customers immediately after saving.
                    Unpublish it first if you want to edit it privately.
                </div>
            )}

            <ScheduledMenuForm initialMenu={menu} />
        </main>
    );
}

function EditScheduledMenuFallback() {
    return (
        <main className="mx-auto max-w-6xl px-6 py-10">
            <p className="text-gray-500">
                Loading scheduled menu...
            </p>
        </main>
    );
}

export default async function EditScheduledMenuPage({
    params,
}: EditScheduledMenuPageProps) {
    const { id } = await params;

    return (
        <Suspense fallback={<EditScheduledMenuFallback />}>
            <EditScheduledMenuContent id={id} />
        </Suspense>
    );
}