'use client';

import Link from 'next/link';

import { useCart } from '@/hooks/use-cart';

export function CartSummary() {
    const {
        cart,
        subtotal,
        itemCount,
        setDeliveryType,
        setNotes,
        clearCart,
    } = useCart();

    return (
        <aside className="h-fit rounded-xl border bg-white p-5 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900">
                Order Summary
            </h2>

            <div className="mt-5 space-y-3 text-sm">
                <div className="flex justify-between text-gray-600">
                    <span>Total items</span>
                    <span>{itemCount}</span>
                </div>

                <div className="flex justify-between border-t pt-3">
                    <span className="font-semibold text-gray-900">
                        Subtotal
                    </span>

                    <span className="text-xl font-bold text-orange-600">
                        ₹{subtotal.toFixed(2)}
                    </span>
                </div>
            </div>

            <div className="mt-6 border-t pt-5">
                <label
                    htmlFor="delivery-type"
                    className="mb-2 block text-sm font-semibold text-gray-900"
                >
                    Delivery preference
                </label>

                <select
                    id="delivery-type"
                    value={cart.deliveryType}
                    onChange={event =>
                        setDeliveryType(
                            event.target.value as 'pickup' | 'delivery'
                        )
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-3 text-sm outline-none focus:border-orange-500"
                >
                    <option value="pickup">Pickup</option>
                    <option value="delivery">Delivery</option>
                </select>
            </div>

            <div className="mt-5">
                <label
                    htmlFor="order-notes"
                    className="mb-2 block text-sm font-semibold text-gray-900"
                >
                    Additional notes
                </label>

                <textarea
                    id="order-notes"
                    value={cart.notes}
                    onChange={event => setNotes(event.target.value)}
                    maxLength={500}
                    rows={4}
                    placeholder="Any special instructions..."
                    className="w-full resize-y rounded-lg border border-gray-300 px-3 py-3 text-sm outline-none focus:border-orange-500"
                />

                <p className="mt-1 text-right text-xs text-gray-400">
                    {cart.notes.length}/500
                </p>
            </div>

            <div className="mt-6 space-y-3">
                <button
                    type="button"
                    disabled
                    className="w-full cursor-not-allowed rounded-lg bg-orange-600 px-5 py-3 text-sm font-semibold text-white opacity-60"
                >
                    Checkout — Coming in Phase 4
                </button>

                <Link
                    href="/menu"
                    className="block w-full rounded-lg border px-5 py-3 text-center text-sm font-semibold text-gray-700 hover:bg-gray-50"
                >
                    Continue Shopping
                </Link>

                <button
                    type="button"
                    onClick={clearCart}
                    className="w-full py-2 text-sm font-medium text-red-600 hover:text-red-700"
                >
                    Clear Cart
                </button>
            </div>

            <p className="mt-4 text-xs leading-5 text-gray-500">
                Prices shown are indicative. Final prices and order
                eligibility will be validated when you place your order.
            </p>
        </aside>
    );
}