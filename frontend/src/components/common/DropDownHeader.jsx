import React, {useState} from 'react';
import './Footer.css';

import {Dropdown} from "react-bootstrap";
import {FaUserCircle} from "react-icons/fa";
import {setUser} from "@/store/userSlice";
import {useNavigate} from "react-router-dom";
import {useDispatch} from "react-redux";


const DropDownHeader = ({ user }) => {

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('user');
        dispatch(setUser(null));
        navigate('/login');
    };

    const [showDropdown, setShowDropdown] = useState(false);
    const toggleDropdown = () => {
        setShowDropdown(prevState => !prevState);
    };

    return (
        <Dropdown show={showDropdown} onToggle={toggleDropdown}>
            <Dropdown.Toggle variant="success" id="user-dropdown" onClick={toggleDropdown}>
                {user.avatar ? (
                    <img src={user.avatar} alt={user.name} className="user-avatar-img" />
                ) : (
                    <FaUserCircle className="user-avatar-icon" />
                )}
            </Dropdown.Toggle>

            <Dropdown.Menu>
                <Dropdown.Item href="/profile">Tài khoản của tôi</Dropdown.Item>
                <Dropdown.Item href="/orders">Đơn hàng</Dropdown.Item>
                <Dropdown.Item as="button" onClick={handleLogout}>Đăng xuất</Dropdown.Item>
            </Dropdown.Menu>
        </Dropdown>
    );
};

export default DropDownHeader;