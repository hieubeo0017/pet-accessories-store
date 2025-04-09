import axios from 'axios';

// Cấu hình axios
const API_URL = 'http://localhost:3000/api'; // hoặc URL API thực tế của bạn
const api = axios.create({
  baseURL: API_URL
});

// Dữ liệu giả cho Products
const mockProducts = [
  { 
    id: 1, 
    name: 'Thức ăn hạt khô cho chó', 
    price: 250000, 
    description: 'Thức ăn dinh dưỡng dành cho chó mọi lứa tuổi',
    featured: true,
    image: '/assets/images/products/prod1.jpg'
  },
  { 
    id: 2, 
    name: 'Vòng cổ cho mèo', 
    price: 150000, 
    description: 'Vòng cổ chống đi lạc có khắc tên',
    featured: true,
    image: '/assets/images/products/prod2.jpg'
  }
];

// Dữ liệu giả cho Pets
const mockPets = [
  {
    id: 1,
    name: 'Poodle Toy đực',
    type: 'dog',
    breed: 'Poodle',
    age: '2 tháng',
    price: 5500000,
    description: 'Chó Poodle Toy thuần chủng, đã tiêm 2 mũi vaccine, tẩy giun đầy đủ',
    image: '/assets/images/pets/poodle-toy.jpg'
  },
  {
    id: 2,
    name: 'Mèo Anh lông ngắn',
    type: 'cat',
    breed: 'British Shorthair',
    age: '3 tháng',
    price: 3800000,
    description: 'Mèo Anh lông ngắn thuần chủng, màu xám xanh, đã tiêm vaccine, tẩy giun',
    image: '/assets/images/pets/british-shorthair.jpg'
  },
  {
    id: 3,
    name: 'Corgi đực',
    type: 'dog',
    breed: 'Corgi',
    age: '2.5 tháng',
    price: 8500000,
    description: 'Chó Corgi thuần chủng, đã tiêm vaccine, sức khỏe tốt, năng động',
    image: '/assets/images/pets/corgi.jpg'
  },
  {
    id: 4,
    name: 'Mèo Ba Tư',
    type: 'cat',
    breed: 'Persian',
    age: '4 tháng',
    price: 4200000,
    description: 'Mèo Ba Tư thuần chủng, lông dài, đã tiêm vaccine đầy đủ',
    image: '/assets/images/pets/persian.jpg'
  }
];

export const fetchProducts = async () => {
    try {
        // Giả lập độ trễ network
        await new Promise(resolve => setTimeout(resolve, 300));
        return mockProducts;
    } catch (error) {
        console.error('Error fetching products:', error);
        throw error;
    }
};

export const fetchProductById = async (id) => {
    try {
        await new Promise(resolve => setTimeout(resolve, 300));
        const product = mockProducts.find(p => p.id === parseInt(id));
        if (!product) throw new Error('Product not found');
        return product;
    } catch (error) {
        console.error(`Error fetching product with id ${id}:`, error);
        throw error;
    }
};

// Thêm hàm fetchPets cho trang PetsPage
export const fetchPets = async () => {
    try {
        await new Promise(resolve => setTimeout(resolve, 500)); // Giả lập độ trễ
        return mockPets;
    } catch (error) {
        console.error('Error fetching pets:', error);
        throw error;
    }
};

export const fetchPetById = async (id) => {
    try {
        await new Promise(resolve => setTimeout(resolve, 300));
        const pet = mockPets.find(p => p.id === parseInt(id));
        if (!pet) throw new Error('Pet not found');
        return pet;
    } catch (error) {
        console.error(`Error fetching pet with id ${id}:`, error);
        throw error;
    }
};

// Các hàm khác
export const fetchCategories = async () => {
    try {
        await new Promise(resolve => setTimeout(resolve, 300));
        return [
            { id: 1, name: 'Chó cảnh', image: '/images/categories/dogs.jpg' },
            { id: 2, name: 'Mèo cảnh', image: '/images/categories/cats.jpg' },
            { id: 3, name: 'Thức ăn cho chó', image: '/images/categories/dog-food.jpg' },
            { id: 4, name: 'Thức ăn cho mèo', image: '/images/categories/cat-food.jpg' }
        ];
    } catch (error) {
        console.error('Error fetching categories:', error);
        throw error;
    }
};

export const createOrder = async (orderData) => {
    try {
        await new Promise(resolve => setTimeout(resolve, 500));
        return { id: Date.now(), ...orderData, status: 'pending' };
    } catch (error) {
        console.error('Error creating order:', error);
        throw error;
    }
};

export const fetchProductsByCategory = async (categoryId) => {
  try {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockProducts.filter(p => p.categoryId === parseInt(categoryId));
  } catch (error) {
    console.error('Error fetching products by category:', error);
    throw error;
  }
};

export default api;