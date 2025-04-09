import React, { useEffect, useState } from 'react';
import ProductList from '../components/products/ProductList';
import { fetchProductsByCategory } from '../services/api';

const CategoryPage = ({ match }) => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const categoryId = match.params.categoryId;

    useEffect(() => {
        const getProducts = async () => {
            try {
                const data = await fetchProductsByCategory(categoryId);
                setProducts(data);
            } catch (error) {
                console.error('Error fetching products:', error);
            } finally {
                setLoading(false);
            }
        };

        getProducts();
    }, [categoryId]);

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <h1>Products in Category</h1>
            <ProductList products={products} />
        </div>
    );
};

export default CategoryPage;