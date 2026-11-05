import Link from 'next/link';

export function CartEmptyState() {
    return (
        <div className="rounded-xl border bg-white px-6 py-16 text-center">
            <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-orange-50">
                <span className="text-3xl" aria-hidden="true">
                    🛒
                </span>
            </div>

            <h2 className="mt-5 text-xl font-bold text-gray-900">
                Your cart is empty
            </h2>

            <p className="mt-2 text-sm text-gray-500">
                Add breakfast items or select a lunch or dinner package.
            </p>

            <Link
                href="/menu"
                className="mt-6 inline-flex rounded-lg bg-orange-600 px-5 py-3 text-sm font-semibold text-white hover:bg-orange-700"
            >
                Browse Menu
            </Link>
        </div>
    );
}