'use client';

import { useActionState, useEffect, useRef } from 'react';

import {
    createMenuItem,
    type MenuItemActionState,
} from '@/actions/menu.actions';

const initialState: MenuItemActionState = {};

export function MenuItemForm() {
    const [state, formAction, isPending] = useActionState(
        createMenuItem,
        initialState,
    );

    const formRef = useRef<HTMLFormElement>(null);

    useEffect(() => {
        if (state.success) {
            formRef.current?.reset();
        }
    }, [state.success]);

    return (
        <form
            ref={formRef}
            action={formAction}
            className="space-y-5 rounded-xl border bg-white p-6 shadow-sm"
        >
            <div>
                <h2 className="text-lg font-semibold">
                    Add Menu Item
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                    Create a reusable menu item for breakfast, lunch, or
                    dinner.
                </p>
            </div>

            {state.error && (
                <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
                    {state.error}
                </div>
            )}

            {state.success && (
                <div className="rounded-lg bg-green-50 p-3 text-sm text-green-700">
                    {state.success}
                </div>
            )}

            <div>
                <label
                    htmlFor="name"
                    className="mb-1 block text-sm font-medium"
                >
                    Name
                </label>

                <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    placeholder="e.g. Masala Dosa"
                    className="w-full rounded-lg border px-3 py-2"
                />
            </div>

            <div>
                <label
                    htmlFor="description"
                    className="mb-1 block text-sm font-medium"
                >
                    Description
                </label>

                <textarea
                    id="description"
                    name="description"
                    rows={3}
                    placeholder="Optional description"
                    className="w-full rounded-lg border px-3 py-2"
                />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                <div>
                    <label
                        htmlFor="price"
                        className="mb-1 block text-sm font-medium"
                    >
                        Price (₹)
                    </label>

                    <input
                        id="price"
                        name="price"
                        type="number"
                        min="0"
                        step="0.01"
                        required
                        placeholder="60.00"
                        className="w-full rounded-lg border px-3 py-2"
                    />
                </div>

                <div>
                    <label
                        htmlFor="category"
                        className="mb-1 block text-sm font-medium"
                    >
                        Meal
                    </label>

                    <select
                        id="category"
                        name="category"
                        defaultValue="breakfast"
                        className="w-full rounded-lg border px-3 py-2"
                    >
                        <option value="breakfast">Breakfast</option>
                        <option value="lunch">Lunch</option>
                        <option value="dinner">Dinner</option>
                    </select>
                </div>
            </div>

            <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 text-sm">
                    <input
                        type="checkbox"
                        name="isVegetarian"
                        value="true"
                        defaultChecked
                    />
                    Vegetarian
                </label>

                <label className="flex items-center gap-2 text-sm">
                    <input
                        type="checkbox"
                        name="isActive"
                        value="true"
                        defaultChecked
                    />
                    Active
                </label>
            </div>

            <button
                type="submit"
                disabled={isPending}
                className="rounded-lg bg-orange-600 px-5 py-2.5 font-medium text-white hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
                {isPending ? 'Creating...' : 'Create Menu Item'}
            </button>
        </form>
    );
}