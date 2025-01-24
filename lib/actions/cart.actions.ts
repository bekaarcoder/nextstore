'use server';

import { cookies } from 'next/headers';
import { CartItem } from '@/types';
import { convertToPlainObject, formatError, round2 } from '../utils';
import { auth } from '@/auth';
import { prisma } from '@/db/prisma';
import { cartItemSchema, insertCartSchema } from '../validators';
import { revalidatePath } from 'next/cache';
import { Prisma } from '@prisma/client';

// Calculate cart price
const calculatePrice = (items: CartItem[]) => {
    const itemsPrice = round2(
            items.reduce(
                (acc, item) => acc + Number(item.price) * item.quantity,
                0
            )
        ),
        shippingPrice = round2(itemsPrice < 100 ? 0 : 100),
        taxPrice = round2(0.15 * itemsPrice),
        totalPrice = round2(itemsPrice + taxPrice + shippingPrice);

    return {
        itemsPrice: itemsPrice.toFixed(2),
        shippingPrice: shippingPrice.toFixed(2),
        taxPrice: taxPrice.toFixed(2),
        totalPrice: totalPrice.toFixed(2),
    };
};

export async function addItemToCart(data: CartItem) {
    try {
        // check for the cart cookie
        const sessionCartId = (await cookies()).get('sessionCartId')?.value;

        if (!sessionCartId) {
            throw new Error('Cart session not found');
        }

        // Get session and user id
        const session = await auth();
        const userId = session?.user?.id
            ? (session.user.id as string)
            : undefined;

        // Get cart
        const cart = await getMyCart();

        // Parse and validate item
        const item = cartItemSchema.parse(data);

        // Find product in database
        const product = await prisma.product.findFirst({
            where: {
                id: item.productId,
            },
        });

        if (!product) throw new Error('Product not found');

        if (!cart) {
            // Create a new cart
            const newCart = insertCartSchema.parse({
                userId: userId,
                items: [item],
                sessionCartId: sessionCartId,
                ...calculatePrice([item]),
            });

            // Add to database
            await prisma.cart.create({
                data: newCart,
            });

            // Revalidate product page
            revalidatePath(`/product/${product.slug}`);

            return {
                success: true,
                message: `${product.name} added to cart`,
            };
        } else {
            // Check if item already in the cart
            const existItem = (cart.items as CartItem[]).find(
                (x) => x.productId === item.productId
            );
            if (existItem) {
                // check stock
                if (product.stock < existItem.quantity + 1) {
                    throw new Error('Product not in stock');
                }

                // Increase the quantity
                cart.items = cart.items.map((x) =>
                    x.productId === item.productId
                        ? { ...x, quantity: x.quantity + 1 }
                        : x
                );
            } else {
                // check stock
                if (product.stock < 1) throw new Error('Product not in stock');

                // add item to cart
                cart.items.push(item);
            }

            // save to database
            await prisma.cart.update({
                where: {
                    id: cart.id,
                },
                data: {
                    items: cart.items as Prisma.CartUpdateitemsInput[],
                    ...calculatePrice(cart.items as CartItem[]),
                },
            });

            revalidatePath(`/product/${product.slug}`);

            return {
                success: true,
                message: `${product.name} ${
                    existItem ? 'updated in' : 'add to'
                } cart`,
            };
        }
    } catch (error) {
        return {
            success: false,
            message: formatError(error),
        };
    }
}

export async function getMyCart() {
    // check for the cart cookie
    const sessionCartId = (await cookies()).get('sessionCartId')?.value;

    if (!sessionCartId) {
        throw new Error('Cart session not found');
    }

    // Get session and user id
    const session = await auth();
    const userId = session?.user?.id ? (session.user.id as string) : undefined;

    // Get user cart from database
    const cart = await prisma.cart.findFirst({
        where: userId ? { userId: userId } : { sessionCartId: sessionCartId },
    });

    if (!cart) return undefined;

    // Convert decimals and return
    return convertToPlainObject({
        ...cart,
        items: cart.items as CartItem[],
        itemsPrice: cart.itemsPrice.toString(),
        totalPrice: cart.totalPrice.toString(),
        shippingPrice: cart.shippingPrice.toString(),
        taxPrice: cart.taxPrice.toString(),
    });
}
