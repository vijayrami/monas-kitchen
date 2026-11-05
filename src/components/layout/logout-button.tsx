'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { createClient } from '@/lib/supabase/client';

export function LogoutButton() {
    const router = useRouter();
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [error, setError] = useState('');

    async function handleLogout() {
        setIsLoggingOut(true);
        setError('');

        const supabase = createClient();

        const { error: signOutError } = await supabase.auth.signOut();

        if (signOutError) {
            setError('Unable to log out. Please try again.');
            setIsLoggingOut(false);
            return;
        }

        router.replace('/login');
        router.refresh();
    }

    return (
        <div>
            <button
                type="button"
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="rounded-lg border px-3 py-2 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
                {isLoggingOut ? 'Logging out...' : 'Logout'}
            </button>

            {error && (
                <p className="mt-1 text-xs text-red-600">
                    {error}
                </p>
            )}
        </div>
    );
}