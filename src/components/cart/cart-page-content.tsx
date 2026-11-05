'use client';

import { useCart } from '@/hooks/use-cart';
import { CartEmptyState } from '@/components/cart/cart-empty-state';
import { CartItemList } from '@/components/cart/cart-item-list';
import { CartSummary } from '@/components/cart/cart-summary';

function formatCartDate(value: string): string {
    if (!value) {
        return '';
    }

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

export function CartPageContent() {
    const { cart, itemCount, isHydrated } = useCart();

    if (!isHydrated) {
        return (
            <main className="mx-auto max-w-6xl px-6 py-10">
                <p className="text-sm text-gray-500">
                    Loading your cart...
                </p>
            </main>
        );
    }

    return (
        <main className="mx-auto max-w-6xl space-y-8 px-6 py-10">
            <header className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                        Your Cart
                    </h1>

                    <p className="mt-2 text-sm text-gray-500">
                        {formatCartDate(cart.orderDate)}
                    </p>
                </div>

                <span className="rounded-full bg-orange-100 px-3 py-1 text-sm font-semibold text-orange-700">
                    {itemCount} {itemCount === 1 ? 'item' : 'items'}
                </span>
            </header>

            {itemCount === 0 ? (
                <CartEmptyState />
            ) : (
                <div className="grid items-start gap-8 lg:grid-cols-[1fr_360px]">
                    <CartItemList />
                    <CartSummary />
                </div>
            )}
        </main>
    );
}