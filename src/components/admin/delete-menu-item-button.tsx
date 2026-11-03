'use client';

import { useActionState } from 'react';

import {
    deleteMenuItem,
    type MenuItemActionState,
} from '@/actions/menu.actions';

type DeleteMenuItemButtonProps = {
    id: string;
};

const initialState: MenuItemActionState = {};

export function DeleteMenuItemButton({
    id,
}: DeleteMenuItemButtonProps) {
    const [state, formAction, isPending] = useActionState(
        deleteMenuItem,
        initialState,
    );

    function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        if (
            !window.confirm(
                'Are you sure you want to delete this menu item?',
            )
        ) {
            event.preventDefault();
        }
    }

    return (
        <form action={formAction} onSubmit={handleSubmit}>
            <input type="hidden" name="id" value={id} />

            {state.error && (
                <p className="mb-2 text-xs text-red-600">
                    {state.error}
                </p>
            )}

            <button
                type="submit"
                disabled={isPending}
                className="rounded-lg border border-red-200 px-3 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
            >
                {isPending ? 'Deleting...' : 'Delete'}
            </button>
        </form>
    );
}