import { z } from 'zod';

export const registerSchema = z.object({
    fullName: z
        .string()
        .trim()
        .min(2, 'Full name must contain at least 2 characters.')
        .max(100, 'Full name is too long.'),

    phone: z
        .string()
        .trim()
        .min(10, 'Please enter a valid phone number.')
        .max(15, 'Phone number is too long.'),

    flatNumber: z
        .string()
        .trim()
        .min(1, 'Flat number is required.')
        .max(50, 'Flat number is too long.'),

    email: z
        .string()
        .trim()
        .email('Please enter a valid email address.'),

    password: z
        .string()
        .min(8, 'Password must contain at least 8 characters.')
        .max(72, 'Password is too long.'),
});

export const loginSchema = z.object({
    email: z
        .string()
        .trim()
        .email('Please enter a valid email address.'),

    password: z
        .string()
        .min(1, 'Password is required.'),
});

export type RegisterFormData = z.infer<typeof registerSchema>;
export type LoginFormData = z.infer<typeof loginSchema>;