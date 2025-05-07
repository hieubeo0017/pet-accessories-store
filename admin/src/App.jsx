import { Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';

// Layout components
import AdminLayout from './layouts/AdminLayout';
import Dashboard from './pages/Dashboard';

// Product management
import ProductsPage from './pages/products/ProductsPage';
import AddProductPage from './pages/products/AddProductPage';
import EditProductPage from './pages/products/EditProductPage';

// Pet management
import PetsPage from './pages/pets/PetsPage';
import AddPetPage from './pages/pets/AddPetPage';
import EditPetPage from './pages/pets/EditPetPage';

// Category management
import CategoriesPage from './pages/categories/CategoriesPage';
import AddCategoryPage from './pages/categories/AddCategoryPage';
import EditCategoryPage from './pages/categories/EditCategoryPage';

// Brand management
import BrandsPage from './pages/brands/BrandsPage';
import AddBrandPage from './pages/brands/AddBrandPage';
import EditBrandPage from './pages/brands/EditBrandPage';

// Spa service management
import SpaServicesPage from './pages/spa-services/SpaServicesPage';
import AddSpaServicesPage from './pages/spa-services/AddSpaServicesPage';
import EditSpaServicesPage from './pages/spa-services/EditSpaServicesPage';

// Spa appointment management
import SpaAppointmentsPage from './pages/spa-appointments/SpaAppointmentsPage';
import SpaAppointmentDetailPage from './pages/spa-appointments/SpaAppointmentDetailPage';
import AddSpaAppointmentPage from "./pages/spa-appointments/AddSpaAppointmentPage";
import EditSpaAppointmentPage from './pages/spa-appointments/EditSpaAppointmentPage';

// Spa time slots management
import SpaTimeSlotsPage from './pages/spa-time-slots/SpaTimeSlotsPage';

// Error page
import NotFound from './pages/NotFound';
import BlogsPage from "./pages/blogs/BlogsPage";
import AddBlogPage from "./pages/blogs/AddBlogPage";
import EditBlogPage from "./pages/blogs/EditBlogPage";
import UsersPage from "./pages/users/UsersPage";
import AddUserPage from "./pages/users/AddUserPage";
import EditUserPage from "./pages/users/EditUserPage";
import ReviewsPage from "./pages/reviews/ReviewsPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<AdminLayout />}>
        <Route index element={<Dashboard />} />

        {/* Product management */}
        <Route path="products">
          <Route index element={<ProductsPage />} />
          <Route path="add" element={<AddProductPage />} />
          <Route path="edit/:id" element={<EditProductPage />} />
        </Route>

        {/* Pet management */}
        <Route path="pets">
          <Route index element={<PetsPage />} />
          <Route path="add" element={<AddPetPage />} />
          <Route path="edit/:id" element={<EditPetPage />} />
        </Route>

        {/* Category management */}
        <Route path="categories">
          <Route index element={<CategoriesPage />} />
          <Route path="add" element={<AddCategoryPage />} />
          <Route path="edit/:id" element={<EditCategoryPage />} />
        </Route>

        {/* Brand management */}
        <Route path="brands">
          <Route index element={<BrandsPage />} />
          <Route path="add" element={<AddBrandPage />} />
          <Route path="edit/:id" element={<EditBrandPage />} />
        </Route>

        {/* Spa service management */}
        <Route path="spa-services">
          <Route index element={<SpaServicesPage />} />
          <Route path="add" element={<AddSpaServicesPage />} />
          <Route path="edit/:id" element={<EditSpaServicesPage />} />
        </Route>

        {/* Spa appointment management */}
        <Route path="spa-appointments">
          <Route index element={<SpaAppointmentsPage />} />
          <Route path="add" element={<AddSpaAppointmentPage />} />
          <Route path=":id" element={<SpaAppointmentDetailPage />} />
          <Route path="edit/:id" element={<EditSpaAppointmentPage />} />
        </Route>

        {/* Spa time slots management */}
        <Route path="spa-time-slots">
          <Route index element={<SpaTimeSlotsPage />} />
        </Route>

        <Route path="blogs">
          <Route index element={<BlogsPage />} />
          <Route path="add" element={<AddBlogPage />} />
          <Route path="edit/:id" element={<EditBlogPage />} />
        </Route>

        <Route path="users">
          <Route index element={<UsersPage />} />
          <Route path="add" element={<AddUserPage />} />
          <Route path="edit/:id" element={<EditUserPage />} />
        </Route>

        <Route path="reviews">
          <Route index element={<ReviewsPage />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

export default App;