import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase URL or Anon Key not found in environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          name: string;
          role: 'admin' | 'manager' | 'employee';
          avatar?: string;
          is_active: boolean;
          salon_id: string;
          salon_name: string;
          last_login?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          name: string;
          role?: 'admin' | 'manager' | 'employee';
          avatar?: string;
          is_active?: boolean;
          salon_id: string;
          salon_name: string;
          last_login?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string;
          role?: 'admin' | 'manager' | 'employee';
          avatar?: string;
          is_active?: boolean;
          salon_id?: string;
          salon_name?: string;
          last_login?: string;
          updated_at?: string;
        };
      };
      products: {
        Row: {
          id_product: string;
          name_product: string;
          brand: string;
          category: string;
          stock: number;
          min_stock: number;
          unit: string;
          unit_price: number;
          expiration_date: string;
          supplier_id: string;
          salon_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id_product?: string;
          name_product: string;
          brand: string;
          category: string;
          stock: number;
          min_stock: number;
          unit: string;
          unit_price: number;
          expiration_date: string;
          supplier_id: string;
          salon_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id_product?: string;
          name_product?: string;
          brand?: string;
          category?: string;
          stock?: number;
          min_stock?: number;
          unit?: string;
          unit_price?: number;
          expiration_date?: string;
          supplier_id?: string;
          salon_id?: string;
          updated_at?: string;
        };
      };
      services: {
        Row: {
          id_service: string;
          name_service: string;
          description: string;
          price: number;
          duration: number;
          category: string;
          products: any;
          labor_rate?: number;
          is_active: boolean;
          salon_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id_service?: string;
          name_service: string;
          description: string;
          price: number;
          duration: number;
          category: string;
          products?: any;
          labor_rate?: number;
          is_active?: boolean;
          salon_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id_service?: string;
          name_service?: string;
          description?: string;
          price?: number;
          duration?: number;
          category?: string;
          products?: any;
          labor_rate?: number;
          is_active?: boolean;
          salon_id?: string;
          updated_at?: string;
        };
      };
      suppliers: {
        Row: {
          id_supplier: string;
          name_supplier: string;
          contact_person: string;
          email: string;
          phone: string;
          address: string;
          products: string[];
          salon_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id_supplier?: string;
          name_supplier: string;
          contact_person: string;
          email: string;
          phone: string;
          address: string;
          products?: string[];
          salon_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id_supplier?: string;
          name_supplier?: string;
          contact_person?: string;
          email?: string;
          phone?: string;
          address?: string;
          products?: string[];
          salon_id?: string;
          updated_at?: string;
        };
      };
    };
  };
}