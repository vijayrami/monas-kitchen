import { connection } from 'next/server';
import Link from 'next/link';

import { LogoutButton } from '@/components/layout/logout-button';
import { createClient } from '@/lib/supabase/server';
import { CartHeaderLink } from '@/components/cart/cart-header-link';

export async function Header() {
    await connection();

    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    let profile: {
        full_name: string;
        role: 'customer' | 'admin';
    } | null = null;

    if (user) {
        const { data } = await supabase
            .from('profiles')
            .select('full_name, role')
            .eq('id', user.id)
            .maybeSingle();

        profile = data;
    }

    return (
        <header className="border-b bg-white">
            <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
                <Link
                    href="/"
                    className="shrink-0 text-xl font-bold text-orange-600"
                >
                    Mona&apos;s Kitchen
                </Link>

                <nav className="flex flex-wrap items-center justify-end gap-3 text-sm sm:gap-4">
                    <Link
                        href="/menu"
                        className="hover:text-orange-600"
                    >
                        Menu
                    </Link>

                    <CartHeaderLink />

                    {user ? (
                        <>
                            <Link
                                href="/orders"
                                className="hover:text-orange-600"
                            >
                                Orders
                            </Link>

                            <Link
                                href="/profile"
                                className="max-w-28 truncate hover:text-orange-600 sm:max-w-none"
                            >
                                {profile?.full_name || 'Profile'}
                            </Link>

                            {profile?.role === 'admin' && (
                                <Link
                                    href="/admin"
                                    className="font-medium text-orange-600"
                                >
                                    Admin
                                </Link>
                            )}

                            <LogoutButton />
                        </>
                    ) : (
                        <>
                            <Link
                                href="/login"
                                className="hover:text-orange-600"
                            >
                                Login
                            </Link>

                            <Link
                                href="/register"
                                className="rounded-lg bg-orange-600 px-3 py-2 font-medium text-white hover:bg-orange-700"
                            >
                                Register
                            </Link>
                        </>
                    )}
                </nav>
            </div>
        </header>
    );
}