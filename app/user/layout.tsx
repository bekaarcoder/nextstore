import Footer from '@/components/footer';
import Menu from '@/components/shared/header/menu';
import { APP_NAME } from '@/lib/constants';
import Image from 'next/image';
import Link from 'next/link';
import MainNav from './main-nav';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';

export default async function UserLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const session = await auth();

    if (!session?.user?.id) redirect('/sign-in');

    return (
        <div className="flex h-screen flex-col">
            <div className="border-b container mx-auto">
                <div className="flex items-center h-16 px-4">
                    <Link href={'/'} className="w-20">
                        <Image
                            src={'/images/logo.svg'}
                            height={48}
                            width={48}
                            alt={APP_NAME}
                        />
                    </Link>
                    <MainNav />
                    <div className="ml-auto items-center flex space-x-4">
                        <Menu />
                    </div>
                </div>
            </div>
            <main className="flex-1 space-y-4 p-8 pt-6 container mx-auto">
                {children}
            </main>
            <Footer />
        </div>
    );
}
