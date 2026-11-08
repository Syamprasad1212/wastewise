import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserRole } from '../types';

interface AuthContextType {
  user: UserProfile | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  login: (email: string, role: UserRole, name?: string, ward?: string) => Promise<void>;
  register: (name: string, email: string, phone: string, role: UserRole, ward: string) => Promise<void>;
  logout: () => void;
  switchRole: (role: UserRole) => void;
}

const DEFAULT_USERS: Record<UserRole, UserProfile> = {
  citizen: {
    id: 'cit-1',
    email: 'citizen@gramapanchayat.in',
    full_name: 'Ramesh Reddy (గ్రామస్థుడు)',
    role: 'citizen',
    phone_number: '9848022331',
    village_ward: 'Ward 1',
    created_at: '2026-01-01T00:00:00Z'
  },
  admin: {
    id: 'admin-1',
    email: 'sarpanch@gramapanchayat.in',
    full_name: 'Dr. V. Prasad (Panchayat Secretary / సర్పంచ్)',
    role: 'admin',
    phone_number: '9848011220',
    village_ward: 'Central Panchayat Office',
    created_at: '2026-01-01T00:00:00Z'
  },
  worker: {
    id: 'worker-1',
    email: 'mallesh@gramapanchayat.in',
    full_name: 'Mallesh (Sanitation Worker / పారిశుద్ధ్య మిత్ర)',
    role: 'worker',
    phone_number: '9848099887',
    village_ward: 'Ward 1 & 2',
    created_at: '2026-01-01T00:00:00Z'
  }
};

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
    // Default to citizen for instant out-of-the-box experience
    return DEFAULT_USERS.citizen;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('wastewise_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('wastewise_user');
    }
  }, [user]);

  const login = async (email: string, role: UserRole, name?: string, ward?: string) => {
    const newUser: UserProfile = {
      id: `usr-${Date.now()}`,
      email,
      full_name: name || (role === 'admin' ? 'Panchayat Admin' : role === 'worker' ? 'Sanitation Worker' : 'Citizen'),
      role,
      phone_number: '9848000000',
      village_ward: ward || 'Ward 1',
      created_at: new Date().toISOString()
    };
    setUser(newUser);
  };

  const register = async (name: string, email: string, phone: string, role: UserRole, ward: string) => {
    const newUser: UserProfile = {
      id: `usr-${Date.now()}`,
      email,
      full_name: name,
      role,
      phone_number: phone,
      village_ward: ward,
      created_at: new Date().toISOString()
    };
    setUser(newUser);
  };

  const logout = () => {
    setUser(null);
  };

  const switchRole = (newRole: UserRole) => {
    setUser(DEFAULT_USERS[newRole]);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user ? user.role : null,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        switchRole
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
