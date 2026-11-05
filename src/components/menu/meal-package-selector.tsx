'use client';

import { useCart } from '@/hooks/use-cart';
import type { ScheduledMealPackage } from '@/lib/menu/scheduled-menu';

interface MealPackageSelectorProps {
    meal: ScheduledMealPackage;
}

export function MealPackageSelector({
    meal,
}: MealPackageSelectorProps) {
    const {
        cart,
        setLunchPackage,
        setDinnerPackage,
        removeLunchPackage,
        removeDinnerPackage,
    } = useCart();

    const isLunch = meal.meal_type === 'lunch';
    const selection = isLunch ? cart.lunch : cart.dinner;

    const updateSelection = isLunch
        ? setLunchPackage
        : setDinnerPackage;

    const removeSelection = isLunch
        ? removeLunchPackage
        : removeDinnerPackage;

    function selectPackage(option: 'regular' | 'special') {
        const displayedPrice = option === 'regular'
            ? meal.regular_price
            : meal.special_price;

        updateSelection({
            option,
            quantity: selection?.option === option
                ? selection.quantity
                : 1,
            displayedPrice,
            sweetName: meal.components.sweet,
        });
    }

    function updateQuantity(quantity: number) {
        if (!selection || quantity < 1) {
            return;
        }

        updateSelection({
            ...selection,
            quantity: Math.min(quantity, 20),
        });
    }

    return (
        <div className="mt-5 space-y-4 border-t pt-4">
            <div className="grid gap-3 sm:grid-cols-2">
                <button
                    type="button"
                    onClick={() => selectPackage('regular')}
                    aria-pressed={selection?.option === 'regular'}
                    className={`rounded-lg border p-4 text-left transition ${
                        selection?.option === 'regular'
                            ? 'border-orange-500 bg-orange-50 ring-1 ring-orange-500'
                            : 'border-gray-200 hover:border-orange-300'
                    }`}
                >
                    <span className="block font-semibold text-gray-900">
                        Regular {meal.meal_type}
                    </span>

                    <span className="mt-1 block text-xs text-gray-500">
                        Dal, Rice, Roti and Sabji
                    </span>

                    <span className="mt-3 block text-xl font-bold text-gray-900">
                        ₹{meal.regular_price.toFixed(2)}
                    </span>
                </button>

                <button
                    type="button"
                    onClick={() => selectPackage('special')}
                    aria-pressed={selection?.option === 'special'}
                    className={`rounded-lg border p-4 text-left transition ${
                        selection?.option === 'special'
                            ? 'border-orange-500 bg-orange-50 ring-1 ring-orange-500'
                            : 'border-gray-200 hover:border-orange-300'
                    }`}
                >
                    <span className="block font-semibold text-gray-900">
                        Special {meal.meal_type}
                    </span>

                    <span className="mt-1 block text-xs text-gray-500">
                        Includes today&apos;s sweet
                    </span>

                    <span className="mt-3 block text-xl font-bold text-orange-600">
                        ₹{meal.special_price.toFixed(2)}
                    </span>
                </button>
            </div>

            {selection && (
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-gray-50 p-3">
                    <div>
                        <p className="text-sm font-semibold capitalize text-gray-900">
                            {selection.option} {meal.meal_type}
                        </p>

                        <p className="text-xs text-gray-500">
                            ₹{selection.displayedPrice.toFixed(2)} per package
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => updateQuantity(selection.quantity - 1)}
                            disabled={selection.quantity <= 1}
                            aria-label={`Decrease ${meal.meal_type} quantity`}
                            className="flex size-8 items-center justify-center rounded-md border bg-white disabled:opacity-40"
                        >
                            −
                        </button>

                        <span className="min-w-5 text-center font-semibold">
                            {selection.quantity}
                        </span>

                        <button
                            type="button"
                            onClick={() => updateQuantity(selection.quantity + 1)}
                            disabled={selection.quantity >= 20}
                            aria-label={`Increase ${meal.meal_type} quantity`}
                            className="flex size-8 items-center justify-center rounded-md border bg-white disabled:opacity-40"
                        >
                            +
                        </button>

                        <button
                            type="button"
                            onClick={removeSelection}
                            className="ml-1 text-sm font-medium text-red-600 hover:text-red-700"
                        >
                            Remove
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}