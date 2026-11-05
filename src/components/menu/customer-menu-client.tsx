'use client';

import { useEffect } from 'react';

import { useCart } from '@/hooks/use-cart';
import { BreakfastMenuSection } from '@/components/menu/breakfast-menu-section';
import { MealPackageCard } from '@/components/menu/meal-package-card';
import { MenuDateSelector } from '@/components/menu/menu-date-selector';

import type { CustomerBreakfastItem } from '@/components/menu/breakfast-menu-section';
import type { ScheduledMealPackage } from '@/lib/menu/scheduled-menu';

interface CustomerMenuClientProps {
    selectedDate: string;
    breakfastItems: CustomerBreakfastItem[];
    lunch: ScheduledMealPackage | null;
    dinner: ScheduledMealPackage | null;
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
        }
    );
}

export function CustomerMenuClient({
    selectedDate,
    breakfastItems,
    lunch,
    dinner,
}: CustomerMenuClientProps) {
    const { cart, setOrderDate } = useCart();

    useEffect(() => {
        if (cart.orderDate !== selectedDate) {
            // Synchronize cart date with the selected server-rendered menu.
            setOrderDate(selectedDate);
        }
    }, [cart.orderDate, selectedDate, setOrderDate]);

    return (
        <main className="mx-auto max-w-6xl space-y-10 px-6 py-10">
            <header>
                <h1 className="text-3xl font-bold text-gray-900">
                    Menu
                </h1>

                <p className="mt-2 text-gray-600">
                    Fresh, homemade meals prepared for your society.
                </p>
            </header>

            <div>
                <MenuDateSelector selectedDate={selectedDate} />

                <p className="mt-3 text-sm text-gray-500">
                    {formatMenuDate(selectedDate)}
                </p>
            </div>

            <BreakfastMenuSection items={breakfastItems} />

            <section>
                <h2 className="mb-5 text-2xl font-bold text-gray-900">
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
                <h2 className="mb-5 text-2xl font-bold text-gray-900">
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

            {cart.orderDate === selectedDate && (
                <div className="rounded-xl border border-orange-200 bg-orange-50 p-4">
                    <p className="text-sm font-medium text-orange-800">
                        Your selections are saved in your cart.
                    </p>
                </div>
            )}
        </main>
    );
}