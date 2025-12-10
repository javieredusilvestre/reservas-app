// src/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

// **ATENCIÓN**: Reemplaza estos valores con tu URL y clave de anon Supabase reales
const supabaseUrl = 'https://xjecuuckvepkvfbzaopl.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhqZWN1dWNrdmVwa3ZmYnphb3BsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ5NTE1MjksImV4cCI6MjA4MDUyNzUyOX0.rqhA_vtwRxYibvsl9xjOS-hhKXex8L29Uf3Zx5PsN04';

// Inicializa el cliente
export const supabase = createClient(supabaseUrl, supabaseAnonKey);