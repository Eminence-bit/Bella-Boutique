import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Security: Only log in development, never expose actual values
if (import.meta.env.DEV) {
  console.log('Supabase configuration check:', {
    hasUrl: !!supabaseUrl,
    hasKey: !!supabaseAnonKey,
  });
}

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Check your .env file.');
}

// Security: Configure client with security options
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce', // Use PKCE flow for better security
  },
  global: {
    headers: {
      'X-Client-Info': 'bella-boutique-web',
    },
  },
});

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