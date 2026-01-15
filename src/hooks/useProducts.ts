import { useState, useEffect } from 'react';
import { supabase, Product } from '@/lib/supabase';

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastFetch, setLastFetch] = useState<number>(0);

  const fetchProducts = async (force = false) => {
    // Performance: Skip refetch if data is fresh (less than 30 seconds old)
    const now = Date.now();
    if (!force && lastFetch && (now - lastFetch) < 30000) {
      if (import.meta.env.DEV) {
        console.log('Using cached products, skipping refetch');
      }
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Performance: Select only needed fields, limit initial load
      const { data, error } = await supabase
        .from('products')
        .select('id, name, description, price, category, stock, status, image_urls, custom_fields, created_at')
        .order('created_at', { ascending: false })
        .limit(100); // Limit to 100 products for better performance

      if (error) throw error;
      setProducts(data || []);
      setLastFetch(now);
    } catch (err) {
      if (import.meta.env.DEV) {
        console.error('Error fetching products:', err);
      }
      setError(err instanceof Error ? err.message : 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();

    // Performance: Subscribe to real-time changes with proper cleanup
    const subscription = supabase
      .channel('products-changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'products' 
      }, (payload) => {
        // Performance: Update state directly instead of refetching all products
        if (payload.eventType === 'INSERT') {
          setProducts(prev => [payload.new as Product, ...prev]);
        } else if (payload.eventType === 'UPDATE') {
          setProducts(prev => prev.map(p => p.id === payload.new.id ? payload.new as Product : p));
        } else if (payload.eventType === 'DELETE') {
          setProducts(prev => prev.filter(p => p.id !== payload.old.id));
        }
        
        if (import.meta.env.DEV) {
          console.log('Product change detected:', payload.eventType);
        }
      })
      .subscribe();

    return () => {
      // Performance: Proper cleanup to prevent memory leaks
      supabase.removeChannel(subscription);
    };
  }, []);

  return { products, loading, error, refetch: () => fetchProducts(true) };
}

export function useProduct(id: string) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        setProduct(data);
      } catch (err) {
        console.error('Error fetching product:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch product');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  return { product, loading, error };
}