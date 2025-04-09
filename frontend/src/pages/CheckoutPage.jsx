import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { clearCart } from '../store/cartSlice';

const CheckoutPage = () => {
    const cartItems = useSelector((state) => state.cart.items);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleCheckout = () => {
        // Logic for handling checkout process
        // For example, API call to create an order
        dispatch(clearCart());
        navigate('/thank-you');
    };

    return (
        <div className="checkout-page">
            <h1>Checkout</h1>
            {cartItems.length === 0 ? (
                <p>Your cart is empty.</p>
            ) : (
                <div>
                    <h2>Your Items:</h2>
                    <ul>
                        {cartItems.map((item) => (
                            <li key={item.id}>{item.name} - ${item.price}</li>
                        ))}
                    </ul>
                    <button onClick={handleCheckout}>Proceed to Checkout</button>
                </div>
            )}
        </div>
    );
};

export default CheckoutPage;