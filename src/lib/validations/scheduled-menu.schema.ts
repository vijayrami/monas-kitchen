
import { z } from 'zod';

const mealComponentSchema = z.object({
    dal: z.string().trim().min(2).max(100),
    rice: z.string().trim().min(2).max(100),
    roti: z.string().trim().min(2).max(100),
    sabji: z.string().trim().min(2).max(100),
    sweet: z.string().trim().min(2).max(100),
});

const mealPackageSchema = z.object({
    components: mealComponentSchema,
});

export const scheduledMenuSchema = z.object({
    menuDate: z.iso.date({
        error: 'Please select a valid menu date.',
    }),

    lunch: mealPackageSchema,

    dinner: mealPackageSchema,
});

export type ScheduledMenuFormData = z.infer<
    typeof scheduledMenuSchema
>;

export type MealPackageFormData = z.infer<
    typeof mealPackageSchema
>;
