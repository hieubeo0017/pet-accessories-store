import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { FaTrashAlt, FaArrowLeft, FaShoppingCart } from 'react-icons/fa';
import { removeItem } from '../store/cartSlice'; // Bỏ phần import updateQuantity
import './CartPage.css';

const CartPage = () => {
    const dispatch = useDispatch();
    const cartItems = useSelector((state) => state.cart.items);
    const totalAmount = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
    const shippingFee = totalAmount > 2000000 ? 0 : 30000; // Miễn phí vận chuyển cho đơn hàng từ 2 triệu
    const finalAmount = totalAmount + shippingFee;

    const handleQuantityChange = (id, newQuantity) => {
        if (newQuantity >= 1) {
            // Tạm thời log ra console thay vì gọi action
            console.log(`Cập nhật số lượng sản phẩm ${id} thành ${newQuantity}`);
            // Sẽ thêm logic thực tế sau
        }
    };

    const handleRemoveItem = (id) => {
        if (window.confirm('Bạn có chắc muốn xóa sản phẩm này khỏi giỏ hàng?')) {
            dispatch(removeItem(id));
        }
    };

    return (
        <div className="cart-page">
            <div className="cart-header">
                <h1>Giỏ hàng của bạn</h1>
                <p className="cart-count">{cartItems.length} sản phẩm</p>
            </div>

            {cartItems.length === 0 ? (
                <div className="empty-cart">
                    <FaShoppingCart className="empty-cart-icon" />
                    <p>Giỏ hàng của bạn đang trống</p>
                    <Link to="/" className="continue-shopping">Tiếp tục mua sắm</Link>
                </div>
            ) : (
                <div className="cart-content">
                    <div className="cart-items-container">
                        <table className="cart-table">
                            <thead>
                                <tr>
                                    <th className="product-col">Sản phẩm</th>
                                    <th className="price-col">Đơn giá</th>
                                    <th className="quantity-col">Số lượng</th>
                                    <th className="subtotal-col">Thành tiền</th>
                                    <th className="action-col"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {cartItems.map((item) => (
                                    <tr key={item.id} className="cart-item">
                                        <td className="product-col">
                                            <div className="product-info">
                                                <img src={item.image} alt={item.name} />
                                                <div>
                                                    <h3>{item.name}</h3>
                                                    {item.type && <span className="product-type">{item.type === 'dog' ? 'Chó' : item.type === 'cat' ? 'Mèo' : item.type}</span>}
                                                    {item.breed && <span className="product-breed">Giống: {item.breed}</span>}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="price-col">{item.price.toLocaleString('vi-VN')}đ</td>
                                        <td className="quantity-col">
                                            <div className="quantity-selector">
                                                <button 
                                                    onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                                                    disabled={item.quantity <= 1}
                                                >-</button>
                                                <span>{item.quantity}</span>
                                                <button onClick={() => handleQuantityChange(item.id, item.quantity + 1)}>+</button>
                                            </div>
                                        </td>
                                        <td className="subtotal-col">
                                            {(item.price * item.quantity).toLocaleString('vi-VN')}đ
                                        </td>
                                        <td className="action-col">
                                            <button 
                                                className="remove-item" 
                                                onClick={() => handleRemoveItem(item.id)}
                                            >
                                                <FaTrashAlt />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="cart-summary">
                        <h2>Tổng giỏ hàng</h2>
                        <div className="summary-row">
                            <span>Tạm tính:</span>
                            <span>{totalAmount.toLocaleString('vi-VN')}đ</span>
                        </div>
                        <div className="summary-row">
                            <span>Phí vận chuyển:</span>
                            <span>
                                {shippingFee === 0 ? 'Miễn phí' : `${shippingFee.toLocaleString('vi-VN')}đ`}
                            </span>
                        </div>
                        {shippingFee > 0 && (
                            <div className="free-shipping-note">
                                <p>Mua thêm {(2000000 - totalAmount).toLocaleString('vi-VN')}đ để được miễn phí vận chuyển</p>
                            </div>
                        )}
                        <div className="summary-total">
                            <span>Tổng cộng:</span>
                            <span className="total-amount">{finalAmount.toLocaleString('vi-VN')}đ</span>
                        </div>
                        <div className="cart-buttons">
                            <Link to="/checkout" className="checkout-button">Tiến hành thanh toán</Link>
                            <Link to="/" className="continue-shopping-btn">
                                <FaArrowLeft /> Tiếp tục mua sắm
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CartPage;