import React from 'react';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import './ProductDetail.css';

const ProductDetail = () => {
    const { productId } = useParams();
    const product = useSelector((state) => 
        state.products.find((item) => item.id === parseInt(productId))
    );

    if (!product) {
        return <div>Product not found</div>;
    }

    return (
        <div className="product-detail">
            <h1>{product.name}</h1>
            <img src={product.image} alt={product.name} />
            <p>{product.description}</p>
            <p>Price: ${product.price}</p>
            <button>Add to Cart</button>
        </div>
    );
};

export default ProductDetail;