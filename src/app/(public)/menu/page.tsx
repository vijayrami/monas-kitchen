
import { Suspense } from 'react';
import { connection } from 'next/server';

import { createClient } from '@/lib/supabase/server';
import {
    getPublishedScheduledMenuByDate,
    type ScheduledMealPackage,
} from '@/lib/menu/scheduled-menu';

interface MenuPageProps {
    searchParams: Promise<{
        date?: string;
    }>;
}

interface BreakfastItem {
    id: string;
    name: string;
    description: string | null;
    price: number | string;
    is_vegetarian: boolean;
}

function getTodayDate(): string {
    return new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Asia/Kolkata',
    }).format(new Date());
}

function isValidDate(value: string): boolean {
    return /^\d{4}-\d{2}-\d{2}$/.test(value)
        && !Number.isNaN(Date.parse(`${value}T00:00:00Z`));
}

function formatMenuDate(value: string): string {
    return new Date(`${value}T00:00:00Z`).toLocaleDateString(
        'en-IN',
        {
            weekday: 'long',
            day: '2-digit',
            month: 'long',
            year: 'numeric',
            timeZone: 'UTC',
        },
    );
}

function MealPackageCard({
    meal,
}: {
    meal: ScheduledMealPackage;
}) {
    const components = [
        { label: 'Dal', value: meal.components.dal },
        { label: 'Rice', value: meal.components.rice },
        { label: 'Roti', value: meal.components.roti },
        { label: 'Sabji', value: meal.components.sabji },
    ];

    return (
        <section className="rounded-xl border bg-white p-5 shadow-sm">
            <h3 className="text-xl font-semibold capitalize">
                {meal.meal_type}
            </h3>

            <div className="mt-4 space-y-3">
                {components.map((component) => (
                    <div
                        key={component.label}
                        className="flex justify-between gap-4 text-sm"
                    >
                        <span className="text-gray-500">
                            {component.label}
                        </span>

                        <span className="text-right font-medium text-gray-900">
                            {component.value || 'Not available'}
                        </span>
                    </div>
                ))}
            </div>

            <div className="mt-5 rounded-lg bg-orange-50 p-4">
                <p className="text-sm font-medium text-gray-700">
                    Today&apos;s Sweet
                </p>

                <p className="mt-1 font-semibold text-orange-700">
                    {meal.components.sweet}
                </p>
            </div>

            <div className="mt-5 space-y-3 border-t pt-4">
                <div className="flex items-center justify-between gap-3">
                    <div>
                        <p className="font-semibold text-gray-900">
                            Regular {meal.meal_type}
                        </p>

                        <p className="text-xs text-gray-500">
                            Without sweet
                        </p>
                    </div>

                    <p className="text-xl font-bold">
                        ₹{meal.regular_price.toFixed(2)}
                    </p>
                </div>

                <div className="flex items-center justify-between gap-3">
                    <div>
                        <p className="font-semibold text-gray-900">
                            Special {meal.meal_type}
                        </p>

                        <p className="text-xs text-gray-500">
                            Includes Today&apos;s sweet
                        </p>
                    </div>

                    <p className="text-xl font-bold text-orange-600">
                        ₹{meal.special_price.toFixed(2)}
                    </p>
                </div>
            </div>
        </section>
    );
}

async function CustomerMenuContent({
    searchParams,
}: MenuPageProps) {
    await connection();

    const params = await searchParams;
    const today = getTodayDate();

    const selectedDate = params.date && isValidDate(params.date)
        ? params.date
        : today;

    const supabase = await createClient();

    const [
        { data: breakfastItems, error: breakfastError },
        scheduledMenu,
    ] = await Promise.all([
        supabase
            .from('menu_items')
            .select(
                'id, name, description, price, is_vegetarian',
            )
            .eq('category', 'breakfast')
            .eq('is_active', true)
            .order('name'),

        getPublishedScheduledMenuByDate(selectedDate),
    ]);

    if (breakfastError) {
        throw new Error('Unable to load breakfast menu.');
    }

    const breakfast = (breakfastItems ?? []) as BreakfastItem[];

    const lunch = scheduledMenu?.meals.find(
        (meal) => meal.meal_type === 'lunch',
    );

    const dinner = scheduledMenu?.meals.find(
        (meal) => meal.meal_type === 'dinner',
    );

    return (
        <main className="mx-auto max-w-6xl space-y-10 px-6 py-10">
            <header>
                <h1 className="text-3xl font-bold text-gray-900">
                    Today&apos;s Menu
                </h1>

                <p className="mt-2 text-gray-600">
                    Fresh, homemade meals prepared for your society.
                </p>
            </header>

            <section className="rounded-xl border bg-white p-5">
                <form method="GET" className="flex flex-wrap items-end gap-4">
                    <div>
                        <label
                            htmlFor="menu-date"
                            className="mb-2 block text-sm font-medium text-gray-700"
                        >
                            Select Menu Date
                        </label>

                        <input
                            id="menu-date"
                            name="date"
                            type="date"
                            defaultValue={selectedDate}
                            required
                            className="rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                        />
                    </div>

                    <button
                        type="submit"
                        className="rounded-lg bg-orange-600 px-5 py-3 text-sm font-semibold text-white hover:bg-orange-700"
                    >
                        View Menu
                    </button>
                </form>

                <p className="mt-3 text-sm text-gray-500">
                    {formatMenuDate(selectedDate)}
                </p>
            </section>

            <section>
                <h2 className="mb-5 text-2xl font-bold">
                    Breakfast
                </h2>

                {breakfast.length === 0 ? (
                    <p className="rounded-lg bg-gray-50 p-5 text-sm text-gray-500">
                        No breakfast items are currently available.
                    </p>
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {breakfast.map((item) => (
                            <article
                                key={item.id}
                                className="rounded-xl border bg-white p-5 shadow-sm"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <h3 className="font-semibold text-gray-900">
                                            {item.name}
                                        </h3>

                                        {item.description && (
                                            <p className="mt-1 text-sm text-gray-500">
                                                {item.description}
                                            </p>
                                        )}
                                    </div>

                                    {item.is_vegetarian && (
                                        <span className="rounded-full bg-green-100 px-2 py-1 text-xs text-green-700">
                                            Veg
                                        </span>
                                    )}
                                </div>

                                <p className="mt-4 text-lg font-bold text-orange-600">
                                    ₹{Number(item.price).toFixed(2)}
                                </p>
                            </article>
                        ))}
                    </div>
                )}
            </section>

            <section>
                <h2 className="mb-5 text-2xl font-bold">
                    Lunch
                </h2>

                {lunch ? (
                    <MealPackageCard meal={lunch} />
                ) : (
                    <p className="rounded-lg bg-gray-50 p-5 text-sm text-gray-500">
                        Lunch menu has not been published for this date.
                    </p>
                )}
            </section>

            <section>
                <h2 className="mb-5 text-2xl font-bold">
                    Dinner
                </h2>

                {dinner ? (
                    <MealPackageCard meal={dinner} />
                ) : (
                    <p className="rounded-lg bg-gray-50 p-5 text-sm text-gray-500">
                        Dinner menu has not been published for this date.
                    </p>
                )}
            </section>
        </main>
    );
}

function MenuFallback() {
    return (
        <main className="mx-auto max-w-6xl px-6 py-10">
            <p className="text-gray-500">
                Loading Today&apos;s menu...
            </p>
        </main>
    );
}

export default function MenuPage({
    searchParams,
}: MenuPageProps) {
    return (
        <Suspense fallback={<MenuFallback />}>
            <CustomerMenuContent searchParams={searchParams} />
        </Suspense>
    );
}
