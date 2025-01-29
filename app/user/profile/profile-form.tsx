'use client';

import { Button } from '@/components/ui/button';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { updateProfile } from '@/lib/actions/user.actions';
import { updateProfileSchema } from '@/lib/validators';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSession } from 'next-auth/react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { z } from 'zod';

const ProfileForm = () => {
    const { data: session, update } = useSession();

    const { toast } = useToast();

    const form = useForm<z.infer<typeof updateProfileSchema>>({
        resolver: zodResolver(updateProfileSchema),
        defaultValues: {
            name: session?.user?.name ?? '',
            email: session?.user?.email ?? '',
        },
    });

    const onSubmit: SubmitHandler<z.infer<typeof updateProfileSchema>> = async (
        values
    ) => {
        const res = await updateProfile(values);

        if (!res.success) {
            toast({
                variant: 'destructive',
                description: res.message,
            });

            return;
        }

        const newSession = {
            ...session,
            user: { ...session?.user, name: values.name },
        };

        await update(newSession);

        toast({
            variant: 'default',
            description: res.message,
        });
    };

    return (
        <Form {...form}>
            <form
                className="flex flex-col gap-5"
                onSubmit={form.handleSubmit(onSubmit)}
            >
                <div className="flex flex-col gap-5">
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem className="w-full">
                                <FormControl>
                                    <Input
                                        disabled
                                        placeholder="Email"
                                        className="input-field"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                <div className="flex flex-col gap-5">
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem className="w-full">
                                <FormControl>
                                    <Input
                                        placeholder="Name"
                                        className="input-field"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                <Button
                    type="submit"
                    size={'lg'}
                    className="w-full"
                    disabled={form.formState.isSubmitting}
                >
                    {form.formState.isSubmitting
                        ? 'Submitting...'
                        : 'Update Profile'}
                </Button>
            </form>
        </Form>
    );
};

export default ProfileForm;
