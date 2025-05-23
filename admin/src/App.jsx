import { Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';

// Layout components
import AdminLayout from './layouts/AdminLayout';
import Dashboard from './pages/Dashboard';

// Product management
import ProductsPage from './pages/products/ProductsPage';
import AddProductPage from './pages/products/AddProductPage';
import EditProductPage from './pages/products/EditProductPage'; // Sửa từ EditProduct thành EditProductPage

// Pet management
import PetsPage from './pages/pets/PetsPage';
import AddPetPage from './pages/pets/AddPetPage'; // Sửa từ AddPet thành AddPetPage
import EditPetPage from './pages/pets/EditPetPage'; // Sửa từ EditPet thành EditPetPage

// Category management
import CategoriesPage from './pages/categories/CategoriesPage';
import AddCategoryPage from './pages/categories/AddCategoryPage';
import EditCategoryPage from './pages/categories/EditCategoryPage'; // Sửa từ EditCategory thành EditCategoryPage

// Brand management
import BrandsPage from './pages/brands/BrandsPage';
import AddBrandPage from './pages/brands/AddBrandPage';
import EditBrandPage from './pages/brands/EditBrandPage';

// Spa service management
import SpaServicesPage from './pages/spa-services/SpaServicesPage';
import AddSpaServicesPage from './pages/spa-services/AddSpaServicesPage'; // Sửa tên file thành số nhiều
import EditSpaServicesPage from './pages/spa-services/EditSpaServicesPage'; // Cũng kiểm tra tên này nếu cần

// Spa appointment management
import SpaAppointmentsPage from './pages/spa-appointments/SpaAppointmentsPage';
import SpaAppointmentDetailPage from './pages/spa-appointments/SpaAppointmentDetailPage';
import AddSpaAppointmentPage from "./pages/spa-appointments/AddSpaAppointmentPage"; // Thêm import cho trang mới

// Error page
import NotFound from './pages/NotFound';

function App() {
  return (
    <Routes>
      <Route path="/" element={<AdminLayout />}>
        <Route index element={<Dashboard />} />
        
        {/* Product management */}
        <Route path="products">
          <Route index element={<ProductsPage />} />
          <Route path="add" element={<AddProductPage />} />
          <Route path="edit/:id" element={<EditProductPage />} /> {/* Cập nhật component */}
        </Route>
        
        {/* Pet management */}
        <Route path="pets">
          <Route index element={<PetsPage />} />
          <Route path="add" element={<AddPetPage />} /> {/* Cập nhật component */}
          <Route path="edit/:id" element={<EditPetPage />} /> {/* Cập nhật component */}
        </Route>
        
        {/* Category management */}
        <Route path="categories">
          <Route index element={<CategoriesPage />} />
          <Route path="add" element={<AddCategoryPage />} />
          <Route path="edit/:id" element={<EditCategoryPage />} /> {/* Cập nhật component */}
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
          <Route path="add" element={<AddSpaAppointmentPage />} /> {/* Thêm route trong phần <Routes> */}
          <Route path=":id" element={<SpaAppointmentDetailPage />} />
        </Route>
        
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

export default App;