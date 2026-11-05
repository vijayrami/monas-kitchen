import { Suspense } from 'react';
import { connection } from 'next/server';

import { getMenuItems } from '@/lib/menu';
import type { MealType } from '@/types/menu';

const mealSections: Array<{
    type: MealType;
    title: string;
}> = [
    {
        type: 'breakfast',
        title: 'Breakfast',
    },
    {
        type: 'lunch',
        title: 'Lunch',
    },
    {
        type: 'dinner',
        title: 'Dinner',
    },
];

async function MenuContent() {
    await connection();

    const menuItems = await getMenuItems();

    return (
        <main className="mx-auto max-w-6xl px-6 py-10">
            <header className="mb-10 text-center">
                <p className="mb-2 text-sm font-medium uppercase tracking-wider text-orange-600">
                    Mona&apos;s Kitchen
                </p>

                <h1 className="text-4xl font-bold tracking-tight">
                    Today&apos;s Menu
                </h1>

                <p className="mx-auto mt-3 max-w-2xl text-gray-600">
                    Fresh, homemade meals prepared with care.
                </p>
            </header>

            <div className="space-y-10">
                {mealSections.map((section) => {
                    const items = menuItems.filter(
                        (item) => item.category === section.type,
                    );

                    return (
                        <section key={section.type}>
                            <h2 className="mb-4 text-2xl font-semibold">
                                {section.title}
                            </h2>

                            {items.length === 0 ? (
                                <p className="text-gray-500">
                                    No items available.
                                </p>
                            ) : (
                                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                    {items.map((item) => (
                                        <article
                                            key={item.id}
                                            className="rounded-xl border bg-white p-5 shadow-sm"
                                        >
                                            <div className="flex items-start justify-between gap-4">
                                                <div>
                                                    <h3 className="text-lg font-semibold">
                                                        {item.name}
                                                    </h3>

                                                    {item.description && (
                                                        <p className="mt-1 text-sm text-gray-600">
                                                            {item.description}
                                                        </p>
                                                    )}
                                                </div>

                                                <span className="whitespace-nowrap font-semibold">
                                                    ₹{item.price.toFixed(2)}
                                                </span>
                                            </div>

                                            {item.isVegetarian && (
                                                <span className="mt-4 inline-block text-xs font-medium text-green-600">
                                                    Vegetarian
                                                </span>
                                            )}
                                        </article>
                                    ))}
                                </div>
                            )}
                        </section>
                    );
                })}
            </div>
        </main>
    );
}

function MenuFallback() {
    return (
        <main className="mx-auto max-w-6xl px-6 py-10">
            <p className="text-center text-gray-500">
                Loading today&apos;s menu...
            </p>
        </main>
    );
}

export default function HomePage() {
    return (
        <Suspense fallback={<MenuFallback />}>
            <MenuContent />
        </Suspense>
    );
}