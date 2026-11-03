'use client';

import Link from 'next/link';
import { useActionState } from 'react';

import {
    login,
    type AuthActionState,
} from '@/actions/auth.actions';

const initialState: AuthActionState = {};

export function LoginForm() {
    const [state, formAction, isPending] = useActionState(
        login,
        initialState,
    );

    return (
        <form action={formAction} className="space-y-5">
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
                    autoComplete="current-password"
                    required
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
                {isPending ? 'Logging in...' : 'Login'}
            </button>

            <div className="flex items-center justify-between text-sm">
                <Link
                    href="/forgot-password"
                    className="text-orange-600 hover:underline"
                >
                    Forgot password?
                </Link>

                <Link
                    href="/register"
                    className="font-medium text-orange-600 hover:underline"
                >
                    Create account
                </Link>
            </div>
        </form>
    );
}