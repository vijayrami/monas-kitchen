
'use client';

import { useActionState } from 'react';

import {
    saveScheduledMenu,
    type ScheduledMenuActionState,
} from '@/actions/scheduled-menu.actions';

import type { ScheduledMenu } from '@/lib/menu/scheduled-menu';

interface ScheduledMenuFormProps {
    initialMenu?: ScheduledMenu;
}

const initialState: ScheduledMenuActionState = {};

interface MealSectionProps {
    title: string;
    prefix: 'lunch' | 'dinner';
    components?: {
        dal: string;
        rice: string;
        roti: string;
        sabji: string;
        sweet: string;
    };
}

function MealSection({
    title,
    prefix,
    components,
}: MealSectionProps) {
    const fields = [
        { name: 'dal', label: 'Dal', placeholder: 'e.g. Gujarati Dal' },
        { name: 'rice', label: 'Rice', placeholder: 'e.g. Steamed Rice' },
        { name: 'roti', label: 'Roti', placeholder: 'e.g. Wheat Roti' },
        { name: 'sabji', label: 'Sabji', placeholder: 'e.g. Aloo Mutter' },
        { name: 'sweet', label: 'Sweet', placeholder: 'e.g. Gulab Jamun' },
    ] as const;

    return (
        <section className="rounded-xl border bg-white p-6 shadow-sm">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h2 className="text-xl font-semibold">{title}</h2>
                    <p className="mt-1 text-sm text-gray-500">
                        Configure the daily meal components.
                    </p>
                </div>

                <span className="rounded-full bg-orange-50 px-3 py-1 text-sm font-semibold text-orange-700">
                    ₹150 / ₹170
                </span>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
                {fields.map((field) => (
                    <div key={field.name}>
                        <label
                            htmlFor={`${prefix}-${field.name}`}
                            className="mb-2 block text-sm font-medium text-gray-700"
                        >
                            {field.label}
                            {field.name === 'sweet' && (
                                <span className="ml-2 text-xs font-normal text-orange-600">
                                    Special meal
                                </span>
                            )}
                        </label>

                        <input
                            id={`${prefix}-${field.name}`}
                            name={`${prefix}.${field.name}`}
                            type="text"
                            defaultValue={components?.[field.name] ?? ''}
                            placeholder={field.placeholder}
                            required
                            minLength={2}
                            maxLength={100}
                            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                        />
                    </div>
                ))}
            </div>

            <div className="mt-6 rounded-lg bg-orange-50 p-4">
                <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-700">
                        Regular {title}
                    </span>
                    <span className="font-semibold text-gray-900">
                        ₹150
                    </span>
                </div>

                <div className="mt-2 flex items-center justify-between text-sm">
                    <span className="text-gray-700">
                        Special {title} (with Sweet)
                    </span>
                    <span className="font-semibold text-orange-700">
                        ₹170
                    </span>
                </div>
            </div>
        </section>
    );
}

export function ScheduledMenuForm({
    initialMenu,
}: ScheduledMenuFormProps) {
    const [state, formAction, isPending] = useActionState(
        saveScheduledMenu,
        initialState,
    );

    const lunch = initialMenu?.meals.find(
        (meal) => meal.meal_type === 'lunch',
    );

    const dinner = initialMenu?.meals.find(
        (meal) => meal.meal_type === 'dinner',
    );

    return (
        <form action={formAction} className="space-y-8">
            <section className="rounded-xl border bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold">
                    Menu Date
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                    Select the date for which you are preparing the menu.
                </p>

                <div className="mt-4 max-w-sm">
                    <label
                        htmlFor="menuDate"
                        className="mb-2 block text-sm font-medium text-gray-700"
                    >
                        Select Date
                    </label>

                    <input
                        id="menuDate"
                        name="menuDate"
                        type="date"
                        defaultValue={initialMenu?.menu_date ?? ''}
                        required
                        className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                    />
                </div>
            </section>

            <MealSection
                title="Lunch"
                prefix="lunch"
                components={lunch?.components}
            />

            <MealSection
                title="Dinner"
                prefix="dinner"
                components={dinner?.components}
            />

            {state.error && (
                <div
                    role="alert"
                    className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
                >
                    {state.error}
                </div>
            )}

            {state.success && (
                <div
                    role="status"
                    className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700"
                >
                    {state.success}
                </div>
            )}

            <div className="flex flex-wrap justify-end gap-3">
                <button
                    type="submit"
                    disabled={isPending}
                    className="rounded-lg border border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {isPending ? 'Saving...' : 'Save as Draft'}
                </button>
            </div>
        </form>
    );
}
