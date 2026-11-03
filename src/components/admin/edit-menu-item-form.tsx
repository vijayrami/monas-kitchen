'use client';

import { useActionState } from 'react';

import {
    updateMenuItem,
    type MenuItemActionState,
} from '@/actions/menu.actions';

type MenuItem = {
    id: string;
    name: string;
    description: string | null;
    price: number;
    category: 'breakfast' | 'lunch' | 'dinner';
    is_vegetarian: boolean;
    is_active: boolean;
};

type EditMenuItemFormProps = {
    item: MenuItem;
};

const initialState: MenuItemActionState = {};

export function EditMenuItemForm({
    item,
}: EditMenuItemFormProps) {
    const [state, formAction, isPending] = useActionState(
        updateMenuItem,
        initialState,
    );

    return (
        <form
            action={formAction}
            className="space-y-4 rounded-lg border bg-gray-50 p-4"
        >
            <input type="hidden" name="id" value={item.id} />

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
                    htmlFor={`name-${item.id}`}
                    className="mb-1 block text-sm font-medium"
                >
                    Name
                </label>

                <input
                    id={`name-${item.id}`}
                    name="name"
                    type="text"
                    defaultValue={item.name}
                    required
                    className="w-full rounded-lg border px-3 py-2"
                />
            </div>

            <div>
                <label
                    htmlFor={`description-${item.id}`}
                    className="mb-1 block text-sm font-medium"
                >
                    Description
                </label>

                <textarea
                    id={`description-${item.id}`}
                    name="description"
                    rows={2}
                    defaultValue={item.description ?? ''}
                    className="w-full rounded-lg border px-3 py-2"
                />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                <div>
                    <label
                        htmlFor={`price-${item.id}`}
                        className="mb-1 block text-sm font-medium"
                    >
                        Price (₹)
                    </label>

                    <input
                        id={`price-${item.id}`}
                        name="price"
                        type="number"
                        min="0"
                        step="0.01"
                        defaultValue={item.price}
                        required
                        className="w-full rounded-lg border px-3 py-2"
                    />
                </div>

                <div>
                    <label
                        htmlFor={`category-${item.id}`}
                        className="mb-1 block text-sm font-medium"
                    >
                        Meal
                    </label>

                    <select
                        id={`category-${item.id}`}
                        name="category"
                        defaultValue={item.category}
                        className="w-full rounded-lg border px-3 py-2"
                    >
                        <option value="breakfast">Breakfast</option>
                        <option value="lunch">Lunch</option>
                        <option value="dinner">Dinner</option>
                    </select>
                </div>
            </div>

            <div className="flex flex-wrap gap-5">
                <label className="flex items-center gap-2 text-sm">
                    <input
                        type="checkbox"
                        name="isVegetarian"
                        value="true"
                        defaultChecked={item.is_vegetarian}
                    />
                    Vegetarian
                </label>

                <label className="flex items-center gap-2 text-sm">
                    <input
                        type="checkbox"
                        name="isActive"
                        value="true"
                        defaultChecked={item.is_active}
                    />
                    Active
                </label>
            </div>

            <button
                type="submit"
                disabled={isPending}
                className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700 disabled:opacity-50"
            >
                {isPending ? 'Saving...' : 'Save Changes'}
            </button>
        </form>
    );
}