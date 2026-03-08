import React from 'react';

const ProductCarousel = ({ images }) => {
    return (
        <div className="product-carousel">
            <img src={images?.[0] || 'https://via.placeholder.com/500'} alt="Product" style={{ width: '100%', maxWidth: '500px' }} />
            {/* Carousel navigation logic here */}
        </div>
    );
};

export default ProductCarousel;
