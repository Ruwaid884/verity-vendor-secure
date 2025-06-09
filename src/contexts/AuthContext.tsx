import React, { createContext, useContext, useEffect, useState } from 'react';
import { ApiService } from '@/lib/api';

interface User {
  id: string;
  email?: string;
  user_metadata?: any;
}

interface Session {
  access_token: string;
  refresh_token: string;
  user: User;
}

interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'vendor' | 'approver';
  company_id?: string;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string, role: string) => Promise<{ error?: any }>;
  signIn: (email: string, password: string) => Promise<{ error?: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const apiService = ApiService.getInstance();

  // Check for existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        const storedSession = localStorage.getItem('auth_session');
        if (storedSession) {
          const sessionData = JSON.parse(storedSession);
          
          // Verify the session is still valid by fetching profile
          const result = await apiService.getProfile(sessionData.access_token);
          
          if (result.success) {
            setSession(sessionData);
            setUser(result.data.user);
            setProfile(result.data.profile);
          } else {
            // Session invalid, clear it
            localStorage.removeItem('auth_session');
          }
        }
      } catch (error) {
        console.error('Session check failed:', error);
        localStorage.removeItem('auth_session');
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, []);

  const signUp = async (email: string, password: string, fullName: string, role: string) => {
    try {
      setLoading(true);
      const result = await apiService.signup(email, password, fullName, role);

      if (result.success) {
        const sessionData = {
          access_token: result.data.session.access_token,
          refresh_token: result.data.session.refresh_token,
          user: result.data.user
        };

        setUser(result.data.user);
        setProfile(result.data.profile);
        setSession(sessionData);
        
        // Store session in localStorage
        localStorage.setItem('auth_session', JSON.stringify(sessionData));

        return { error: null };
      } else {
        return { error: { message: result.message || 'Signup failed' } };
      }
    } catch (error: any) {
      console.error('Signup error:', error);
      return { error: { message: error.message || 'Signup failed' } };
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const result = await apiService.login(email, password);

      if (result.success) {
        const sessionData = {
          access_token: result.data.session.access_token,
          refresh_token: result.data.session.refresh_token,
          user: result.data.user
        };

        setUser(result.data.user);
        setProfile(result.data.profile);
        setSession(sessionData);
        
        // Store session in localStorage
        localStorage.setItem('auth_session', JSON.stringify(sessionData));

        return { error: null };
      } else {
        return { error: { message: result.message || 'Login failed' } };
      }
    } catch (error: any) {
      console.error('Login error:', error);
      return { error: { message: error.message || 'Login failed' } };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      if (session?.access_token) {
        await apiService.logout(session.access_token);
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local state regardless of API call success
      setUser(null);
      setProfile(null);
      setSession(null);
      localStorage.removeItem('auth_session');
    }
  };

  const value: AuthContextType = {
    user,
    profile,
    session,
    loading,
    signUp,
    signIn,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
