
import { Suspense } from 'react';
import { connection } from 'next/server';

import { createClient } from '@/lib/supabase/server';

import { MenuItemForm } from '@/components/admin/menu-item-form';
import { EditMenuItemForm } from '@/components/admin/edit-menu-item-form';
import { DeleteMenuItemButton } from '@/components/admin/delete-menu-item-button';
import { ToggleMenuItemButton } from '@/components/admin/toggle-menu-item-button';

async function MenuItemsContent() {
    await connection();

    const supabase = await createClient();

    const { data: menuItems, error } = await supabase
        .from('menu_items')
        .select(
            'id, name, description, price, category, is_vegetarian, is_active',
        )
        .order('category')
        .order('name');

    if (error) {
        return (
            <main className="mx-auto max-w-6xl px-6 py-10">
                <div className="rounded-lg bg-red-50 p-4 text-red-700">
                    Unable to load menu items.
                </div>
            </main>
        );
    }

    return (
        <main className="mx-auto max-w-6xl px-6 py-10">
            <div className="mb-8">
                <h1 className="text-3xl font-bold">
                    Menu Items
                </h1>

                <p className="mt-2 text-gray-600">
                    Manage reusable breakfast, lunch, and dinner items.
                </p>
            </div>

            <div className="grid gap-8 lg:grid-cols-[380px_1fr]">
                <section>
                    <MenuItemForm />
                </section>

                <section>
                    <div className="space-y-4">
                        {menuItems.length === 0 ? (
                            <div className="rounded-xl border bg-white p-6 text-gray-500">
                                No menu items found.
                            </div>
                        ) : (
                            menuItems.map((item) => (
                                <article
                                    key={item.id}
                                    className="rounded-xl border bg-white p-5 shadow-sm"
                                >
                                    <div className="mb-4 flex items-start justify-between gap-4">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h2 className="font-semibold">
                                                    {item.name}
                                                </h2>

                                                <span className="rounded-full bg-gray-100 px-2 py-1 text-xs capitalize">
                                                    {item.category}
                                                </span>

                                                {item.is_vegetarian && (
                                                    <span className="rounded-full bg-green-100 px-2 py-1 text-xs text-green-700">
                                                        Veg
                                                    </span>
                                                )}
                                            </div>

                                            {item.description && (
                                                <p className="mt-1 text-sm text-gray-500">
                                                    {item.description}
                                                </p>
                                            )}

                                            <p className="mt-2 font-semibold text-orange-600">
                                                ₹{Number(item.price).toFixed(2)}
                                            </p>
                                        </div>

                                        <span
                                            className={`rounded-full px-2 py-1 text-xs ${
                                                item.is_active
                                                    ? 'bg-green-100 text-green-700'
                                                    : 'bg-gray-100 text-gray-500'
                                            }`}
                                        >
                                            {item.is_active
                                                ? 'Active'
                                                : 'Inactive'}
                                        </span>
                                    </div>

                                    <EditMenuItemForm item={item} />

                                    <div className="mt-4 flex flex-wrap gap-2 border-t pt-4">
                                        <ToggleMenuItemButton
                                            id={item.id}
                                            isActive={item.is_active}
                                        />

                                        <DeleteMenuItemButton
                                            id={item.id}
                                        />
                                    </div>
                                </article>
                            ))
                        )}
                    </div>
                </section>
            </div>
        </main>
    );
}

function MenuItemsFallback() {
    return (
        <main className="mx-auto max-w-6xl px-6 py-10">
            <p className="text-gray-500">
                Loading menu items...
            </p>
        </main>
    );
}

export default function MenuItemsPage() {
    return (
        <Suspense fallback={<MenuItemsFallback />}>
            <MenuItemsContent />
        </Suspense>
    );
}
