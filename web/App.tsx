import React, { useState, useEffect } from 'react';
import { Product, CreateProductInput } from '../types';
import * as api from './api';
import ProductList from './components/ProductList';
import ProductForm from './components/ProductForm';

type View = 'list' | 'form';

const App: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<View>('list');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    await api.loadConfig();
    await fetchProducts();
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.listProducts();
      setProducts(response.products);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load products');
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingProduct(null);
    setView('form');
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setView('form');
  };

  const handleSubmit = async (input: CreateProductInput) => {
    try {
      setError(null);
      if (editingProduct) {
        await api.updateProduct(editingProduct.id, input);
      } else {
        await api.createProduct(input);
      }
      await fetchProducts();
      setView('list');
      setEditingProduct(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save product');
      console.error('Error saving product:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return;
    }

    try {
      setError(null);
      await api.deleteProduct(id);
      await fetchProducts();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete product');
      console.error('Error deleting product:', err);
    }
  };

  const handleCancel = () => {
    setView('list');
    setEditingProduct(null);
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Products Manager</h1>
        {view === 'list' && (
          <button onClick={handleCreate} className="btn btn-primary">
            Create Product
          </button>
        )}
      </header>

      <main className="app-main">
        {error && (
          <div className="error-message">
            <strong>Error:</strong> {error}
            <button onClick={() => setError(null)} className="error-close">
              ×
            </button>
          </div>
        )}

        {view === 'list' ? (
          <ProductList
            products={products}
            loading={loading}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ) : (
          <ProductForm
            product={editingProduct}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
          />
        )}
      </main>
    </div>
  );
};

export default App;
