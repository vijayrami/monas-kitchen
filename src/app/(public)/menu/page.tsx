import { Suspense } from 'react';
import { connection } from 'next/server';

import { createClient } from '@/lib/supabase/server';
import {
    getPublishedScheduledMenuByDate,
} from '@/lib/menu/scheduled-menu';

import { CustomerMenuClient } from '@/components/menu/customer-menu-client';
import type { CustomerBreakfastItem } from '@/components/menu/breakfast-menu-section';

interface MenuPageProps {
    searchParams: Promise<{
        date?: string;
    }>;
}

function getTodayDate(): string {
    return new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Asia/Kolkata',
    }).format(new Date());
}

function isValidDate(value: string): boolean {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        return false;
    }

    const date = new Date(`${value}T00:00:00Z`);

    return !Number.isNaN(date.getTime())
        && date.toISOString().slice(0, 10) === value;
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
            .select('id, name, description, price, is_vegetarian')
            .eq('category', 'breakfast')
            .eq('is_active', true)
            .order('name'),

        getPublishedScheduledMenuByDate(selectedDate),
    ]);

    if (breakfastError) {
        throw new Error('Unable to load breakfast menu.');
    }

    const breakfast: CustomerBreakfastItem[] = (
        breakfastItems ?? []
    ).map(item => ({
        id: item.id,
        name: item.name,
        description: item.description,
        price: Number(item.price),
        is_vegetarian: item.is_vegetarian,
    }));

    const lunch = scheduledMenu?.meals.find(
        meal => meal.meal_type === 'lunch'
    ) ?? null;

    const dinner = scheduledMenu?.meals.find(
        meal => meal.meal_type === 'dinner'
    ) ?? null;

    return (
        <CustomerMenuClient
            selectedDate={selectedDate}
            breakfastItems={breakfast}
            lunch={lunch}
            dinner={dinner}
        />
    );
}

function MenuFallback() {
    return (
        <main className="mx-auto max-w-6xl px-6 py-10">
            <p className="text-gray-500">
                Loading menu...
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