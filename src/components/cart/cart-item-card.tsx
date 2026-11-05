'use client';

import { useCart } from '@/hooks/use-cart';

interface CartItemCardProps {
    title: string;
    description: string;
    quantity: number;
    unitPrice: number;
    onQuantityChange: (quantity: number) => void;
    onRemove: () => void;
}

export function CartItemCard({
    title,
    description,
    quantity,
    unitPrice,
    onQuantityChange,
    onRemove,
}: CartItemCardProps) {
    const { isHydrated } = useCart();

    if (!isHydrated) {
        return null;
    }

    return (
        <article className="flex flex-wrap items-center justify-between gap-4 border-b py-5 last:border-b-0">
            <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-gray-900">
                    {title}
                </h3>

                <p className="mt-1 text-sm text-gray-500">
                    {description}
                </p>

                <p className="mt-2 text-sm font-medium text-orange-600">
                    ₹{unitPrice.toFixed(2)} each
                </p>
            </div>

            <div className="flex items-center gap-3">
                <button
                    type="button"
                    onClick={() => onQuantityChange(quantity - 1)}
                    disabled={quantity <= 1}
                    aria-label={`Decrease ${title} quantity`}
                    className="flex size-8 items-center justify-center rounded-md border disabled:opacity-40"
                >
                    −
                </button>

                <span className="min-w-5 text-center font-semibold">
                    {quantity}
                </span>

                <button
                    type="button"
                    onClick={() => onQuantityChange(quantity + 1)}
                    disabled={quantity >= 20}
                    aria-label={`Increase ${title} quantity`}
                    className="flex size-8 items-center justify-center rounded-md border disabled:opacity-40"
                >
                    +
                </button>
            </div>

            <div className="min-w-24 text-right">
                <p className="font-bold text-gray-900">
                    ₹{(unitPrice * quantity).toFixed(2)}
                </p>

                <button
                    type="button"
                    onClick={onRemove}
                    className="mt-1 text-xs font-medium text-red-600 hover:text-red-700"
                >
                    Remove
                </button>
            </div>
        </article>
    );
}