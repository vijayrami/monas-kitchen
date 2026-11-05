import type { MealPackageSelection } from '@/lib/validations/order.schema';

export interface CartBreakfastItem {
    menuItemId: string;
    name: string;
    quantity: number;
    displayedPrice: number;
}

export interface CartPackageSelection {
    option: 'regular' | 'special';
    quantity: number;
    displayedPrice: number;
    sweetName: string;
}

export interface CustomerCart {
    orderDate: string;
    breakfastItems: CartBreakfastItem[];
    lunch: CartPackageSelection | null;
    dinner: CartPackageSelection | null;
    deliveryType: 'pickup' | 'delivery';
    notes: string;
}

export interface CartSelectionRequest {
    breakfastItems: {
        menuItemId: string;
        quantity: number;
    }[];
    lunch: MealPackageSelection | null;
    dinner: MealPackageSelection | null;
}

export interface CartContextType {
    cart: CustomerCart;
    subtotal: number;
    itemCount: number;
    isHydrated: boolean;
    
    resetCartOnLogout: () => void;

    addBreakfastItem: (
        item: Omit<CartBreakfastItem, 'quantity'> & { quantity?: number }
    ) => void;

    updateBreakfastQuantity: (
        menuItemId: string,
        quantity: number
    ) => void;

    removeBreakfastItem: (menuItemId: string) => void;

    setLunchPackage: (selection: CartPackageSelection | null) => void;
    setDinnerPackage: (selection: CartPackageSelection | null) => void;

    removeLunchPackage: () => void;
    removeDinnerPackage: () => void;

    setOrderDate: (orderDate: string) => void;
    setDeliveryType: (deliveryType: 'pickup' | 'delivery') => void;
    setNotes: (notes: string) => void;

    clearCart: () => void;
}