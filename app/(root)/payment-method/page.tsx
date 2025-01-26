import { auth } from '@/auth';
import CheckoutSteps from '@/components/shared/checkout-steps';
import { getUserById } from '@/lib/actions/user.actions';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import PaymentMethodForm from './payment-method-form';

export const metadata: Metadata = {
    title: 'Payment Method',
};

const PaymentMethodPage = async () => {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) redirect('/sign-in');

    const user = await getUserById(userId);
    return (
        <div>
            <CheckoutSteps current={2} />
            <PaymentMethodForm preferredPaymentMethod={user.paymentMethod} />
        </div>
    );
};

export default PaymentMethodPage;
