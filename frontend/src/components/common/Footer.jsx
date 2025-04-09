import React from 'react';
import './Footer.css';
import { FaFacebook, FaInstagram, FaYoutube, FaTwitter, FaMapMarkerAlt, FaPhone, FaEnvelope, FaPhoneAlt } from 'react-icons/fa';

const Footer = () => {
    return (
        <footer className="footer">
            <div className="footer-content">
                <div className="footer-section">
                    <h3>Về PetLand</h3>
                    <p>PetLand là nhà cung cấp thú cưng và các sản phẩm thú cưng uy tín tại Việt Nam. Chúng tôi cam kết mang đến cho khách hàng những sản phẩm chất lượng cao nhất.</p>
                    <div className="social-links">
                        <a href="#"><FaFacebook /></a>
                        <a href="#"><FaInstagram /></a>
                        <a href="#"><FaYoutube /></a>
                        <a href="#"><FaTwitter /></a>
                    </div>
                </div>
                
                <div className="footer-section">
                    <h3>Chính sách</h3>
                    <ul>
                        <li><a href="/shipping-policy">Chính sách vận chuyển</a></li>
                        <li><a href="/return-policy">Chính sách đổi trả</a></li>
                        <li><a href="/warranty">Bảo hành thú cưng</a></li>
                        <li><a href="/privacy">Chính sách bảo mật</a></li>
                        <li><a href="/terms">Điều khoản sử dụng</a></li>
                    </ul>
                </div>
                
                <div className="footer-section">
                    <h3>Danh mục</h3>
                    <ul>
                        <li><a href="/pets/dogs">Chó cảnh</a></li>
                        <li><a href="/pets/cats">Mèo cảnh</a></li>
                        <li><a href="/foods/dog">Thức ăn cho chó</a></li>
                        <li><a href="/foods/cat">Thức ăn cho mèo</a></li>
                        <li><a href="/accessories">Phụ kiện thú cưng</a></li>
                    </ul>
                </div>
                
                <div className="footer-section">
                    <h3>Liên hệ</h3>
                    <div className="contact-info">
                        <FaMapMarkerAlt />
                        <p>Số 1 Thái Hà,Đống Đa,Hà Nội</p>
                    </div>
                    <div className="contact-info">
                        <FaPhoneAlt />
                        <p>0355292839</p>
                    </div>
                    <div className="contact-info">
                        <FaEnvelope />
                        <p>contact@petland.com</p>
                    </div>
                    <div className="newsletter">
                        <h4>Đăng ký nhận tin</h4>
                        <form>
                            <input type="email" placeholder="Email của bạn" />
                            <button type="submit">Đăng ký</button>
                        </form>
                    </div>
                </div>
            </div>
            
            <div className="footer-bottom">
                <p>&copy; {new Date().getFullYear()} PetLand - Cửa hàng Thú cưng. All rights reserved.</p>
            </div>
        </footer>
    );
};

export default Footer;