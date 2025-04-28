import React, {useEffect} from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import Navigation from './components/common/Navigation';
import HomePage from './pages/HomePage';
import PetsPage from './pages/PetsPage';
import PetDetailPage from './pages/PetDetailPage';
import FoodPage from './pages/FoodPage';
import CategoryPage from './pages/CategoryPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import LoginPage from './pages/Login';
import RegisterPage from "@/pages/Register";
import {useDispatch} from "react-redux";
import {setUser} from "@/store/userSlice";
import GuestGuard from "@/middleware/GuestGuard";

// Sửa đường dẫn import cho các trang spa
import SpaHomePage from './pages/SpaHomePage';
// Tạo các tệp này nếu chưa có
import SpaServicesPage from './pages/SpaServicesPage';
import SpaServiceDetailPage from './pages/SpaServiceDetailPage';
import SpaBookingPage from './pages/SpaBookingPage';
// Thêm các import
import SpaAppointmentsPage from './pages/SpaAppointmentsPage';
import SpaReviewPage from './pages/SpaReviewPage';
import SpaBookingConfirmation from './pages/SpaBookingConfirmation';
// Thêm import
import PaymentCallbackPage from './pages/PaymentCallbackPage';
// Thêm import
import SearchPage from './pages/SearchPage';

const App = () => {
    const dispatch = useDispatch();

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            dispatch(setUser(JSON.parse(storedUser)));
        }
    }, [dispatch]);

    return (
    <Router>
      <Header />
      <Navigation />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/pets" element={<PetsPage />} />
          <Route path="/pet/:id" element={<PetDetailPage />} />
          <Route path="/foods" element={<FoodPage />} />
          <Route path="/category/:id" element={<CategoryPage />} />
          <Route path="/product/:id" element={<ProductDetailPage />} />
          <Route path="/products/:id" element={<ProductDetailPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />

          {/* Routes cho spa */}
          <Route path="/spa" element={<SpaHomePage />} />
          <Route path="/spa/services" element={<SpaServicesPage />} />
          <Route path="/spa/service/:id" element={<SpaServiceDetailPage />} />
          <Route path="/spa/booking" element={<SpaBookingPage />} />
          <Route path="/spa/appointments" element={<SpaAppointmentsPage />} />
          <Route path="/spa/review/:id" element={<SpaReviewPage />} />
          <Route path="/spa/booking/confirmation/:id" element={<SpaBookingConfirmation />} />
          
          {/* Route cho payment callback */}
          <Route path="/payment/callback" element={<PaymentCallbackPage />} />

          {/* Route cho search */}
          <Route path="/search" element={<SearchPage />} />
            <Route
                path="/login"
                element={
                    <GuestGuard>
                        <LoginPage />
                    </GuestGuard>
                }
            />
            <Route path="/register" element={
                <GuestGuard>
                    <RegisterPage />
                </GuestGuard>
            } />
        </Routes>
      </main>
      <Footer />
      <ToastContainer position="top-right" autoClose={3000} />
    </Router>
  );
};

export default App;