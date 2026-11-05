'use client';

import {
    createContext,
    useCallback,
    useEffect,
    useMemo,
    useState,
    type ReactNode,
} from 'react';

import type {
    CartBreakfastItem,
    CartContextType,
    CartPackageSelection,
    CustomerCart,
} from '@/types/cart';

import {
    calculateCartSubtotal,
    CART_STORAGE_KEY,
    createEmptyCart,
    getCartItemCount,
    getTodayDate,
    normalizeCart,
} from '../../lib/cart/cart.utils';

export const CartContext = createContext<CartContextType | undefined>(
    undefined
);

interface CartProviderProps {
    children: ReactNode;
}

export function CartProvider({ children }: CartProviderProps) {
    const [cart, setCart] = useState<CustomerCart>(() => createEmptyCart());
    const [isHydrated, setIsHydrated] = useState(false);

    useEffect(() => {
        try {
            const storedCart = localStorage.getItem(CART_STORAGE_KEY);

            if (storedCart) {
                const parsedCart: unknown = JSON.parse(storedCart);
                const normalizedCart = normalizeCart(parsedCart);

                if (normalizedCart) {
                    // Restore persisted cart during browser hydration.
                    // eslint-disable-next-line react-hooks/set-state-in-effect
                    setCart(normalizedCart);
                } else {
                    // Initialize a fresh cart when stored data is invalid.
                    setCart(createEmptyCart(getTodayDate()));
                }
            } else {
                // Calculate today's date only in the browser.
                setCart(createEmptyCart(getTodayDate()));
            }
        } catch {
            localStorage.removeItem(CART_STORAGE_KEY);

            // Initialize a fresh cart after a storage/parsing failure.
            setCart(createEmptyCart(getTodayDate()));
        } finally {
            setIsHydrated(true);
        }
    }, []);

    useEffect(() => {
        if (!isHydrated) {
            return;
        }

        try {
            localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
        } catch {
            // Storage may be unavailable or full.
        }
    }, [cart, isHydrated]);

    const addBreakfastItem = useCallback(
        (
            item: Omit<CartBreakfastItem, 'quantity'> & {
                quantity?: number;
            }
        ) => {
            setCart(previousCart => {
                const existingItem = previousCart.breakfastItems.find(
                    existing => existing.menuItemId === item.menuItemId
                );

                const quantityToAdd = item.quantity ?? 1;

                if (
                    !Number.isInteger(quantityToAdd) ||
                    quantityToAdd < 1
                ) {
                    return previousCart;
                }

                if (existingItem) {
                    return {
                        ...previousCart,
                        breakfastItems: previousCart.breakfastItems.map(
                            existing =>
                                existing.menuItemId === item.menuItemId
                                    ? {
                                        ...existing,
                                        quantity: Math.min(
                                            existing.quantity + quantityToAdd,
                                            20
                                        ),
                                        name: item.name,
                                        displayedPrice: item.displayedPrice,
                                    }
                                    : existing
                        ),
                    };
                }

                return {
                    ...previousCart,
                    breakfastItems: [
                        ...previousCart.breakfastItems,
                        {
                            ...item,
                            quantity: Math.min(quantityToAdd, 20),
                        },
                    ],
                };
            });
        },
        []
    );

    const updateBreakfastQuantity = useCallback(
        (menuItemId: string, quantity: number) => {
            setCart(previousCart => {
                if (!Number.isInteger(quantity)) {
                    return previousCart;
                }

                if (quantity <= 0) {
                    return {
                        ...previousCart,
                        breakfastItems: previousCart.breakfastItems.filter(
                            item => item.menuItemId !== menuItemId
                        ),
                    };
                }

                return {
                    ...previousCart,
                    breakfastItems: previousCart.breakfastItems.map(item =>
                        item.menuItemId === menuItemId
                            ? { ...item, quantity: Math.min(quantity, 20) }
                            : item
                    ),
                };
            });
        },
        []
    );

    const removeBreakfastItem = useCallback((menuItemId: string) => {
        setCart(previousCart => ({
            ...previousCart,
            breakfastItems: previousCart.breakfastItems.filter(
                item => item.menuItemId !== menuItemId
            ),
        }));
    }, []);

    const setLunchPackage = useCallback(
        (selection: CartPackageSelection | null) => {
            setCart(previousCart => ({
                ...previousCart,
                lunch: selection,
            }));
        },
        []
    );

    const setDinnerPackage = useCallback(
        (selection: CartPackageSelection | null) => {
            setCart(previousCart => ({
                ...previousCart,
                dinner: selection,
            }));
        },
        []
    );

    const removeLunchPackage = useCallback(() => {
        setCart(previousCart => ({
            ...previousCart,
            lunch: null,
        }));
    }, []);

    const removeDinnerPackage = useCallback(() => {
        setCart(previousCart => ({
            ...previousCart,
            dinner: null,
        }));
    }, []);

    const setOrderDate = useCallback((orderDate: string) => {
        setCart(previousCart => {
            if (previousCart.orderDate === orderDate) {
                return previousCart;
            }

            return {
                ...createEmptyCart(orderDate),
                deliveryType: previousCart.deliveryType,
            };
        });
    }, []);

    const setDeliveryType = useCallback(
        (deliveryType: 'pickup' | 'delivery') => {
            setCart(previousCart => ({
                ...previousCart,
                deliveryType,
            }));
        },
        []
    );

    const setNotes = useCallback((notes: string) => {
        setCart(previousCart => ({
            ...previousCart,
            notes: notes.slice(0, 500),
        }));
    }, []);

    const clearCart = useCallback(() => {
        setCart(previousCart => ({
            ...createEmptyCart(previousCart.orderDate),
            deliveryType: previousCart.deliveryType,
        }));
    }, []);

    const subtotal = useMemo(
        () => calculateCartSubtotal(cart),
        [cart]
    );

    const itemCount = useMemo(
        () => getCartItemCount(cart),
        [cart]
    );

    const contextValue = useMemo<CartContextType>(
        () => ({
            cart,
            subtotal,
            itemCount,
            isHydrated,
            addBreakfastItem,
            updateBreakfastQuantity,
            removeBreakfastItem,
            setLunchPackage,
            setDinnerPackage,
            removeLunchPackage,
            removeDinnerPackage,
            setOrderDate,
            setDeliveryType,
            setNotes,
            clearCart,
        }),
        [
            cart,
            subtotal,
            itemCount,
            isHydrated,
            addBreakfastItem,
            updateBreakfastQuantity,
            removeBreakfastItem,
            setLunchPackage,
            setDinnerPackage,
            removeLunchPackage,
            removeDinnerPackage,
            setOrderDate,
            setDeliveryType,
            setNotes,
            clearCart,
        ]
    );

    return (
        <CartContext.Provider value={contextValue}>
            {children}
        </CartContext.Provider>
    );
}