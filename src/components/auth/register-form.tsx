'use client';

import Link from 'next/link';
import { useActionState } from 'react';

import {
    register,
    type AuthActionState,
} from '@/actions/auth.actions';

const initialState: AuthActionState = {};

export function RegisterForm() {
    const [state, formAction, isPending] = useActionState(
        register,
        initialState,
    );

    return (
        <form action={formAction} className="space-y-5">
            <div>
                <label
                    htmlFor="fullName"
                    className="mb-1 block text-sm font-medium"
                >
                    Full name
                </label>

                <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    autoComplete="name"
                    required
                    className="w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-orange-500"
                />
            </div>

            <div>
                <label
                    htmlFor="phone"
                    className="mb-1 block text-sm font-medium"
                >
                    Phone number
                </label>

                <input
                    id="phone"
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    required
                    className="w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-orange-500"
                />
            </div>

            <div>
                <label
                    htmlFor="flatNumber"
                    className="mb-1 block text-sm font-medium"
                >
                    Flat number
                </label>

                <input
                    id="flatNumber"
                    name="flatNumber"
                    type="text"
                    required
                    className="w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-orange-500"
                />
            </div>

            <div>
                <label
                    htmlFor="email"
                    className="mb-1 block text-sm font-medium"
                >
                    Email
                </label>

                <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-orange-500"
                />
            </div>

            <div>
                <label
                    htmlFor="password"
                    className="mb-1 block text-sm font-medium"
                >
                    Password
                </label>

                <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    minLength={8}
                    className="w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-orange-500"
                />
            </div>

            {state.error && (
                <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
                    {state.error}
                </p>
            )}

            <button
                type="submit"
                disabled={isPending}
                className="w-full rounded-lg bg-orange-600 px-4 py-3 font-semibold text-white transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
                {isPending ? 'Creating account...' : 'Create account'}
            </button>

            <p className="text-center text-sm text-gray-600">
                Already have an account?{' '}
                <Link
                    href="/login"
                    className="font-medium text-orange-600 hover:underline"
                >
                    Login
                </Link>
            </p>
        </form>
    );
}