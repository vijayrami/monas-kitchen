import Link from 'next/link';

export default function AdminPage() {
    return (
        <main className="mx-auto max-w-6xl px-6 py-10">
            <div className="mb-8">
                <h1 className="text-3xl font-bold">
                    Admin Dashboard
                </h1>

                <p className="mt-2 text-gray-600">
                    Manage Mona&apos;s Kitchen.
                </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <Link
                    href="/admin/menu-items"
                    className="rounded-xl border bg-white p-6 shadow-sm transition hover:shadow-md"
                >
                    <h2 className="text-lg font-semibold">
                        Menu Items
                    </h2>

                    <p className="mt-2 text-sm text-gray-500">
                        Create and manage breakfast, lunch, and dinner
                        items.
                    </p>
                </Link>

                <Link
                    href="/admin/menu"
                    className="rounded-xl border bg-white p-6 shadow-sm transition hover:shadow-md"
                >
                    <h2 className="text-lg font-semibold">
                        Daily Menu
                    </h2>

                    <p className="mt-2 text-sm text-gray-500">
                        Configure menus for specific dates.
                    </p>
                </Link>

                <Link
                    href="/admin/orders"
                    className="rounded-xl border bg-white p-6 shadow-sm transition hover:shadow-md"
                >
                    <h2 className="text-lg font-semibold">
                        Orders
                    </h2>

                    <p className="mt-2 text-sm text-gray-500">
                        View and manage customer orders.
                    </p>
                </Link>
            </div>
        </main>
    );
}