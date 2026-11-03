'use client';

import { useActionState } from 'react';

import {
    toggleMenuItemStatus,
    type MenuItemActionState,
} from '@/actions/menu.actions';

type ToggleMenuItemButtonProps = {
    id: string;
    isActive: boolean;
};

const initialState: MenuItemActionState = {};

export function ToggleMenuItemButton({
    id,
    isActive,
}: ToggleMenuItemButtonProps) {
    const [state, formAction, isPending] = useActionState(
        toggleMenuItemStatus,
        initialState,
    );

    return (
        <form action={formAction}>
            <input type="hidden" name="id" value={id} />
            <input
                type="hidden"
                name="isActive"
                value={String(!isActive)}
            />

            {state.error && (
                <p className="mb-2 text-xs text-red-600">
                    {state.error}
                </p>
            )}

            <button
                type="submit"
                disabled={isPending}
                className="rounded-lg border px-3 py-2 text-sm hover:bg-gray-50 disabled:opacity-50"
            >
                {isPending
                    ? 'Updating...'
                    : isActive
                      ? 'Deactivate'
                      : 'Activate'}
            </button>
        </form>
    );
}