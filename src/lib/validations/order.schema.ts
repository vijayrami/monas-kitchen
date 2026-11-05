
import { z } from 'zod';

const quantitySchema = z
    .number()
    .int('Quantity must be a whole number.')
    .min(1, 'Quantity must be at least 1.')
    .max(20, 'Maximum quantity is 20.');

const orderDateSchema = z.iso.date({
    error: 'Please select a valid order date.',
});

const breakfastItemSchema = z.object({
    menuItemId: z.string().uuid(
        'Invalid breakfast item.',
    ),
    quantity: quantitySchema,
});

const mealPackageSchema = z.object({
    option: z.enum(['regular', 'special'], {
        error: 'Please select a valid meal package.',
    }),
    quantity: quantitySchema,
});

export const orderSchema = z.object({
    orderDate: orderDateSchema,

    breakfastItems: z.array(breakfastItemSchema)
        .max(100, 'Too many breakfast items.'),

    lunch: mealPackageSchema.nullable(),

    dinner: mealPackageSchema.nullable(),

    deliveryType: z.enum(['pickup', 'delivery'], {
        error: 'Please select a valid delivery method.',
    }),

    notes: z.string()
        .trim()
        .max(500, 'Notes cannot exceed 500 characters.')
        .optional()
        .default(''),
}).superRefine((data, context) => {
    const hasBreakfast = data.breakfastItems.length > 0;
    const hasLunch = data.lunch !== null;
    const hasDinner = data.dinner !== null;

    if (!hasBreakfast && !hasLunch && !hasDinner) {
        context.addIssue({
            code: 'custom',
            message: 'Please select at least one meal.',
            path: ['breakfastItems'],
        });
    }

    const breakfastIds = data.breakfastItems.map(
        (item) => item.menuItemId,
    );

    if (new Set(breakfastIds).size !== breakfastIds.length) {
        context.addIssue({
            code: 'custom',
            message: 'Duplicate breakfast items are not allowed.',
            path: ['breakfastItems'],
        });
    }
});

export type OrderFormData = z.infer<typeof orderSchema>;

export type BreakfastOrderItem = z.infer<
    typeof breakfastItemSchema
>;

export type MealPackageSelection = z.infer<
    typeof mealPackageSchema
>;
