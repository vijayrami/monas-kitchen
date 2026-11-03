'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { createClient } from '@/lib/supabase/server';
import { menuItemSchema } from '@/lib/validations/menu-item.schema';

export type MenuItemActionState = {
    error?: string;
    success?: string;
};

const idSchema = z.string().uuid('Invalid menu item ID.');

async function requireAdmin() {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        throw new Error('Unauthorized.');
    }

    const { data: profile, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .maybeSingle();

    if (error || profile?.role !== 'admin') {
        throw new Error('Forbidden.');
    }

    return supabase;
}

export async function createMenuItem(
    _previousState: MenuItemActionState,
    formData: FormData,
): Promise<MenuItemActionState> {
    try {
        const supabase = await requireAdmin();

        const result = menuItemSchema.safeParse({
            name: formData.get('name'),
            description: formData.get('description'),
            price: formData.get('price'),
            category: formData.get('category'),
            isVegetarian: formData.get('isVegetarian') === 'true',
            isActive: formData.get('isActive') === 'true',
        });

        if (!result.success) {
            return {
                error:
                    result.error.issues[0]?.message ??
                    'Invalid menu item data.',
            };
        }

        const {
            name,
            description,
            price,
            category,
            isVegetarian,
            isActive,
        } = result.data;

        const { error } = await supabase.from('menu_items').insert({
            name,
            description: description || null,
            price: Number(price),
            category,
            is_vegetarian: isVegetarian,
            is_active: isActive,
        });

        if (error) {
            return {
                error: error.message,
            };
        }

        revalidatePath('/admin/menu-items');
        revalidatePath('/menu');
        revalidatePath('/');

        return {
            success: 'Menu item created successfully.',
        };
    } catch {
        return {
            error: 'You are not authorized to create menu items.',
        };
    }
}

export async function updateMenuItem(
    _previousState: MenuItemActionState,
    formData: FormData,
): Promise<MenuItemActionState> {
    try {
        const supabase = await requireAdmin();

        const idResult = idSchema.safeParse(formData.get('id'));

        if (!idResult.success) {
            return {
                error: 'Invalid menu item ID.',
            };
        }

        const result = menuItemSchema.safeParse({
            name: formData.get('name'),
            description: formData.get('description'),
            price: formData.get('price'),
            category: formData.get('category'),
            isVegetarian: formData.get('isVegetarian') === 'true',
            isActive: formData.get('isActive') === 'true',
        });

        if (!result.success) {
            return {
                error:
                    result.error.issues[0]?.message ??
                    'Invalid menu item data.',
            };
        }

        const {
            name,
            description,
            price,
            category,
            isVegetarian,
            isActive,
        } = result.data;

        const { error } = await supabase
            .from('menu_items')
            .update({
                name,
                description: description || null,
                price: Number(price),
                category,
                is_vegetarian: isVegetarian,
                is_active: isActive,
            })
            .eq('id', idResult.data);

        if (error) {
            return {
                error: error.message,
            };
        }

        revalidatePath('/admin/menu-items');
        revalidatePath('/menu');
        revalidatePath('/');

        return {
            success: 'Menu item updated successfully.',
        };
    } catch {
        return {
            error: 'You are not authorized to update menu items.',
        };
    }
}

export async function deleteMenuItem(
    _previousState: MenuItemActionState,
    formData: FormData,
): Promise<MenuItemActionState> {
    try {
        const supabase = await requireAdmin();

        const idResult = idSchema.safeParse(formData.get('id'));

        if (!idResult.success) {
            return {
                error: 'Invalid menu item ID.',
            };
        }

        const { error } = await supabase
            .from('menu_items')
            .delete()
            .eq('id', idResult.data);

        if (error) {
            return {
                error:
                    'This menu item cannot be deleted because it is already used by a menu or order.',
            };
        }

        revalidatePath('/admin/menu-items');
        revalidatePath('/menu');
        revalidatePath('/');

        return {
            success: 'Menu item deleted successfully.',
        };
    } catch {
        return {
            error: 'You are not authorized to delete menu items.',
        };
    }
}

export async function toggleMenuItemStatus(
    _previousState: MenuItemActionState,
    formData: FormData,
): Promise<MenuItemActionState> {
    try {
        const supabase = await requireAdmin();

        const idResult = idSchema.safeParse(formData.get('id'));

        if (!idResult.success) {
            return {
                error: 'Invalid menu item ID.',
            };
        }

        const isActive = formData.get('isActive') === 'true';

        const { error } = await supabase
            .from('menu_items')
            .update({
                is_active: isActive,
            })
            .eq('id', idResult.data);

        if (error) {
            return {
                error: error.message,
            };
        }

        revalidatePath('/admin/menu-items');
        revalidatePath('/menu');
        revalidatePath('/');

        return {
            success: isActive
                ? 'Menu item activated.'
                : 'Menu item deactivated.',
        };
    } catch {
        return {
            error: 'You are not authorized to change menu item status.',
        };
    }
}