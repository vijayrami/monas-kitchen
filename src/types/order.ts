
import type {
    BreakfastOrderItem,
    MealPackageSelection,
} from '@/lib/validations/order.schema';

export type OrderMealType = 'breakfast' | 'lunch' | 'dinner';

export type OrderStatus =
    | 'pending'
    | 'confirmed'
    | 'preparing'
    | 'ready'
    | 'completed'
    | 'cancelled';

export type PackageOption = 'regular' | 'special';

export interface CustomerOrderRequest {
    orderDate: string;
    breakfastItems: BreakfastOrderItem[];
    lunch: MealPackageSelection | null;
    dinner: MealPackageSelection | null;
    deliveryType: 'pickup' | 'delivery';
    notes?: string;
}

export interface PlacedMealOrder {
    orderId: string;
    mealType: OrderMealType;
    packageOption?: PackageOption;
    quantity?: number;
    total: number;
}

export interface PlaceOrderResponse {
    success: boolean;
    orders: PlacedMealOrder[];
}
