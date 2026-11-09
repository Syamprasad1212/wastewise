import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserRole } from '../types';
import { supabase, isSupabaseConfigured, villageDataService, SEED_PROFILES } from '../lib/supabase';

export interface LoginResult {
  success: boolean;
  role?: UserRole;
  error?: string;
  requiresEmailConfirmation?: boolean;
  message?: string;
}

export interface AuthNotice {
  type: 'success' | 'error';
  message: string;
}

interface AuthContextType {
  user: UserProfile | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  isProduction: boolean;
  isLoading: boolean;
  authNotice: AuthNotice | null;
  clearAuthNotice: () => void;
  login: (email: string, password: string, selectedRoleTab: UserRole) => Promise<LoginResult>;
  registerCitizen: (name: string, email: string, phone: string, ward: string, password: string) => Promise<LoginResult>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper to extract authentication parameters and errors from URL hash or query string
function parseAuthUrlParams(): {
  error?: string;
  errorCode?: string;
  errorDescription?: string;
  type?: string;
  code?: string;
} {
  const result: {
    error?: string;
    errorCode?: string;
    errorDescription?: string;
    type?: string;
    code?: string;
  } = {};

  if (typeof window === 'undefined') return result;

  // 1. Search parameters (?error=... or ?code=...)
  if (window.location.search) {
    const searchParams = new URLSearchParams(window.location.search);
    if (searchParams.get('error')) result.error = searchParams.get('error')!;
    if (searchParams.get('error_code')) result.errorCode = searchParams.get('error_code')!;
    if (searchParams.get('error_description')) result.errorDescription = searchParams.get('error_description')!;
    if (searchParams.get('type')) result.type = searchParams.get('type')!;
    if (searchParams.get('code')) result.code = searchParams.get('code')!;
  }

  // 2. Hash fragment (#error=... or #access_token=...&type=signup)
  if (window.location.hash && window.location.hash.startsWith('#')) {
    const hashParams = new URLSearchParams(window.location.hash.slice(1));
    if (hashParams.get('error')) result.error = hashParams.get('error')!;
    if (hashParams.get('error_code')) result.errorCode = hashParams.get('error_code')!;
    if (hashParams.get('error_description')) result.errorDescription = hashParams.get('error_description')!;
    if (hashParams.get('type')) result.type = hashParams.get('type')!;
  }

  return result;
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoading] = useState<boolean>(isSupabaseConfigured);
  const [authNotice, setAuthNotice] = useState<AuthNotice | null>(null);

