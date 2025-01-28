import { getOrderById } from '@/lib/actions/order.actions';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import OrderDetailsTable from './order-details-table';
import { ShippingAddress } from '@/types';

export const metadata: Metadata = {
    title: 'Order Details',
};

const OrderDetailsPage = async (props: { params: Promise<{ id: string }> }) => {
    const { id } = await props.params;

    const res = await getOrderById(id);

    if (!res.success) {
        return notFound();
    }

    if (!res.data) notFound();

    const order = res.data;

    return (
        <div>
            <OrderDetailsTable
                order={{
                    ...order,
                    shippingAddress: order.shippingAddress as ShippingAddress,
                }}
            />
        </div>
    );
};

export default OrderDetailsPage;
