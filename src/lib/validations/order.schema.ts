
import { z } from 'zod';

const quantitySchema = z.number()
    .int()
    .min(1, 'Quantity must be at least 1')
    .max(20, 'Maximum quantity is 20');

const breakfastOrderSchema = z.object({
    mealType: z.literal('breakfast'),

    orderDate: z.iso.date(),

    items: z.array(
        z.object({
            menuItemId: z.string().uuid(),
            quantity: quantitySchema,
        }),
    ).min(1, 'Please select at least one breakfast item.'),

    deliveryType: z.enum(['pickup', 'delivery']),

    notes: z.string().trim().max(500).optional(),
});

const lunchDinnerOrderSchema = z.object({
    mealType: z.enum(['lunch', 'dinner']),

    orderDate: z.iso.date(),

    packageType: z.enum(['regular', 'special']),

    quantity: quantitySchema,

    deliveryType: z.enum(['pickup', 'delivery']),

    notes: z.string().trim().max(500).optional(),
});

export const orderSchema = z.discriminatedUnion('mealType', [
    breakfastOrderSchema,
    lunchDinnerOrderSchema,
]);

export type OrderFormData = z.infer<typeof orderSchema>;
