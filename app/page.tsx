'use client';

import { useState, useEffect, useRef, ChangeEvent } from 'react';
import type { Product } from './api/products/route';

const CATEGORIES = ['All', 'Electronics', 'Clothing', 'Books', 'Home', 'Beauty'];
const LIMIT = 12;

export default function ProductCatalog() {
  const [products, setProducts] = useState<Product[]>([]);
  const [category, setCategory] = useState('All');
  const [cursor, setCursor] = useState<string | null>(null);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const triggerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let active = true;

    async function fetchProducts() {
      setIsLoading(true);
      try {
        let url = `/api/products?limit=${LIMIT}`;
        if (category !== 'All') url += `&category=${encodeURIComponent(category)}`;
        if (cursor) url += `&cursor=${encodeURIComponent(cursor)}`;

        const res = await fetch(url);
        if (!res.ok) throw new Error('API fetch failed');
        const data = await res.json();

        if (active) {
          setProducts(prev => {
            if (!cursor) return data.products;
            const seen = new Set(prev.map(p => p.id));
            return [...prev, ...data.products.filter((p: Product) => !seen.has(p.id))];
          });
          setNextCursor(data.nextCursor);
          setHasMore(data.hasMore);
        }
      } catch (error) {
        console.error('Failed to fetch products:', error);
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    fetchProducts();
    return () => {
      active = false;
    };
  }, [category, cursor]);

  const handleCategoryChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setCategory(e.target.value);
    setProducts([]);
    setCursor(null);
    setNextCursor(null);
    setHasMore(true);
  };

  useEffect(() => {
    if (isLoading || !hasMore) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry?.isIntersecting && nextCursor) {
        setCursor(nextCursor);
      }
    }, { threshold: 0.1 });

    const currentTrigger = triggerRef.current;
    if (currentTrigger) observer.observe(currentTrigger);

    return () => {
      if (currentTrigger) observer.unobserve(currentTrigger);
    };
  }, [isLoading, hasMore, nextCursor]);

  return (
    <div className="container">
      <header className="header-nav">
        <div className="brand-title">FastCart Dashboard</div>
      </header>

      <div className="filter-container">
        <span className="filter-label">Showing Catalog Products</span>
        <select 
          className="select-dropdown" 
          value={category} 
          onChange={handleCategoryChange}
          aria-label="Filter by Category"
        >
          {CATEGORIES.map(cat => (
            <option key={cat} value={cat}>
              {cat === 'All' ? 'All Categories' : cat}
            </option>
          ))}
        </select>
      </div>

      <main className="product-grid">
        {products.map((product) => (
          <div key={product.id} className="product-card">
            <div className="product-card-top">
              <span className="product-category-badge">{product.category}</span>
              <h2 className="product-title">{product.name}</h2>
            </div>
            <div className="product-card-bottom">
              <span className="product-price">${parseFloat(product.price.toString()).toFixed(2)}</span>
              <span className="product-date">
                {new Date(product.created_at).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </span>
            </div>
          </div>
        ))}

        {products.length === 0 && isLoading && Array.from({ length: LIMIT }).map((_, i) => (
          <div key={`skeleton-${i}`} className="skeleton-card pulse">
            <div className="product-card-top">
              <div className="skeleton-badge"></div>
              <div className="skeleton-text" style={{ width: '80%', marginTop: '8px' }}></div>
              <div className="skeleton-text" style={{ width: '60%', marginTop: '8px' }}></div>
            </div>
            <div className="product-card-bottom">
              <div className="skeleton-price"></div>
              <div className="skeleton-date"></div>
            </div>
          </div>
        ))}
      </main>

      {!isLoading && products.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#64748D' }}>
          No products found in this category.
        </div>
      )}

      <div ref={triggerRef} className="scroll-trigger">
        {isLoading && products.length > 0 && (
          <div className="loading-indicator">
            <div className="spinner"></div>
            <span>Loading items...</span>
          </div>
        )}
        {!hasMore && products.length > 0 && (
          <span>No more products to load</span>
        )}
      </div>
    </div>
  );
}
