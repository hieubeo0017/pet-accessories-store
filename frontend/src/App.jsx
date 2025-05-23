import React from 'react';
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

// Sửa đường dẫn import cho các trang spa
import SpaHomePage from './pages/SpaHomePage';
// Tạo các tệp này nếu chưa có
import SpaServicesPage from './pages/SpaServicesPage';
import SpaServiceDetailPage from './pages/SpaServiceDetailPage';
import SpaBookingPage from './pages/SpaBookingPage';
// Thêm các import
import SpaAppointmentsPage from './pages/SpaAppointmentsPage';
import SpaReviewPage from './pages/SpaReviewPage';

const App = () => {
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
        </Routes>
      </main>
      <Footer />
      <ToastContainer position="top-right" autoClose={3000} />
    </Router>
  );
};

export default App;