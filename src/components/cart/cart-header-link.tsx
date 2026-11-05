'use client';

import Link from 'next/link';

import { useCart } from '@/hooks/use-cart';

export function CartHeaderLink() {
    const { itemCount, isHydrated } = useCart();

    return (
        <Link
            href="/cart"
            aria-label={`Shopping cart, ${itemCount} items`}
            className="relative inline-flex items-center gap-2 rounded-lg px-2 py-2 text-gray-700 hover:bg-orange-50 hover:text-orange-600"
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="21"
                height="21"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
            >
                <circle cx="9" cy="21" r="1" />
                <circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>

            <span className="text-sm font-medium">
                Cart
            </span>

            {isHydrated && itemCount > 0 && (
                <span className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-orange-600 text-[10px] font-bold text-white">
                    {itemCount > 99 ? '99+' : itemCount}
                </span>
            )}
        </Link>
    );
}