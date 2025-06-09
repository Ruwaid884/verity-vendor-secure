import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/types/database.types';

export class DatabaseConfig {
  private static instance: SupabaseClient<Database>;

  static getInstance(): SupabaseClient<Database> {
    if (!DatabaseConfig.instance) {
      DatabaseConfig.instance = DatabaseConfig.createConnection();
    }
    return DatabaseConfig.instance;
  }

  private static createConnection(): SupabaseClient<Database> {
    // Hardcoded Supabase configuration
    const supabaseUrl = 'https://jzpjjrfbbyuwfgzyhdvl.supabase.co';
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp6cGpqcmZiYnl1d2ZnenloZHZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk0OTgxMTUsImV4cCI6MjA2NTA3NDExNX0.LsA5CJ4nXnEYt4S1xukCZML929I89JY4XI0U4HZ344o';

    return createClient<Database>(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }

  static async testConnection(): Promise<boolean> {
    try {
      const supabase = DatabaseConfig.getInstance();
      const { data: _data, error } = await supabase.from('profiles').select('id').limit(1);
      
      if (error) {
        console.error('Database connection test failed:', error.message);
        return false;
      }

      console.log('✅ Database connection successful');
      return true;
    } catch (error) {
      console.error('Database connection test failed:', error);
      return false;
    }
  }
}