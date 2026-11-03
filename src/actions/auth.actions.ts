'use server';

import { redirect } from 'next/navigation';

import { createClient } from '@/lib/supabase/server';
import {
    loginSchema,
    registerSchema,
} from '@/lib/validations/auth.schema';

export type AuthActionState = {
    error?: string;
};

export async function register(
    _previousState: AuthActionState,
    formData: FormData,
): Promise<AuthActionState> {
    const supabase = await createClient();

    const result = registerSchema.safeParse({
        fullName: formData.get('fullName'),
        phone: formData.get('phone'),
        flatNumber: formData.get('flatNumber'),
        email: formData.get('email'),
        password: formData.get('password'),
    });

    if (!result.success) {
        return {
            error: result.error.issues[0]?.message ?? 'Invalid registration data.',
        };
    }

    const {
        fullName,
        phone,
        flatNumber,
        email,
        password,
    } = result.data;

    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                full_name: fullName,
                phone,
                flat_number: flatNumber,
            },
        },
    });

    if (error) {
        return {
            error: error.message,
        };
    }

    if (!data.session) {
        return {
            error:
                'Registration succeeded, but no active session was created. Please contact the administrator.',
        };
    }

    redirect('/menu');
}

export async function login(
    _previousState: AuthActionState,
    formData: FormData,
): Promise<AuthActionState> {
    const supabase = await createClient();

    const result = loginSchema.safeParse({
        email: formData.get('email'),
        password: formData.get('password'),
    });

    if (!result.success) {
        return {
            error: result.error.issues[0]?.message ?? 'Invalid login data.',
        };
    }

    const { email, password } = result.data;

    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) {
        return {
            error: 'Invalid email or password.',
        };
    }

    redirect('/menu');
}

export async function logout(): Promise<void> {
    const supabase = await createClient();

    await supabase.auth.signOut();

    redirect('/login');
}