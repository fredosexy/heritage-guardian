import { createContext, useContext, useEffect, useRef, useState, ReactNode } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { claimLocalData } from "@/services/claim-local-data";

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const authEventVersion = useRef(0);

  useEffect(() => {
    let mounted = true;

    // Subscribe FIRST. Auth events are authoritative for the live client state.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, s) => {
      authEventVersion.current += 1;
      if (!mounted) return;

      setSession(s);
      setUser(s?.user ?? null);
      setLoading(false);

      // Rattacher les données créées en mode visiteur au compte réel.
      if (event === "SIGNED_IN" && s?.user) {
        const uid = s.user.id;
        setTimeout(() => {
          if (mounted) void claimLocalData(uid).catch(() => undefined);
        }, 0);
      }
    });

    // Then fetch the initial session as a fallback for clients that have not
    // emitted an auth event yet. Never let this read overwrite a newer event
    // (for example SIGNED_OUT or TOKEN_REFRESHED).
    const initialEventVersion = authEventVersion.current;
    supabase.auth.getSession().then(({ data: { session: s }, error }) => {
      if (!mounted || authEventVersion.current !== initialEventVersion) return;

      if (error) {
        setSession(null);
        setUser(null);
      } else {
        setSession(s);
        setUser(s?.user ?? null);
      }
      setLoading(false);
    }).catch(() => {
      if (!mounted || authEventVersion.current !== initialEventVersion) return;
      setSession(null);
      setUser(null);
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
