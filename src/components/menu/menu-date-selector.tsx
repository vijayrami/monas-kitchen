'use client';

import { useRouter } from 'next/navigation';
import { useCart } from '@/hooks/use-cart';
import type { ChangeEvent } from 'react';

interface MenuDateSelectorProps {
    selectedDate: string;
}

export function MenuDateSelector({
    selectedDate,
}: MenuDateSelectorProps) {
    const router = useRouter();
    const { setOrderDate } = useCart();

    function handleDateChange(event: ChangeEvent<HTMLInputElement>) {
        const selected = event.target.value;

        if (!selected) {
            return;
        }

        setOrderDate(selected);
        router.push(`/menu?date=${encodeURIComponent(selected)}`);
    }

    return (
        <section className="rounded-xl border bg-white p-5">
            <div className="flex flex-wrap items-end gap-4">
                <div>
                    <label
                        htmlFor="menu-date"
                        className="mb-2 block text-sm font-medium text-gray-700"
                    >
                        Select Menu Date
                    </label>

                    <input
                        id="menu-date"
                        type="date"
                        value={selectedDate}
                        onChange={handleDateChange}
                        required
                        className="rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                    />
                </div>
            </div>
        </section>
    );
}