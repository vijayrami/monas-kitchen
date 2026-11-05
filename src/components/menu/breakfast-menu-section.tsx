import { BreakfastItemSelector } from '@/components/menu/breakfast-item-selector';

export interface CustomerBreakfastItem {
    id: string;
    name: string;
    description: string | null;
    price: number;
    is_vegetarian: boolean;
}

interface BreakfastMenuSectionProps {
    items: CustomerBreakfastItem[];
}

export function BreakfastMenuSection({
    items,
}: BreakfastMenuSectionProps) {
    return (
        <section>
            <h2 className="mb-5 text-2xl font-bold text-gray-900">
                Breakfast
            </h2>

            {items.length === 0 ? (
                <p className="rounded-lg bg-gray-50 p-5 text-sm text-gray-500">
                    No breakfast items are currently available.
                </p>
            ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {items.map(item => (
                        <article
                            key={item.id}
                            className="rounded-xl border bg-white p-5 shadow-sm"
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <h3 className="font-semibold text-gray-900">
                                        {item.name}
                                    </h3>

                                    {item.description && (
                                        <p className="mt-1 text-sm text-gray-500">
                                            {item.description}
                                        </p>
                                    )}
                                </div>

                                {item.is_vegetarian && (
                                    <span className="rounded-full bg-green-100 px-2 py-1 text-xs text-green-700">
                                        Veg
                                    </span>
                                )}
                            </div>

                            <p className="mt-4 text-lg font-bold text-orange-600">
                                ₹{item.price.toFixed(2)}
                            </p>

                            <BreakfastItemSelector
                                item={{
                                    id: item.id,
                                    name: item.name,
                                    price: item.price,
                                }}
                            />
                        </article>
                    ))}
                </div>
            )}
        </section>
    );
}