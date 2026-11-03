import { z } from 'zod';

export const menuItemSchema = z.object({
    name: z
        .string()
        .trim()
        .min(2, 'Name must contain at least 2 characters.')
        .max(100, 'Name is too long.'),

    description: z
        .string()
        .trim()
        .max(500, 'Description is too long.')
        .optional()
        .or(z.literal('')),

    price: z
        .string()
        .trim()
        .refine(
            (value) => {
                const price = Number(value);

                return (
                    Number.isFinite(price) &&
                    price >= 0 &&
                    Math.round(price * 100) === price * 100
                );
            },
            'Price must be a valid amount with up to 2 decimal places.',
        ),

    category: z.enum(['breakfast', 'lunch', 'dinner'], {
        error: 'Please select a valid meal category.',
    }),

    isVegetarian: z.boolean(),

    isActive: z.boolean(),
});

export type MenuItemFormData = z.infer<typeof menuItemSchema>;