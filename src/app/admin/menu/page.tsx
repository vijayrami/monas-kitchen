import { Suspense } from 'react';
import { connection } from 'next/server';

import { ScheduledMenuForm } from '@/components/admin/scheduled-menu-form';
import { ScheduledMenuList } from '@/components/admin/scheduled-menu-list';
import { getScheduledMenus } from '@/lib/menu/scheduled-menu';

async function ScheduledMenuContent() {
    await connection();

    const menus = await getScheduledMenus();

    return (
        <main className="mx-auto max-w-6xl space-y-10 px-6 py-10">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">
                    Scheduled Menu Management
                </h1>

                <p className="mt-2 text-gray-600">
                    Create and manage daily breakfast, lunch, and dinner menus.
                </p>
            </div>

            <section>
                <h2 className="mb-5 text-xl font-semibold">
                    Create Daily Menu
                </h2>

                <ScheduledMenuForm />
            </section>

            <section>
                <div className="mb-5">
                    <h2 className="text-xl font-semibold">
                        Existing Scheduled Menus
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                        Review, edit, publish, or unpublish your daily menus.
                    </p>
                </div>

                <ScheduledMenuList menus={menus} />
            </section>
        </main>
    );
}

function ScheduledMenuFallback() {
    return (
        <main className="mx-auto max-w-6xl px-6 py-10">
            <p className="text-gray-500">
                Loading scheduled menus...
            </p>
        </main>
    );
}

export default function ScheduledMenuPage() {
    return (
        <Suspense fallback={<ScheduledMenuFallback />}>
            <ScheduledMenuContent />
        </Suspense>
    );
}