import { createClient, SupabaseClient, User, Session } from '@supabase/supabase-js';
import { Database } from '../types/database.types';

interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'vendor' | 'approver';
  company_id?: string;
  created_at?: string;
  updated_at?: string;
}

interface AuthResult {
  user?: User | null;
  session?: Session | null;
  profile?: Profile | null;
  error?: { message: string };
}

export class AuthService {
  private supabase: SupabaseClient<Database>;
  private serviceSupabase: SupabaseClient<Database>;

  constructor() {
    const supabaseUrl = 'https://jzpjjrfbbyuwfgzyhdvl.supabase.co';
    const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp6cGpqcmZiYnl1d2ZnenloZHZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk0OTgxMTUsImV4cCI6MjA2NTA3NDExNX0.LsA5CJ4nXnEYt4S1xukCZML929I89JY4XI0U4HZ344o';
    
    // For auth operations
    this.supabase = createClient<Database>(supabaseUrl, anonKey);
    
    // For direct database operations  
    this.serviceSupabase = createClient<Database>(supabaseUrl, anonKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }

  async signUp(email: string, password: string, fullName: string, role: string): Promise<AuthResult> {
    try {
      // Create user WITHOUT metadata to avoid trigger issues
      const { data, error: authError } = await this.supabase.auth.signUp({
        email,
        password
        // No options.data to avoid triggering the problematic function
      });

      if (authError) {
        return { error: { message: authError.message } };
      }

      if (!data.user) {
        return { error: { message: 'User creation failed' } };
      }

      // Create profile manually 
      const profile = await this.createProfile(data.user, fullName, role as 'admin' | 'vendor' | 'approver');

      if (!profile) {
        return { error: { message: 'Profile creation failed' } };
      }

      // If admin, create company
      if (role === 'admin') {
        await this.createCompanyForAdmin(data.user.id, fullName, profile);
      }

      return {
        user: data.user,
        session: data.session,
        profile: profile
      };
    } catch (error) {
      console.error('AuthService signup error:', error);
      return { error: { message: 'Internal authentication error' } };
    }
  }

  async signIn(email: string, password: string): Promise<AuthResult> {
    try {
      const { data, error: authError } = await this.supabase.auth.signInWithPassword({
        email,
        password
      });

      if (authError) {
        return { error: { message: authError.message } };
      }

      if (!data.user) {
        return { error: { message: 'Login failed' } };
      }

      // Get user profile
      const profile = await this.getProfileById(data.user.id);

      return {
        user: data.user,
        session: data.session,
        profile: profile
      };
    } catch (error) {
      console.error('AuthService signin error:', error);
      return { error: { message: 'Internal authentication error' } };
    }
  }

  async signOut(accessToken: string): Promise<void> {
    try {
      await this.supabase.auth.signOut();
    } catch (error) {
      console.error('AuthService signout error:', error);
      throw error;
    }
  }

  async getProfile(accessToken: string): Promise<AuthResult> {
    try {
      // Get user from token
      const { data: { user }, error: userError } = await this.supabase.auth.getUser(accessToken);

      if (userError || !user) {
        return { error: { message: 'Invalid token' } };
      }

      // Get profile
      const profile = await this.getProfileById(user.id);

      return {
        user,
        profile: profile
      };
    } catch (error) {
      console.error('AuthService getProfile error:', error);
      return { error: { message: 'Internal authentication error' } };
    }
  }

  async refreshSession(refreshToken: string): Promise<AuthResult> {
    try {
      const { data, error } = await this.supabase.auth.refreshSession({
        refresh_token: refreshToken
      });

      if (error) {
        return { error: { message: error.message } };
      }

      return {
        session: data.session
      };
    } catch (error) {
      console.error('AuthService refreshSession error:', error);
      return { error: { message: 'Internal authentication error' } };
    }
  }

  private async createProfile(user: User, fullName: string, role: 'admin' | 'vendor' | 'approver'): Promise<Profile | null> {
    try {
      // Use the new database function for robust profile creation
      const { data, error } = await this.serviceSupabase
        .rpc('create_user_profile', {
          user_id: user.id,
          user_email: user.email!,
          full_name: fullName,
          user_role: role
        });

      if (error) {
        console.error('Profile creation error:', error);
        
        // Fallback to manual creation if function fails
        const profileData = {
          id: user.id,
          email: user.email!,
          full_name: fullName,
          role,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        const { data: fallbackData, error: fallbackError } = await this.serviceSupabase
          .from('profiles')
          .upsert(profileData, { onConflict: 'id' })
          .select()
          .single();

        if (fallbackError) {
          console.error('Fallback profile creation error:', fallbackError);
          return null;
        }

        return fallbackData;
      }

      return data;
    } catch (error) {
      console.error('Profile creation error:', error);
      return null;
    }
  }

  private async getProfileById(userId: string): Promise<Profile | null> {
    try {
      // Use the new helper function for complete profile data
      const { data, error } = await this.serviceSupabase
        .rpc('get_user_profile', { user_id: userId });

      if (error) {
        console.error('Profile fetch error:', error);
        
        // Fallback to direct query
        const { data: fallbackData, error: fallbackError } = await this.serviceSupabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();

        if (fallbackError) {
          console.error('Fallback profile fetch error:', fallbackError);
          return null;
        }

        return fallbackData;
      }

      // Extract profile from the JSON response
      return data?.profile || null;
    } catch (error) {
      console.error('Profile fetch error:', error);
      return null;
    }
  }

  private async createCompanyForAdmin(userId: string, fullName: string, profile: Profile): Promise<void> {
    // This is now handled by the create_user_profile function
    // But we keep this method for backwards compatibility and manual company creation
    try {
      if (profile.company_id) {
        // Company already created by the function
        return;
      }

      const companyName = `${fullName}'s Company`;
      
      const { data: company, error: companyError } = await this.serviceSupabase
        .from('companies')
        .insert([{
          name: companyName,
          admin_user_id: userId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }])
        .select()
        .single();

      if (companyError) {
        console.error('Company creation error:', companyError);
        return;
      }

      // Update user profile with company_id
      await this.serviceSupabase
        .from('profiles')
        .update({ 
          company_id: company.id,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);

    } catch (error) {
      console.error('Error creating company for admin:', error);
    }
  }
} 