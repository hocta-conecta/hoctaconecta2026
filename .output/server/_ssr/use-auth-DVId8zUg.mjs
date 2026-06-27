import { r as reactExports } from "../_libs/react.mjs";
import { s as supabase } from "./router-lpyZtYZ-.mjs";
function useAuth() {
  const [session, setSession] = reactExports.useState(null);
  const [user, setUser] = reactExports.useState(null);
  const [role, setRole] = reactExports.useState(null);
  const [loading, setLoading] = reactExports.useState(true);
  reactExports.useEffect(() => {
    const loadRole = async (uid) => {
      if (!uid) {
        setRole(null);
        return;
      }
      const { data } = await supabase.from("user_roles").select("role").eq("user_id", uid);
      const roles = (data ?? []).map((r) => r.role);
      setRole(
        roles.includes("admin") ? "admin" : roles.includes("executivo") ? "executivo" : roles[0] ?? "cliente"
      );
    };
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      setUser(s?.user ?? null);
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
export {
  useAuth as u
};
