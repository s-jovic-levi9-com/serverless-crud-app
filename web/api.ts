import { Product, CreateProductInput, UpdateProductInput, ListProductsResponse } from '../types';

let API_URL = '';

export async function loadConfig() {
  try {
    const response = await fetch('/config.json');
    const config = await response.json();
    API_URL = config.apiUrl.replace(/\/$/, '');
  } catch (error) {
    console.error('Failed to load config, using default:', error);
    API_URL = 'http://localhost:3000';
  }
}

async function fetchApi(endpoint: string, options?: RequestInit): Promise<any> {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

export async function createProduct(input: CreateProductInput): Promise<Product> {
  return fetchApi('/products', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function getProduct(id: string): Promise<Product> {
  return fetchApi(`/products/${id}`);
}

export async function listProducts(limit?: number, lastKey?: string): Promise<ListProductsResponse> {
  const params = new URLSearchParams();
  if (limit) params.append('limit', limit.toString());
  if (lastKey) params.append('lastKey', lastKey);
  
  const query = params.toString() ? `?${params.toString()}` : '';
  return fetchApi(`/products${query}`);
}

export async function updateProduct(id: string, input: UpdateProductInput): Promise<Product> {
  return fetchApi(`/products/${id}`, {
    method: 'PUT',
    body: JSON.stringify(input),
  });
}

export async function deleteProduct(id: string): Promise<void> {
  return fetchApi(`/products/${id}`, {
    method: 'DELETE',
  });
}
