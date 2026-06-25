import { useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type AppRole = "admin" | "executivo" | "cliente";

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRole = async (uid: string | undefined) => {
      if (!uid) {
        setRole(null);
        return;
      }
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", uid);
      const roles = (data ?? []).map((r: { role: AppRole }) => r.role);
      setRole(
        roles.includes("admin")
          ? "admin"
          : roles.includes("executivo")
            ? "executivo"
            : (roles[0] ?? "cliente"),
      );
    };

    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      setUser(s?.user ?? null);
      // defer supabase call out of the callback
      setTimeout(() => loadRole(s?.user?.id), 0);
    });

    supabase.auth.getSession().then(async ({ data }) => {
      setSession(data.session);
      setUser(data.session?.user ?? null);
      await loadRole(data.session?.user?.id);
      setLoading(false);
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  return { session, user, role, isAdmin: role === "admin", loading };
}
