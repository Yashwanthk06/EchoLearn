import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (
    email: string,
    password: string
  ) => Promise<{ error: Error | null; needsConfirmation: boolean }>;
  signOut: () => Promise<{ error: Error | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  /*
   * Track whether the initial getSession() call has resolved.
   * This prevents the onAuthStateChange handler from prematurely
   * clearing the loading flag when it fires before getSession resolves.
   */
  const initialised = useRef(false);

  useEffect(() => {
    /*
     * Subscribe FIRST so we never miss an event that fires
     * between getSession() call and its resolution.
     */
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);

      /*
       * Only clear loading after the initial getSession() has
       * already resolved. If it fires before that, getSession's
       * .then() will clear loading itself.
       */
      if (initialised.current) {
        setLoading(false);
      }
    });

    supabase.auth.getSession().then(({ data }) => {
      initialised.current = true;
      setSession(data.session);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    return { error: error ? new Error(error.message) : null };
  };

  const signUp = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    return {
      error: error ? new Error(error.message) : null,
      needsConfirmation: !data.session,
    };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();

    return {
      error: error ? new Error(error.message) : null,
    };
  };

  return (
    <AuthContext.Provider
      value={{
        user: session?.user ?? null,
        session,
        loading,
        signIn,
        signUp,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }

  return context;
}