import { LoginForm } from '@/components/auth/login-form';

export default function LoginPage() {
    return (
        <main className="flex min-h-screen items-center justify-center bg-gray-50 px-6 py-12">
            <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm">
                <div className="mb-8 text-center">
                    <p className="text-sm font-medium uppercase tracking-wider text-orange-600">
                        Mona&apos;s Kitchen
                    </p>

                    <h1 className="mt-2 text-3xl font-bold">
                        Welcome back
                    </h1>

                    <p className="mt-2 text-sm text-gray-600">
                        Login to manage your food orders.
                    </p>
                </div>

                <LoginForm />
            </div>
        </main>
    );
}