  const clearAuthNotice = () => setAuthNotice(null);
  const [user, setUser] = useState<UserProfile | null>(() => {
    // In demo mode only, check localStorage
    if (!isSupabaseConfigured) {
      const saved = localStorage.getItem('wastewise_demo_user');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          return null;
        }
      }
    }
    return null;
  });

  // Keep demo user stored in separate demo key
  useEffect(() => {
    if (!isSupabaseConfigured) {
      if (user) {
        localStorage.setItem('wastewise_demo_user', JSON.stringify(user));
      } else {
        localStorage.removeItem('wastewise_demo_user');
      }
    }
  }, [user]);

  // Synchronize with active Supabase session in Production Mode
  useEffect(() => {
    const client = supabase;
    if (!isSupabaseConfigured || !client) {
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    // Helper to safely fetch and verify trusted profile record from database
    const loadAndVerifyProfile = async (userId: string) => {
      try {
        let { data: profile, error: profErr } = await client
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .maybeSingle();

        // Retry once after 600ms if profile is still propagating from the auth trigger
        if ((!profile || profErr) && isMounted) {
          await new Promise((r) => setTimeout(r, 600));
          const retry = await client
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .maybeSingle();
          profile = retry.data;
          profErr = retry.error;
        }

        if (!isMounted) return;

        // A missing profile or database error MUST NEVER grant dashboard access
        if (profErr || !profile || !profile.role) {
          console.warn('Profile lookup failed or missing. Revoking session access.');
          setUser(null);
          try {
            await client.auth.signOut();
          } catch {
            // Ignore signout error
          }
          return;
        }

        setUser({
          id: profile.id,
          email: profile.email,
          full_name: profile.full_name,
          role: profile.role as UserRole,
          phone_number: profile.phone_number || '',
          village_ward: profile.village_ward || 'Ward 1',
          created_at: profile.created_at
        });
      } catch (err) {
        console.error('Fatal error verifying profile:', err);
        if (isMounted) {
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    // Check for authentication callback parameters or errors in URL (hash or query)
    const urlParams = parseAuthUrlParams();

    // 1. Handle errors returned by Supabase verification link
    if (urlParams.error || urlParams.errorDescription) {
      let friendlyMsg = urlParams.errorDescription
        ? decodeURIComponent(urlParams.errorDescription.replace(/\+/g, ' '))
        : 'Authentication verification failed.';

      if (urlParams.errorCode === 'otp_expired' || friendlyMsg.toLowerCase().includes('expired')) {
        friendlyMsg = 'This verification link has expired or has already been used. Please log in or request a new confirmation email.';
      } else if (friendlyMsg.toLowerCase().includes('redirect_uri') || friendlyMsg.toLowerCase().includes('not allowed')) {
        friendlyMsg = 'Redirect URL configuration error in Supabase: Please ensure http://localhost:5173/** is added to Supabase Dashboard -> Authentication -> URL Configuration -> Redirect URLs.';
      }

      setAuthNotice({ type: 'error', message: friendlyMsg });

      // Clean the URL hash & query string so the error is not retained on refresh
      window.history.replaceState({}, document.title, window.location.pathname);
      setIsLoading(false);
      return;
    }

    // 2. Handle PKCE code exchange (?code=...)
    if (urlParams.code) {
      setIsLoading(true);
      client.auth.exchangeCodeForSession(urlParams.code).then(({ data, error }) => {
        window.history.replaceState({}, document.title, window.location.pathname);
        if (error) {
          setAuthNotice({
            type: 'error',
            message: `Email confirmation failed: ${error.message}`
          });
          setIsLoading(false);
        } else if (data.session?.user) {
          setAuthNotice({
            type: 'success',
            message: 'Email confirmed successfully! Your citizen account is verified and active.'
          });
          loadAndVerifyProfile(data.session.user.id);
        }
      }).catch(() => {
        window.history.replaceState({}, document.title, window.location.pathname);
        setAuthNotice({
          type: 'error',
          message: 'Failed to complete authentication exchange. Please try logging in.'
        });
        setIsLoading(false);
      });
      return;
    }

    // 3. Handle Implicit flow confirmation (#type=signup)
    if (urlParams.type === 'signup' || urlParams.type === 'email_change') {
      setAuthNotice({
        type: 'success',
        message: 'Email confirmed successfully! Your citizen account is verified and active.'
      });
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    // 4. Initial Session Check
    client.auth.getSession().then(({ data: { session }, error }) => {
      if (!isMounted) return;
      if (error || !session?.user) {
        setUser(null);
        setIsLoading(false);
        return;
      }

      loadAndVerifyProfile(session.user.id);
    }).catch(() => {
      if (isMounted) {
        setUser(null);
        setIsLoading(false);
      }
    });

    // 5. Real-time auth state listener
    const { data: { subscription } } = client.auth.onAuthStateChange(async (event, session) => {
      if (!isMounted) return;

      if (event === 'SIGNED_OUT' || !session || !session.user) {
        setUser(null);
        setIsLoading(false);
      } else if (session?.user) {
        await loadAndVerifyProfile(session.user.id);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Real authentication & database role verification
  const login = async (
    email: string,
    password: string,
    selectedRoleTab: UserRole
  ): Promise<LoginResult> => {
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !password.trim()) {
      return {
        success: false,
        error: 'Both email and password are required.'
      };
    }

    // 1. Production Mode: Authenticate strictly via Supabase Auth + Database Profile
    if (isSupabaseConfigured && supabase) {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: password
      });

      if (authError || !authData.user || !authData.session) {
        const errorMsg = authError?.message || 'Authentication failed. Please check your credentials.';

        // Check for unconfirmed email
        if (
          errorMsg.toLowerCase().includes('email not confirmed') ||
          errorMsg.toLowerCase().includes('email address not confirmed') ||
          (authError as any)?.code === 'email_not_confirmed'
        ) {
          return {
            success: false,
            error: 'Email address has not been confirmed yet. Please check your email inbox (and spam folder) for the verification link before logging in.'
          };
        }

        // Check for missing demo account in live Supabase Auth
        if (
          errorMsg.toLowerCase().includes('invalid login credentials') &&
          cleanEmail.endsWith('@gramapanchayat.in')
        ) {
          return {
            success: false,
            error: `Demo account '${cleanEmail}' does not exist in your Supabase Auth project yet. Please execute the demo provisioning script in your Supabase SQL Editor to activate demo accounts.`
          };
        }

        return {
          success: false,
          error: errorMsg
        };
      }

      // Query database profile to verify the actual trusted role
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authData.user.id)
        .single();

      if (profileError || !profileData) {
        // Sign out since profile verification failed
        await supabase.auth.signOut();
        return {
          success: false,
          error: 'User profile not found in village registry. Please contact the administrator.'
        };
      }

      // Verify that the actual database role matches the selected login tab
      if (profileData.role !== selectedRoleTab) {
        await supabase.auth.signOut();
        const roleLabel =
          selectedRoleTab === 'admin'
            ? 'Panchayat Admin'
            : selectedRoleTab === 'worker'
            ? 'Sanitation Worker'
            : 'Citizen';
        return {
          success: false,
          error: `Access Denied: Your account is registered as '${profileData.role}', not as '${roleLabel}'. Please select the '${profileData.role}' tab to log in.`
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

      setUser(verifiedProfile);
      return { success: true, role: verifiedProfile.role };
    }

    // 2. Demo Mode: Local evaluation prototype
    const existingProfile = await villageDataService.getProfileByEmail(cleanEmail);

    if (!existingProfile) {
      return {
        success: false,
        error: 'No registered account found with this email in the prototype directory.'
      };
    }

    // Password verification in demo mode
    if (existingProfile.passwordHash && password.trim() !== existingProfile.passwordHash) {
      return {
        success: false,
        error: 'Incorrect password. (For demo evaluation, default password is password123).'
      };
    }

    // Role verification against tab
    if (existingProfile.role !== selectedRoleTab) {
      return {
        success: false,
        error: `Access Denied: This test account has the '${existingProfile.role}' role. Please switch to the '${existingProfile.role}' tab.`
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
    password: string
  ): Promise<LoginResult> => {
    const cleanEmail = email.trim().toLowerCase();

    if (!name.trim() || !phone.trim() || !cleanEmail) {
      return {
        success: false,
        error: 'All fields are required.'
      };
    }

    // Require password with minimum length of 6 characters (no default password)
    if (!password || password.trim().length < 6) {
      return {
        success: false,
        error: 'Password is required and must be at least 6 characters long.'
      };
    }

    // 1. Production Mode: Supabase Auth
    if (isSupabaseConfigured && supabase) {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: cleanEmail,
        password: password.trim(),
        options: {
          data: {
            full_name: name.trim(),
            phone_number: phone.trim(),
            village_ward: ward
          }
        }
      });

      if (authError) {
        return { success: false, error: authError.message };
      }

      if (!authData.user) {
        return { success: false, error: 'Registration failed. Please try again.' };
      }

      // If email confirmation is off, authData.session is returned immediately.
      // If session is absent, immediately log in with the credentials:
      if (!authData.session) {
        const { data: loginData, error: loginErr } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password: password.trim()
        });
        if (!loginErr && loginData.session) {
          authData.session = loginData.session;
          authData.user = loginData.user;
        }
      }

      // Retrieve or verify profile record
      let { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authData.user.id)
        .maybeSingle();

      if (!profile) {
        // Fallback upsert to ensure profile exists immediately
        const fallbackProfile = {
          id: authData.user.id,
          email: cleanEmail,
          full_name: name.trim(),
          role: 'citizen' as UserRole,
          phone_number: phone.trim(),
          village_ward: ward
        };
        await supabase.from('profiles').upsert([fallbackProfile]);
        profile = fallbackProfile as any;
      }

      const activeCitizen: UserProfile = {
        id: profile.id,
        email: profile.email,
        full_name: profile.full_name,
        role: 'citizen',
        phone_number: profile.phone_number || phone.trim(),
        village_ward: profile.village_ward || ward,
        created_at: profile.created_at || new Date().toISOString()
      };

      setUser(activeCitizen);
      return { success: true, role: 'citizen' };
    }

    // 2. Demo Mode
    const existing = await villageDataService.getProfileByEmail(cleanEmail);
    if (existing) {
      return {
        success: false,
        error: 'An account is already registered with this email. Please log in.'
      };
    }

    const newProfile: UserProfile & { passwordHash: string } = {
      id: `00000000-0000-0000-0000-${String(Date.now()).padStart(12, '0')}`,
      email: cleanEmail,
      full_name: name.trim(),
      role: 'citizen', // Strictly enforced as citizen
      phone_number: phone.trim(),
      village_ward: ward,
      created_at: new Date().toISOString(),
      passwordHash: password.trim()
    };

    await villageDataService.addProfile(newProfile);

    // In demo mode, auto log in
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
    setUser(null);
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.error('Error signing out of Supabase:', err);
      }
    }
    localStorage.removeItem('wastewise_demo_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user ? user.role : null,
        isAuthenticated: !!user,
        isProduction: isSupabaseConfigured,
        isLoading,
        authNotice,
        clearAuthNotice,
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
