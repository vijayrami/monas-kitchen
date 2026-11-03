import { connection } from 'next/server';
import Link from 'next/link';

import { logout } from '@/actions/auth.actions';
import { createClient } from '@/lib/supabase/server';

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
            <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
                <Link
                    href="/"
                    className="text-xl font-bold text-orange-600"
                >
                    Mona&apos;s Kitchen
                </Link>

                <nav className="flex items-center gap-4 text-sm">
                    <Link
                        href="/menu"
                        className="hover:text-orange-600"
                    >
                        Menu
                    </Link>

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
                                className="hover:text-orange-600"
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

                            <form action={logout}>
                                <button
                                    type="submit"
                                    className="rounded-lg border px-3 py-2 hover:bg-gray-50"
                                >
                                    Logout
                                </button>
                            </form>
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