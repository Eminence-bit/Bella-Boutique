import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log('Supabase env check:', {
  hasUrl: !!supabaseUrl,
  hasKey: !!supabaseAnonKey,
  urlLength: supabaseUrl?.length,
  keyLength: supabaseAnonKey?.length
});

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Environment variables missing. loaded:', import.meta.env);
  throw new Error('Missing Supabase environment variables. Check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types for our database schema
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  status: 'Available' | 'Sold Out';
  image_urls: string[];
  custom_fields: Record<string, any>;
  created_at: string;
}

export interface Customer {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  total_balance: number;
  created_at: string;
}

export interface Sale {
  id: string;
  product_id: string;
  customer_id?: string;
  buyer_name: string | null;
  total_amount: number;
  amount_paid: number;
  balance_due: number;
  payment_status: 'Paid' | 'Partial' | 'Pending';
  date: string;
}

export interface Profile {
  id: string;
  role: 'user' | 'admin';
  created_at: string;
}