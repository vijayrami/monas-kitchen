export type MealType = 'breakfast' | 'lunch' | 'dinner';

export interface MenuItem {
    id: string;
    name: string;
    description: string | null;
    price: number;
    category: MealType;
    isVegetarian: boolean;
    imageUrl: string | null;
}