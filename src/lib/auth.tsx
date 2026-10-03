import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "./supabase";

type Org = { id: string; name: string; plan: string; credits_total: number; credits_used: number };
type Ctx = { session: Session | null; loading: boolean; org: Org | null; refreshOrg: () => Promise<void>; signOut: () => Promise<void> };

const AuthCtx = createContext<Ctx>({ session: null, loading: true, org: null, refreshOrg: async () => {}, signOut: async () => {} });
export const useAuth = () => useContext(AuthCtx);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [org, setOrg] = useState<Org | null>(null);

  const refreshOrg = async () => {
    const { data } = await supabase.from("organizations").select("id,name,plan,credits_total,credits_used").limit(1).maybeSingle();
    setOrg(data as Org | null);
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => { setSession(data.session); setLoading(false); });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => { if (session) void refreshOrg(); else setOrg(null); }, [session]);

  return (
    <AuthCtx.Provider value={{ session, loading, org, refreshOrg, signOut: async () => { await supabase.auth.signOut(); } }}>
      {children}
    </AuthCtx.Provider>
  );
}
