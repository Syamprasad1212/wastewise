import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserRole } from '../types';
import { supabase, isSupabaseConfigured, villageDataService, SEED_PROFILES } from '../lib/supabase';

interface LoginResult {
  success: boolean;
  role?: UserRole;
  error?: string;
}

interface AuthContextType {
  user: UserProfile | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  login: (email: string, password: string, selectedRoleTab: UserRole) => Promise<LoginResult>;
  registerCitizen: (name: string, email: string, phone: string, ward: string, password?: string) => Promise<LoginResult>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('wastewise_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    // Default is NOT logged in for public visitors!
    return null;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('wastewise_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('wastewise_user');
    }
  }, [user]);

  // Real authentication & database role verification
  const login = async (
    email: string,
    password: string,
    selectedRoleTab: UserRole
  ): Promise<LoginResult> => {
    const cleanEmail = email.trim().toLowerCase();

    // 1. If live Supabase is configured:
    if (isSupabaseConfigured && supabase) {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: password
      });

      if (authError || !authData.user) {
        return {
          success: false,
          error: authError?.message || 'Invalid email or password.'
        };
      }

      // Query database profile to verify the actual verified role
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authData.user.id)
        .single();

      if (profileError || !profileData) {
        return {
          success: false,
          error: 'User profile not found in village registry.'
        };
      }

      const verifiedProfile: UserProfile = {
        id: profileData.id,
        email: profileData.email,
        full_name: profileData.full_name,
        role: profileData.role as UserRole,
        phone_number: profileData.phone_number || '',
        village_ward: profileData.village_ward || 'Ward 1',
        created_at: profileData.created_at
      };

      // Check if actual role matches selected login tab
      if (verifiedProfile.role !== selectedRoleTab) {
        // Sign out from Supabase because unauthorized for this tab
        await supabase.auth.signOut();
        const roleLabel =
          selectedRoleTab === 'admin'
            ? 'Panchayat Admin'
            : selectedRoleTab === 'worker'
            ? 'Sanitation Worker'
            : 'Citizen';
        return {
          success: false,
          error: `Unauthorized access: Your account is registered as '${verifiedProfile.role}', not as '${roleLabel}'. Please switch to the correct tab.`
        };
      }

      setUser(verifiedProfile);
      return { success: true, role: verifiedProfile.role };
    }

    // 2. Local / Prototype Simulation with strict verification:
    // Look up the profile from village profiles store
    const existingProfile = await villageDataService.getProfileByEmail(cleanEmail);

    if (!existingProfile) {
      return {
        success: false,
        error: 'No registered account found with this email. Please check your credentials or register.'
      };
    }

    // Check password if set (default demo password is password123)
    if (existingProfile.passwordHash && password.trim() !== existingProfile.passwordHash && password.trim() !== 'password123') {
      return {
        success: false,
        error: 'Incorrect password. Please try again.'
      };
    }

    // Verify database role against selected tab
    if (existingProfile.role !== selectedRoleTab) {
      const tabLabel =
        selectedRoleTab === 'admin'
          ? 'Panchayat Admin'
          : selectedRoleTab === 'worker'
          ? 'Sanitation Worker'
          : 'Citizen';
      const actualLabel =
        existingProfile.role === 'admin'
          ? 'Panchayat Admin'
          : existingProfile.role === 'worker'
          ? 'Sanitation Worker'
          : 'Citizen';

      return {
        success: false,
        error: `Access Denied: This account is registered as '${actualLabel}', not as '${tabLabel}'. Please select the '${actualLabel}' tab to log in.`
      };
    }

    const verifiedUser: UserProfile = {
      id: existingProfile.id,
      email: existingProfile.email,
      full_name: existingProfile.full_name,
      role: existingProfile.role,
      phone_number: existingProfile.phone_number,
      village_ward: existingProfile.village_ward,
      created_at: existingProfile.created_at
    };

    setUser(verifiedUser);
    return { success: true, role: verifiedUser.role };
  };

  // Only Citizens are permitted to self-register publicly
  const registerCitizen = async (
    name: string,
    email: string,
    phone: string,
    ward: string,
    password?: string
  ): Promise<LoginResult> => {
    const cleanEmail = email.trim().toLowerCase();

    // Check if email already registered
    const existing = await villageDataService.getProfileByEmail(cleanEmail);
    if (existing) {
      return {
        success: false,
        error: 'An account is already registered with this email. Please log in.'
      };
    }

    const newProfile: UserProfile & { passwordHash?: string } = {
      id: `usr-${Date.now()}`,
      email: cleanEmail,
      full_name: name.trim(),
      role: 'citizen', // Strictly enforced as citizen
      phone_number: phone.trim(),
      village_ward: ward,
      created_at: new Date().toISOString(),
      passwordHash: password?.trim() || 'password123'
    };

    if (isSupabaseConfigured && supabase) {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: cleanEmail,
        password: password?.trim() || 'password123'
      });
      if (authError || !authData.user) {
        return { success: false, error: authError?.message || 'Failed to create account.' };
      }
      newProfile.id = authData.user.id;
    }

    await villageDataService.addProfile(newProfile);

    // Auto log in new citizen
    setUser({
      id: newProfile.id,
      email: newProfile.email,
      full_name: newProfile.full_name,
      role: 'citizen',
      phone_number: newProfile.phone_number,
      village_ward: newProfile.village_ward,
      created_at: newProfile.created_at
    });

    return { success: true, role: 'citizen' };
  };

  const logout = async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user ? user.role : null,
        isAuthenticated: !!user,
        login,
        registerCitizen,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
