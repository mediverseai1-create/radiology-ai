import { useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { Button, Logo } from "../components/ui";

export default function CheckIn() {
  const { token = "" } = useParams();
  const [name, setName] = useState("");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const go = async () => {
    const { data, error } = await supabase.rpc("staff_check_in", { token, staff: name });
    setMsg(error ? { ok: false, text: error.message } : { ok: true, text: `Checked in at ${data} · ${new Date().toLocaleTimeString()}` });
  };
  return (
    <main className="grid min-h-screen place-items-center px-5" style={{ background: "var(--gradient-hero)" }}>
      <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-elevated)]">
        <Logo /><h1 className="mt-6 text-xl font-semibold">Staff check-in</h1>
        <input className="mt-4 h-9 w-full rounded-md border border-input px-3 text-sm" placeholder="Your full name" value={name} onChange={(e) => setName(e.target.value)} />
        <Button className="mt-3 w-full" disabled={!name.trim()} onClick={go}>Check in</Button>
        {msg && <p className={`mt-3 text-sm ${msg.ok ? "text-success" : "text-destructive"}`}>{msg.text}</p>}
      </div>
    </main>
  );
}
