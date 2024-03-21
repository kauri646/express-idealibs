import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

config({ path: '.env' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function saveUserToDatabase(user) {
  try {
    const { data, error } = await supabase
      .from('users')
      .insert([
        {
          google_id: user.id,
          name: user.name,
          email: user.email
          // Tambahkan kolom lain yang ingin Anda simpan
        }
      ]);
    if (error) {
      throw error;
    }
    console.log('User successfully saved to the database:', data);
    return data;
  } catch (error) {
    console.error('Error saving user to the database:', error.message);
    throw error;
  }
}

export { supabase, saveUserToDatabase };
