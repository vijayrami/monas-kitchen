import { z } from 'zod';

export const createOrderSchema = z.object({
    orderDate: z.string(),
    mealType: z.enum([
        'breakfast',
        'lunch',
        'dinner',
    ]),
    deliveryType: z.enum([
        'pickup',
        'delivery',
    ]),
    notes: z.string().max(500).optional(),
    items: z.array(
        z.object({
            menuItemId: z.string().uuid(),
            quantity: z.number().int().positive(),
        }),
    ).min(1),
});