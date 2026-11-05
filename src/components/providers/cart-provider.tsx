'use client';

import { createClient } from '@/lib/supabase/client';

import {
    createContext,
    useCallback,
    useEffect,
    useMemo,
    useRef,
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
    const [userId, setUserId] = useState<string | null>(null);
    const [isAuthResolved, setIsAuthResolved] = useState(false);
    const [hydratedStorageKey, setHydratedStorageKey] = useState<string | null>(
        null
    );

    const supabase = useMemo(() => createClient(), []);
    const currentUserId = useRef<string | null | undefined>(undefined);

    const storageKey = `${CART_STORAGE_KEY}:${userId ?? 'guest'}`;

    /**
     * Synchronize the cart with Supabase authentication.
     */
    useEffect(() => {
        let isMounted = true;

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            if (!isMounted) {
                return;
            }

            const nextUserId = session?.user.id ?? null;

            if (currentUserId.current !== nextUserId) {
                currentUserId.current = nextUserId;

                setUserId(nextUserId);
                setCart(createEmptyCart());
                setIsHydrated(false);
                setHydratedStorageKey(null);
            }

            setIsAuthResolved(true);
        });

        return () => {
            isMounted = false;
            subscription.unsubscribe();
        };
    }, [supabase]);

    /**
     * Load the cart belonging to the authenticated customer.
     */
    useEffect(() => {
        if (!isAuthResolved) {
            return;
        }

        let isActive = true;

        const loadCart = async () => {
            // Defer state updates until the effect has completed.
            await Promise.resolve();

            let nextCart = createEmptyCart(getTodayDate());

            try {
                // Remove the legacy shared cart.
                localStorage.removeItem(CART_STORAGE_KEY);

                // Guest users must never access customer carts.
                if (userId) {
                    const storedCart = localStorage.getItem(storageKey);

                    if (storedCart) {
                        const parsedCart: unknown = JSON.parse(storedCart);
                        const normalizedCart = normalizeCart(parsedCart);

                        if (normalizedCart) {
                            nextCart = normalizedCart;
                        } else {
                            localStorage.removeItem(storageKey);
                        }
                    }
                }
            } catch {
                nextCart = createEmptyCart(getTodayDate());
            }

            if (!isActive) {
                return;
            }

            setCart(nextCart);
            setHydratedStorageKey(storageKey);
            setIsHydrated(true);
        };

        void loadCart();

        return () => {
            isActive = false;
        };
    }, [isAuthResolved, storageKey, userId]);

    /**
     * Persist the cart only for an authenticated customer.
     */
    useEffect(() => {
        if (
            !isAuthResolved ||
            !userId ||
            !isHydrated ||
            hydratedStorageKey !== storageKey
        ) {
            return;
        }

        try {
            localStorage.setItem(storageKey, JSON.stringify(cart));
        } catch {
            // Storage may be unavailable or full.
        }
    }, [
        cart,
        isAuthResolved,
        userId,
        isHydrated,
        hydratedStorageKey,
        storageKey,
    ]);

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

    const resetCartOnLogout = useCallback(() => {
        currentUserId.current = null;

        setCart(createEmptyCart(getTodayDate()));
        setUserId(null);
        setIsHydrated(false);
        setHydratedStorageKey(null);
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
            resetCartOnLogout,
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
            resetCartOnLogout,
        ]
    );

    return (
        <CartContext.Provider value={contextValue}>
            {children}
        </CartContext.Provider>
    );
}