'use client';

import { Button } from '@/components/ui/button';
import { signOutUser } from '@/lib/actions/user.actions';
import { FormEvent } from 'react';

const SignOutForm = () => {
    const onSignOut = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        await signOutUser();
    };

    return (
        <form onSubmit={(e) => onSignOut(e)} className="w-full">
            <Button
                className="w-full py-4 px-2 justify-start"
                variant={'ghost'}
                type="submit"
            >
                Sign Out
            </Button>
        </form>
    );
};

export default SignOutForm;
