
import { createClient } from '@/lib/supabase/server';

export type MealType = 'lunch' | 'dinner';

export type MealComponentType =
    | 'dal'
    | 'rice'
    | 'roti'
    | 'sabji'
    | 'sweet';

export interface MealComponents {
    dal: string;
    rice: string;
    roti: string;
    sabji: string;
    sweet: string;
}

export interface ScheduledMealPackage {
    id: string;
    meal_type: MealType;
    regular_price: number;
    special_price: number;
    components: MealComponents;
}

export interface ScheduledMenu {
    id: string;
    menu_date: string;
    is_published: boolean;
    meals: ScheduledMealPackage[];
}

const MEAL_COMPONENT_TYPES: MealComponentType[] = [
    'dal',
    'rice',
    'roti',
    'sabji',
    'sweet',
];

function mapMealPackage(
    packageData: {
        id: string;
        meal_type: MealType;
        regular_price: number | string;
        special_price: number | string;
        daily_meal_components: {
            component_type: MealComponentType;
            item_name: string;
        }[];
    },
): ScheduledMealPackage {
    const components = {} as MealComponents;

    for (const component of packageData.daily_meal_components) {
        components[component.component_type] = component.item_name;
    }

    return {
        id: packageData.id,
        meal_type: packageData.meal_type,
        regular_price: Number(packageData.regular_price),
        special_price: Number(packageData.special_price),
        components,
    };
}

export async function getScheduledMenus(): Promise<ScheduledMenu[]> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('menu_days')
        .select(`
            id,
            menu_date,
            is_published,
            daily_meal_packages (
                id,
                meal_type,
                regular_price,
                special_price,
                daily_meal_components (
                    component_type,
                    item_name
                )
            )
        `)
        .order('menu_date', { ascending: false });

    if (error) {
        throw new Error('Unable to load scheduled menus.');
    }

    return (data ?? []).map((menu) => ({
        id: menu.id,
        menu_date: menu.menu_date,
        is_published: menu.is_published,
        meals: (menu.daily_meal_packages ?? []).map(mapMealPackage),
    }));
}

export async function getScheduledMenuById(
    id: string,
): Promise<ScheduledMenu | null> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('menu_days')
        .select(`
            id,
            menu_date,
            is_published,
            daily_meal_packages (
                id,
                meal_type,
                regular_price,
                special_price,
                daily_meal_components (
                    component_type,
                    item_name
                )
            )
        `)
        .eq('id', id)
        .maybeSingle();

    if (error) {
        throw new Error('Unable to load the scheduled menu.');
    }

    if (!data) {
        return null;
    }

    return {
        id: data.id,
        menu_date: data.menu_date,
        is_published: data.is_published,
        meals: (data.daily_meal_packages ?? []).map(mapMealPackage),
    };
}

export function hasCompleteMealComponents(
    components: Partial<MealComponents>,
): boolean {
    return MEAL_COMPONENT_TYPES.every((type) => {
        const value = components[type];

        return typeof value === 'string' && value.trim().length >= 2;
    });
}

export async function getPublishedScheduledMenuByDate(
    menuDate: string,
): Promise<ScheduledMenu | null> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('menu_days')
        .select(`
            id,
            menu_date,
            is_published,
            daily_meal_packages (
                id,
                meal_type,
                regular_price,
                special_price,
                daily_meal_components (
                    component_type,
                    item_name
                )
            )
        `)
        .eq('menu_date', menuDate)
        .eq('is_published', true)
        .maybeSingle();

    if (error) {
        throw new Error('Unable to load the published daily menu.');
    }

    if (!data) {
        return null;
    }

    return {
        id: data.id,
        menu_date: data.menu_date,
        is_published: data.is_published,
        meals: (data.daily_meal_packages ?? []).map(mapMealPackage),
    };
}
