import { useState, type FormEvent } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { ShieldCheck } from "lucide-react";
import { supabase, supabaseConfigured } from "../lib/supabase";
import { useAuth } from "../lib/auth";
import { Button, Logo } from "../components/ui";

const input = "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm";

export default function Auth() {
  const { session } = useAuth();
  const nav = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup" | "reset">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [orgName, setOrgName] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  if (session) return <Navigate to="/app" replace />;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true); setMsg(null);
    try {
      if (!supabaseConfigured) throw new Error("Backend is not configured yet (missing Supabase keys).");
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        nav("/app");
      } else if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: `${location.origin}/app`, data: { org_name: orgName || undefined } } });
        if (error) throw error;
        if (!data.session) setMsg({ ok: true, text: "Check your email to confirm your account." });
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${location.origin}/auth` });
        if (error) throw error;
        setMsg({ ok: true, text: "Password reset link sent." });
      }
    } catch (err) {
      setMsg({ ok: false, text: err instanceof Error ? err.message : "Something went wrong" });
    } finally { setBusy(false); }
  };

  const google = async () => {
    const { error } = await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: `${location.origin}/app` } });
    if (error) setMsg({ ok: false, text: error.message });
  };

  return (
    <main className="grid min-h-screen lg:grid-cols-2">
      <div className="flex flex-col justify-center px-6 py-12 sm:px-12">
        <div className="mx-auto w-full max-w-sm">
          <Link to="/" className="inline-flex"><Logo /></Link>
          <h1 className="mt-10 text-2xl font-semibold tracking-tight">{mode === "signup" ? "Create your workspace" : mode === "reset" ? "Reset your password" : "Sign in to your workspace"}</h1>
          <p className="mt-2 text-sm text-muted-foreground">For radiologists, imaging clinics, diagnostic centres and hospital imaging departments.</p>
          <form onSubmit={submit} className="mt-8 space-y-4">
            {mode === "signup" && (
              <div className="space-y-2"><label className="text-sm font-medium leading-none">Organization name</label>
                <input className={input} value={orgName} onChange={(e) => setOrgName(e.target.value)} placeholder="City Imaging Centre" /></div>
            )}
            <div className="space-y-2"><label className="text-sm font-medium leading-none">Work email</label>
              <input type="email" required className={input} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@clinic.org" /></div>
            {mode !== "reset" && (
              <div className="space-y-2">
                <div className="flex items-center justify-between"><label className="text-sm font-medium leading-none">Password</label>
                  {mode === "signin" && <button type="button" onClick={() => setMode("reset")} className="text-xs font-medium text-primary hover:underline">Forgot password?</button>}</div>
                <input type="password" required minLength={8} className={input} value={password} onChange={(e) => setPassword(e.target.value)} /></div>
            )}
            {msg && <p className={`text-sm ${msg.ok ? "text-success" : "text-destructive"}`}>{msg.text}</p>}
            <Button type="submit" className="w-full" disabled={busy}>{mode === "signup" ? "Create account" : mode === "reset" ? "Send reset link" : "Sign in"}</Button>
          </form>
          {mode !== "reset" && (<>
            <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground"><span className="h-px flex-1 bg-border" />or<span className="h-px flex-1 bg-border" /></div>
            <Button variant="outline" className="w-full" onClick={google}>Continue with Google</Button>
          </>)}
          <p className="mt-6 text-sm text-muted-foreground">
            {mode === "signin" ? <>New to RadiologyAI.online? <button onClick={() => setMode("signup")} className="font-medium text-primary hover:underline">Create an account</button></>
              : <>Already have an account? <button onClick={() => setMode("signin")} className="font-medium text-primary hover:underline">Sign in</button></>}
          </p>
        </div>
      </div>
      <aside className="hidden flex-col justify-between p-12 lg:flex" style={{ background: "var(--gradient-hero)" }}>
        <div />
        <div className="max-w-md">
          <h2 className="text-2xl font-semibold tracking-tight">One intelligent clinical workspace for your imaging organization</h2>
          <p className="mt-4 text-sm text-muted-foreground">Review studies, organize findings, think through complex cases, create structured draft reports and improve radiology workflows.</p>
          <ul className="mt-8 space-y-3 text-sm text-secondary-foreground">
            {["Organization-level data separation and role-based access", "Protected storage for studies and referral documents", "Every clinical output requires qualified clinician review"].map((t) => (
              <li key={t} className="flex gap-3"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />{t}</li>
            ))}
          </ul>
        </div>
        <p className="text-xs text-muted-foreground">Decision support only. RadiologyAI.online does not approve or sign reports.</p>
      </aside>
    </main>
  );
}
