import { RegisterForm } from '@/components/auth/register-form';

export default function RegisterPage() {
    return (
        <main className="flex min-h-screen items-center justify-center bg-gray-50 px-6 py-12">
            <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm">
                <div className="mb-8 text-center">
                    <p className="text-sm font-medium uppercase tracking-wider text-orange-600">
                        Mona&apos;s Kitchen
                    </p>

                    <h1 className="mt-2 text-3xl font-bold">
                        Create your account
                    </h1>

                    <p className="mt-2 text-sm text-gray-600">
                        Join your society food community.
                    </p>
                </div>

                <RegisterForm />
            </div>
        </main>
    );
}