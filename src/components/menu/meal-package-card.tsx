import { MealPackageSelector } from '@/components/menu/meal-package-selector';
import type { ScheduledMealPackage } from '@/lib/menu/scheduled-menu';

interface MealPackageCardProps {
    meal: ScheduledMealPackage;
}

export function MealPackageCard({
    meal,
}: MealPackageCardProps) {
    const components = [
        { label: 'Dal', value: meal.components.dal },
        { label: 'Rice', value: meal.components.rice },
        { label: 'Roti', value: meal.components.roti },
        { label: 'Sabji', value: meal.components.sabji },
    ];

    return (
        <article className="rounded-xl border bg-white p-5 shadow-sm">
            <h3 className="text-xl font-semibold capitalize text-gray-900">
                {meal.meal_type}
            </h3>

            <div className="mt-4 space-y-3">
                {components.map(component => (
                    <div
                        key={component.label}
                        className="flex justify-between gap-4 text-sm"
                    >
                        <span className="text-gray-500">
                            {component.label}
                        </span>

                        <span className="text-right font-medium text-gray-900">
                            {component.value || 'Not available'}
                        </span>
                    </div>
                ))}
            </div>

            <div className="mt-5 rounded-lg bg-orange-50 p-4">
                <p className="text-sm font-medium text-gray-700">
                    Today&apos;s Sweet
                </p>

                <p className="mt-1 font-semibold text-orange-700">
                    {meal.components.sweet || 'Not available'}
                </p>
            </div>

            <MealPackageSelector meal={meal} />
        </article>
    );
}