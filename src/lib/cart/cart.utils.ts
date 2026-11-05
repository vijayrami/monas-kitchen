import type {
    CartBreakfastItem,
    CartPackageSelection,
    CartSelectionRequest,
    CustomerCart,
} from '@/types/cart';

const MAX_QUANTITY = 20;

export const CART_STORAGE_KEY = 'monas-kitchen-cart-v1';

export function getTodayDate(): string {
    return new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Asia/Kolkata',
    }).format(new Date());
}

export function createEmptyCart(orderDate = ''): CustomerCart {
    return {
        orderDate,
        breakfastItems: [],
        lunch: null,
        dinner: null,
        deliveryType: 'pickup',
        notes: '',
    };
}

export function calculateCartSubtotal(cart: CustomerCart): number {
    const breakfastTotal = cart.breakfastItems.reduce(
        (total, item) => total + item.displayedPrice * item.quantity,
        0
    );

    const lunchTotal = cart.lunch
        ? cart.lunch.displayedPrice * cart.lunch.quantity
        : 0;

    const dinnerTotal = cart.dinner
        ? cart.dinner.displayedPrice * cart.dinner.quantity
        : 0;

    return Number((breakfastTotal + lunchTotal + dinnerTotal).toFixed(2));
}

export function getCartItemCount(cart: CustomerCart): number {
    const breakfastCount = cart.breakfastItems.reduce(
        (total, item) => total + item.quantity,
        0
    );

    const lunchCount = cart.lunch?.quantity ?? 0;
    const dinnerCount = cart.dinner?.quantity ?? 0;

    return breakfastCount + lunchCount + dinnerCount;
}

export function hasCartItems(cart: CustomerCart): boolean {
    return getCartItemCount(cart) > 0;
}

function isValidPrice(value: unknown): value is number {
    return (
        typeof value === 'number' &&
        Number.isFinite(value) &&
        value >= 0
    );
}

function normalizeBreakfastItem(
    value: unknown
): CartBreakfastItem | null {
    if (!value || typeof value !== 'object') {
        return null;
    }

    const item = value as Record<string, unknown>;

    if (
        typeof item.menuItemId !== 'string' ||
        typeof item.name !== 'string' ||
        typeof item.quantity !== 'number' ||
        !Number.isInteger(item.quantity) ||
        item.quantity < 1 ||
        item.quantity > MAX_QUANTITY ||
        !isValidPrice(item.displayedPrice)
    ) {
        return null;
    }

    return {
        menuItemId: item.menuItemId,
        name: item.name,
        quantity: item.quantity,
        displayedPrice: item.displayedPrice,
    };
}

function normalizePackage(
    value: unknown
): CartPackageSelection | null {
    if (!value || typeof value !== 'object') {
        return null;
    }

    const selection = value as Record<string, unknown>;

    if (
        !['regular', 'special'].includes(String(selection.option)) ||
        typeof selection.quantity !== 'number' ||
        !Number.isInteger(selection.quantity) ||
        selection.quantity < 1 ||
        selection.quantity > MAX_QUANTITY ||
        !isValidPrice(selection.displayedPrice) ||
        typeof selection.sweetName !== 'string'
    ) {
        return null;
    }

    return {
        option: selection.option as CartPackageSelection['option'],
        quantity: selection.quantity,
        displayedPrice: selection.displayedPrice,
        sweetName: selection.sweetName,
    };
}

export function normalizeCart(value: unknown): CustomerCart | null {
    if (!value || typeof value !== 'object') {
        return null;
    }

    const cart = value as Record<string, unknown>;

    if (
        typeof cart.orderDate !== 'string' ||
        !/^\d{4}-\d{2}-\d{2}$/.test(cart.orderDate) ||
        !Array.isArray(cart.breakfastItems) ||
        !['pickup', 'delivery'].includes(String(cart.deliveryType)) ||
        typeof cart.notes !== 'string'
    ) {
        return null;
    }

    const breakfastItems = cart.breakfastItems
        .map(normalizeBreakfastItem)
        .filter((item): item is CartBreakfastItem => item !== null);

    const uniqueItems = new Map<string, CartBreakfastItem>();

    for (const item of breakfastItems) {
        uniqueItems.set(item.menuItemId, item);
    }

    return {
        orderDate: cart.orderDate,
        breakfastItems: Array.from(uniqueItems.values()),
        lunch: normalizePackage(cart.lunch),
        dinner: normalizePackage(cart.dinner),
        deliveryType: cart.deliveryType as CustomerCart['deliveryType'],
        notes: cart.notes.slice(0, 500),
    };
}

export function getCartSelectionPayload(
    cart: CustomerCart
): CartSelectionRequest {
    return {
        breakfastItems: cart.breakfastItems.map(item => ({
            menuItemId: item.menuItemId,
            quantity: item.quantity,
        })),
        lunch: cart.lunch
            ? {
                option: cart.lunch.option,
                quantity: cart.lunch.quantity,
            }
            : null,
        dinner: cart.dinner
            ? {
                option: cart.dinner.option,
                quantity: cart.dinner.quantity,
            }
            : null,
    };
}