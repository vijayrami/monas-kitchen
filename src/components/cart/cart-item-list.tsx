'use client';

import { useCart } from '@/hooks/use-cart';
import { CartItemCard } from '@/components/cart/cart-item-card';

export function CartItemList() {
    const {
        cart,
        updateBreakfastQuantity,
        removeBreakfastItem,
        setLunchPackage,
        setDinnerPackage,
        removeLunchPackage,
        removeDinnerPackage,
    } = useCart();

    return (
        <div className="divide-y rounded-xl border bg-white px-5">
            {cart.breakfastItems.length > 0 && (
                <section className="py-4">
                    <h2 className="text-lg font-bold text-gray-900">
                        Breakfast
                    </h2>

                    {cart.breakfastItems.map(item => (
                        <CartItemCard
                            key={item.menuItemId}
                            title={item.name}
                            description="Breakfast item"
                            quantity={item.quantity}
                            unitPrice={item.displayedPrice}
                            onQuantityChange={quantity =>
                                updateBreakfastQuantity(
                                    item.menuItemId,
                                    quantity
                                )
                            }
                            onRemove={() =>
                                removeBreakfastItem(item.menuItemId)
                            }
                        />
                    ))}
                </section>
            )}

            {cart.lunch && (
                <section className="py-4">
                    <h2 className="text-lg font-bold text-gray-900">
                        Lunch
                    </h2>

                    <CartItemCard
                        title={`${cart.lunch.option === 'regular' ? 'Regular' : 'Special'} Lunch Package`}
                        description={
                            cart.lunch.option === 'special'
                                ? `Includes ${cart.lunch.sweetName}`
                                : 'Dal, Rice, Roti and Sabji'
                        }
                        quantity={cart.lunch.quantity}
                        unitPrice={cart.lunch.displayedPrice}
                        onQuantityChange={quantity =>
                            setLunchPackage({
                                ...cart.lunch!,
                                quantity,
                            })
                        }
                        onRemove={removeLunchPackage}
                    />
                </section>
            )}

            {cart.dinner && (
                <section className="py-4">
                    <h2 className="text-lg font-bold text-gray-900">
                        Dinner
                    </h2>

                    <CartItemCard
                        title={`${cart.dinner.option === 'regular' ? 'Regular' : 'Special'} Dinner Package`}
                        description={
                            cart.dinner.option === 'special'
                                ? `Includes ${cart.dinner.sweetName}`
                                : 'Dal, Rice, Roti and Sabji'
                        }
                        quantity={cart.dinner.quantity}
                        unitPrice={cart.dinner.displayedPrice}
                        onQuantityChange={quantity =>
                            setDinnerPackage({
                                ...cart.dinner!,
                                quantity,
                            })
                        }
                        onRemove={removeDinnerPackage}
                    />
                </section>
            )}
        </div>
    );
}