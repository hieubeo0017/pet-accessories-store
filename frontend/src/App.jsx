import React from 'react';
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
import BlogPage from './pages/BlogPage';
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
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/blog" element={<BlogPage />} />
        </Routes>
      </main>
      <Footer />
    </Router>
  );
};

export default App;