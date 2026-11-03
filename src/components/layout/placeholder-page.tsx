interface PlaceholderPageProps {
    title: string;
}

export function PlaceholderPage({ title }: PlaceholderPageProps) {
    return (
        <main className="mx-auto max-w-6xl px-6 py-10">
            <h1 className="text-3xl font-bold">{title}</h1>
            <p className="mt-3 text-gray-600">
                This page is under development.
            </p>
        </main>
    );
}