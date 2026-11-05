'use client';

import { useCart } from '@/hooks/use-cart';

interface BreakfastItemSelectorProps {
    item: {
        id: string;
        name: string;
        price: number;
    };
}

export function BreakfastItemSelector({
    item,
}: BreakfastItemSelectorProps) {
    const {
        cart,
        addBreakfastItem,
        updateBreakfastQuantity,
    } = useCart();

    const selectedItem = cart.breakfastItems.find(
        cartItem => cartItem.menuItemId === item.id
    );

    const quantity = selectedItem?.quantity ?? 0;

    function handleAdd() {
        addBreakfastItem({
            menuItemId: item.id,
            name: item.name,
            displayedPrice: item.price,
        });
    }

    return (
        <div className="mt-4">
            {quantity === 0 ? (
                <button
                    type="button"
                    onClick={handleAdd}
                    className="w-full rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-700"
                >
                    Add to Cart
                </button>
            ) : (
                <div className="flex items-center justify-between rounded-lg border border-orange-200 bg-orange-50 p-2">
                    <button
                        type="button"
                        onClick={() =>
                            updateBreakfastQuantity(item.id, quantity - 1)
                        }
                        aria-label={`Decrease ${item.name} quantity`}
                        className="flex size-9 items-center justify-center rounded-md bg-white text-lg font-semibold text-orange-700 hover:bg-orange-100"
                    >
                        −
                    </button>

                    <span className="font-semibold text-gray-900">
                        {quantity}
                    </span>

                    <button
                        type="button"
                        onClick={() =>
                            updateBreakfastQuantity(item.id, quantity + 1)
                        }
                        disabled={quantity >= 20}
                        aria-label={`Increase ${item.name} quantity`}
                        className="flex size-9 items-center justify-center rounded-md bg-white text-lg font-semibold text-orange-700 hover:bg-orange-100 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        +
                    </button>
                </div>
            )}
        </div>
    );
}