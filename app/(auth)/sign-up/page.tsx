import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import Image from 'next/image';
import Link from 'next/link';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { Metadata } from 'next';
import SignUpForm from './sign-up-form';

export const metadata: Metadata = {
    title: 'Sign Up',
};

const RegisterPage = async (props: {
    searchParams: Promise<{ callbackUrl: string }>;
}) => {
    const { callbackUrl } = await props.searchParams;

    const session = await auth();

    if (session) {
        return redirect(callbackUrl || '/');
    }

    return (
        <div className="w-full max-w-md mx-auto">
            <Card>
                <CardHeader className="space-y-4">
                    <Link href={'/'} className="flex-center">
                        <Image
                            src={'/images/logo.svg'}
                            width={100}
                            height={100}
                            alt="app logo"
                            priority={true}
                        />
                    </Link>
                    <CardTitle className="text-center">Sign Up</CardTitle>
                    <CardDescription className="text-center">
                        Create a new account
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <SignUpForm />
                </CardContent>
            </Card>
        </div>
    );
};

export default RegisterPage;
