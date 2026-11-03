import { createClient } from '@/lib/supabase/server';
import type { MenuItem } from '@/types/menu';

interface MenuItemRow {
    id: string;
    name: string;
    description: string | null;
    price: number;
    category: 'breakfast' | 'lunch' | 'dinner';
    is_vegetarian: boolean;
    image_url: string | null;
}

export async function getMenuItems(): Promise<MenuItem[]> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('menu_items')
        .select(
            'id, name, description, price, category, is_vegetarian, image_url',
        )
        .eq('is_active', true)
        .order('category')
        .order('name');

    if (error) {
        throw new Error(`Unable to load menu items: ${error.message}`);
    }

    return (data as MenuItemRow[]).map((item) => ({
        id: item.id,
        name: item.name,
        description: item.description,
        price: Number(item.price),
        category: item.category,
        isVegetarian: item.is_vegetarian,
        imageUrl: item.image_url,
    }));
}