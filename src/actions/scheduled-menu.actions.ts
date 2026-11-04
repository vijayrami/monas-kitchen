
'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { createClient } from '@/lib/supabase/server';
import {
    scheduledMenuSchema,
    type ScheduledMenuFormData,
} from '@/lib/validations/scheduled-menu.schema';

export interface ScheduledMenuActionState {
    error?: string;
    success?: string;
}

const menuIdSchema = z.string().uuid();

async function requireAdmin() {
    const supabase = await createClient();

    const {
        data: { user },
        error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
        throw new Error('Please log in to continue.');
    }

    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .maybeSingle();

    if (profileError || profile?.role !== 'admin') {
        throw new Error('You are not authorized to perform this action.');
    }

    return supabase;
}

function getFormValue(
    formData: FormData,
    key: string,
): string {
    const value = formData.get(key);

    return typeof value === 'string' ? value.trim() : '';
}

function parseScheduledMenuForm(
    formData: FormData,
): ScheduledMenuFormData {
    return {
        menuDate: getFormValue(formData, 'menuDate'),
        lunch: {
            components: {
                dal: getFormValue(formData, 'lunch.dal'),
                rice: getFormValue(formData, 'lunch.rice'),
                roti: getFormValue(formData, 'lunch.roti'),
                sabji: getFormValue(formData, 'lunch.sabji'),
                sweet: getFormValue(formData, 'lunch.sweet'),
            },
        },
        dinner: {
            components: {
                dal: getFormValue(formData, 'dinner.dal'),
                rice: getFormValue(formData, 'dinner.rice'),
                roti: getFormValue(formData, 'dinner.roti'),
                sabji: getFormValue(formData, 'dinner.sabji'),
                sweet: getFormValue(formData, 'dinner.sweet'),
            },
        },
    };
}

function getValidationError(
    issues: z.ZodIssue[],
): string {
    return issues[0]?.message ?? 'Please check the submitted menu details.';
}

export async function saveScheduledMenu(
    _previousState: ScheduledMenuActionState,
    formData: FormData,
): Promise<ScheduledMenuActionState> {
    try {
        const supabase = await requireAdmin();

        const parsedMenu = scheduledMenuSchema.safeParse(
            parseScheduledMenuForm(formData),
        );

        if (!parsedMenu.success) {
            return {
                error: getValidationError(parsedMenu.error.issues),
            };
        }

        const menu = parsedMenu.data;

        // Create the menu day or reuse the existing date.
        const { data: menuDay, error: menuDayError } = await supabase
            .from('menu_days')
            .upsert(
                {
                    menu_date: menu.menuDate,
                    is_published: false,
                },
                {
                    onConflict: 'menu_date',
                },
            )
            .select('id')
            .single();

        if (menuDayError || !menuDay) {
            return {
                error: 'Unable to save the scheduled menu date.',
            };
        }

        const meals = [
            {
                mealType: 'lunch' as const,
                components: menu.lunch.components,
            },
            {
                mealType: 'dinner' as const,
                components: menu.dinner.components,
            },
        ];

        for (const meal of meals) {
            const { data: mealPackage, error: packageError } =
                await supabase
                    .from('daily_meal_packages')
                    .upsert(
                        {
                            menu_day_id: menuDay.id,
                            meal_type: meal.mealType,
                            regular_price: 150,
                            special_price: 170,
                        },
                        {
                            onConflict: 'menu_day_id,meal_type',
                        },
                    )
                    .select('id')
                    .single();

            if (packageError || !mealPackage) {
                return {
                    error: `Unable to save the ${meal.mealType} package.`,
                };
            }

            const components = Object.entries(meal.components).map(
                ([componentType, itemName]) => ({
                    package_id: mealPackage.id,
                    component_type: componentType,
                    item_name: itemName,
                }),
            );

            const { error: componentsError } = await supabase
                .from('daily_meal_components')
                .upsert(
                    components,
                    {
                        onConflict: 'package_id,component_type',
                    },
                );

            if (componentsError) {
                return {
                    error: `Unable to save the ${meal.mealType} components.`,
                };
            }
        }

        revalidatePath('/admin/menu');
        revalidatePath('/menu');
        revalidatePath('/');

        return {
            success: 'Daily menu saved successfully.',
        };
    } catch (error) {
        console.error('Save scheduled menu error:', error);

        return {
            error: error instanceof Error
                ? error.message
                : 'Unable to save the scheduled menu.',
        };
    }
}

export async function publishScheduledMenu(
    _previousState: ScheduledMenuActionState,
    formData: FormData,
): Promise<ScheduledMenuActionState> {
    try {
        const supabase = await requireAdmin();

        const menuId = menuIdSchema.safeParse(
            getFormValue(formData, 'menuId'),
        );

        if (!menuId.success) {
            return {
                error: 'Invalid scheduled menu.',
            };
        }

        const { data: packages, error: packagesError } = await supabase
            .from('daily_meal_packages')
            .select(`
                id,
                meal_type,
                daily_meal_components (
                    component_type,
                    item_name
                )
            `)
            .eq('menu_day_id', menuId.data);

        if (packagesError) {
            return {
                error: 'Unable to verify the meal packages.',
            };
        }

        if (!packages || packages.length !== 2) {
            return {
                error: 'Both lunch and dinner packages are required.',
            };
        }

        const requiredComponents = [
            'dal',
            'rice',
            'roti',
            'sabji',
            'sweet',
        ];

        for (const meal of ['lunch', 'dinner'] as const) {
            const mealPackage = packages.find(
                (item) => item.meal_type === meal,
            );

            if (!mealPackage) {
                return {
                    error: `The ${meal} package is missing.`,
                };
            }

            const componentTypes = mealPackage.daily_meal_components.map(
                (component) => component.component_type,
            );

            const isComplete = requiredComponents.every(
                (component) => componentTypes.includes(component),
            );

            if (!isComplete) {
                return {
                    error: `Complete all five ${meal} components before publishing.`,
                };
            }
        }

        const { error: publishError } = await supabase
            .from('menu_days')
            .update({
                is_published: true,
            })
            .eq('id', menuId.data);

        if (publishError) {
            return {
                error: 'Unable to publish the scheduled menu.',
            };
        }

        revalidatePath('/admin/menu');
        revalidatePath('/menu');
        revalidatePath('/');

        return {
            success: 'Daily menu published successfully.',
        };
    } catch (error) {
        console.error('Publish scheduled menu error:', error);

        return {
            error: error instanceof Error
                ? error.message
                : 'Unable to publish the scheduled menu.',
        };
    }
}

export async function unpublishScheduledMenu(
    _previousState: ScheduledMenuActionState,
    formData: FormData,
): Promise<ScheduledMenuActionState> {
    try {
        const supabase = await requireAdmin();

        const menuId = menuIdSchema.safeParse(
            getFormValue(formData, 'menuId'),
        );

        if (!menuId.success) {
            return {
                error: 'Invalid scheduled menu.',
            };
        }

        const { error } = await supabase
            .from('menu_days')
            .update({
                is_published: false,
            })
            .eq('id', menuId.data);

        if (error) {
            return {
                error: 'Unable to unpublish the scheduled menu.',
            };
        }

        revalidatePath('/admin/menu');
        revalidatePath('/menu');
        revalidatePath('/');

        return {
            success: 'Daily menu unpublished successfully.',
        };
    } catch (error) {
        console.error('Unpublish scheduled menu error:', error);

        return {
            error: error instanceof Error
                ? error.message
                : 'Unable to unpublish the scheduled menu.',
        };
    }
}
