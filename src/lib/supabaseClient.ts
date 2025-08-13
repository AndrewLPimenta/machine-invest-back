import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv';

dotenv.config();

// URL do seu projeto no Supabase
const supabaseUrl = process.env.SUPABASE_URL as string

// Chave secreta (salva no .env)
const supabaseKey = process.env.SUPABASE_KEY as string

// Criar o cliente
export const supabase = createClient(supabaseUrl, supabaseKey)
