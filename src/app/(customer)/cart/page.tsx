import { Suspense } from 'react';

import { CartPageContent } from '@/components/cart/cart-page-content';

export default function CartPage() {
    return (
        <Suspense fallback={<p>Loading cart...</p>}>
            <CartPageContent />
        </Suspense>
    );
}