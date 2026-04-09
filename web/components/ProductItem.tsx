import React from 'react';
import { Product } from '../../types';

interface ProductItemProps {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
}

const ProductItem: React.FC<ProductItemProps> = ({ product, onEdit, onDelete }) => {
  return (
    <div className="product-item">
      {product.imageUrl && (
        <img src={product.imageUrl} alt={product.name} className="product-image" />
      )}
      <div className="product-content">
        <h3>{product.name}</h3>
        <p className="product-category">{product.category}</p>
        <p className="product-description">{product.description}</p>
        <p className="product-price">${product.price.toFixed(2)}</p>
        <div className="product-actions">
          <button onClick={() => onEdit(product)} className="btn btn-edit">
            Edit
          </button>
          <button onClick={() => onDelete(product.id)} className="btn btn-delete">
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductItem;
