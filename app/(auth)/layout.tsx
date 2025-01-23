export default function AuthLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div className="flex h-screen justify-center items-center">
            <main className="flex-1 wrapper">{children}</main>
        </div>
    );
}
