import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { removeFromCart } from '../../store/cartSlice';
import CartItem from './CartItem';

const Cart = () => {
    const cartItems = useSelector((state) => state.cart.items);
    const dispatch = useDispatch();

    const handleRemoveItem = (id) => {
        dispatch(removeFromCart(id));
    };

    const totalAmount = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);

    return (
        <div className="cart">
            <h2>Your Shopping Cart</h2>
            {cartItems.length === 0 ? (
                <p>Your cart is empty.</p>
            ) : (
                <div>
                    {cartItems.map((item) => (
                        <CartItem key={item.id} item={item} onRemove={handleRemoveItem} />
                    ))}
                    <h3>Total: ${totalAmount.toFixed(2)}</h3>
                </div>
            )}
        </div>
    );
};

export default Cart;