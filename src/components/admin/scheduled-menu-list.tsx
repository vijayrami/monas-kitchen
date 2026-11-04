
import Link from 'next/link';

import type { ScheduledMenu } from '@/lib/menu/scheduled-menu';
import { PublishMenuButton } from '@/components/admin/publish-menu-button';

interface ScheduledMenuListProps {
    menus: ScheduledMenu[];
}

export function ScheduledMenuList({
    menus,
}: ScheduledMenuListProps) {
    if (menus.length === 0) {
        return (
            <div className="rounded-xl border border-dashed bg-white p-10 text-center">
                <h3 className="text-lg font-semibold text-gray-800">
                    No scheduled menus found
                </h3>

                <p className="mt-2 text-sm text-gray-500">
                    Create your first daily menu to get started.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-5">
            {menus.map((menu) => (
                <article
                    key={menu.id}
                    className="rounded-xl border bg-white p-5 shadow-sm"
                >
                    <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900">
                                {new Date(
                                    `${menu.menu_date}T00:00:00`,
                                ).toLocaleDateString('en-IN', {
                                    weekday: 'long',
                                    day: '2-digit',
                                    month: 'long',
                                    year: 'numeric',
                                })}
                            </h2>

                            <p className="mt-1 text-sm text-gray-500">
                                Daily meal schedule
                            </p>
                        </div>

                        <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                menu.is_published
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-gray-100 text-gray-600'
                            }`}
                        >
                            {menu.is_published
                                ? 'Published'
                                : 'Draft'}
                        </span>
                    </div>

                    <div className="mt-5 grid gap-4 md:grid-cols-2">
                        {(['lunch', 'dinner'] as const).map(
                            (mealType) => {
                                const meal = menu.meals.find(
                                    (item) =>
                                        item.meal_type === mealType,
                                );

                                return (
                                    <section
                                        key={mealType}
                                        className="rounded-lg bg-gray-50 p-4"
                                    >
                                        <h3 className="font-semibold capitalize text-gray-800">
                                            {mealType}
                                        </h3>

                                        {!meal ? (
                                            <p className="mt-3 text-sm text-red-600">
                                                Meal package not configured.
                                            </p>
                                        ) : (
                                            <>
                                                <div className="mt-3 space-y-2 text-sm">
                                                    {(
                                                        [
                                                            'dal',
                                                            'rice',
                                                            'roti',
                                                            'sabji',
                                                            'sweet',
                                                        ] as const
                                                    ).map((component) => (
                                                        <div
                                                            key={component}
                                                            className="flex justify-between gap-3"
                                                        >
                                                            <span className="capitalize text-gray-500">
                                                                {component}
                                                            </span>

                                                            <span className="text-right font-medium text-gray-800">
                                                                {meal.components[
                                                                    component
                                                                ] || 'Not configured'}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>

                                                <div className="mt-4 border-t pt-3">
                                                    <div className="flex justify-between text-sm">
                                                        <span className="text-gray-600">
                                                            Regular
                                                        </span>
                                                        <span className="font-semibold">
                                                            ₹{meal.regular_price}
                                                        </span>
                                                    </div>

                                                    <div className="mt-2 flex justify-between text-sm">
                                                        <span className="text-gray-600">
                                                            Special with Sweet
                                                        </span>
                                                        <span className="font-semibold text-orange-600">
                                                            ₹{meal.special_price}
                                                        </span>
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                    </section>
                                );
                            },
                        )}
                    </div>

                    <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t pt-4">
                        <PublishMenuButton
                            menuId={menu.id}
                            isPublished={menu.is_published}
                        />

                        <Link
                            href={`/admin/menu/${menu.id}`}
                            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                        >
                            Edit Menu
                        </Link>
                    </div>
                </article>
            ))}
        </div>
    );
}
