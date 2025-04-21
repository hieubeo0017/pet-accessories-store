import React, {useEffect} from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
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
    </Router>
  );
};

export default App;