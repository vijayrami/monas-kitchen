
'use client';

import { useActionState } from 'react';

import {
    publishScheduledMenu,
    unpublishScheduledMenu,
    type ScheduledMenuActionState,
} from '@/actions/scheduled-menu.actions';

interface PublishMenuButtonProps {
    menuId: string;
    isPublished: boolean;
}

const initialState: ScheduledMenuActionState = {};

export function PublishMenuButton({
    menuId,
    isPublished,
}: PublishMenuButtonProps) {
    const action = isPublished
        ? unpublishScheduledMenu
        : publishScheduledMenu;

    const [state, formAction, isPending] = useActionState(
        action,
        initialState,
    );

    function handleSubmit(
        event: React.FormEvent<HTMLFormElement>,
    ) {
        if (
            isPublished &&
            !window.confirm(
                'Are you sure you want to unpublish this menu?',
            )
        ) {
            event.preventDefault();
        }
    }

    return (
        <div className="space-y-2">
            <form action={formAction} onSubmit={handleSubmit}>
                <input
                    type="hidden"
                    name="menuId"
                    value={menuId}
                />

                <button
                    type="submit"
                    disabled={isPending}
                    className={`rounded-lg px-4 py-2 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-60 ${
                        isPublished
                            ? 'bg-gray-600 hover:bg-gray-700'
                            : 'bg-green-600 hover:bg-green-700'
                    }`}
                >
                    {isPending
                        ? 'Please wait...'
                        : isPublished
                            ? 'Unpublish Menu'
                            : 'Publish Menu'}
                </button>
            </form>

            {state.error && (
                <p
                    role="alert"
                    className="text-sm text-red-600"
                >
                    {state.error}
                </p>
            )}

            {state.success && (
                <p
                    role="status"
                    className="text-sm text-green-600"
                >
                    {state.success}
                </p>
            )}
        </div>
    );
}
