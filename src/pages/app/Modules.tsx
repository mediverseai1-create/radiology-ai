import { useCallback, useEffect, useState, type ReactNode } from "react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../lib/auth";
import { Button } from "../../components/ui";
import { PLANS, checkoutUrl } from "../Landing";

const card = "rounded-xl border border-border bg-card p-5 shadow-[var(--shadow-card)]";
const field = "w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Row = Record<string, any>;

async function ai(action: string, input?: unknown, messages?: { role: string; content: string }[]) {
  const { data, error } = await supabase.functions.invoke("ai", { body: { action, input, messages } });
  if (error) {
    const body = await (error as { context?: Response }).context?.json?.().catch(() => null);
    throw new Error(body?.error ?? error.message);
  }
  if (data?.error) throw new Error(data.error);
  return data.result;
}

function Page({ title, sub, children, action }: { title: string; sub?: string; children: ReactNode; action?: ReactNode }) {
  return (
    <div className="mx-auto max-w-5xl">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div><h1 className="text-2xl font-semibold tracking-tight">{title}</h1>{sub && <p className="mt-1 text-sm text-muted-foreground">{sub}</p>}</div>{action}
      </div>
      <div className="mt-6 space-y-4">{children}</div>
    </div>
  );
}

const Err = ({ e }: { e: string }) => (e ? <p className="text-sm text-destructive">{e}</p> : null);
const Badge = ({ children }: { children: ReactNode }) => <span className="rounded-full border border-primary/25 bg-primary/5 px-2 py-0.5 text-[10px] font-semibold text-primary">{children}</span>;

function useRows(table: string, order = "created_at") {
  const [rows, setRows] = useState<Row[]>([]);
  const load = useCallback(async () => {
    const { data } = await supabase.from(table).select("*").order(order, { ascending: false });
    setRows(data ?? []);
  }, [table, order]);
  useEffect(() => { void load(); }, [load]);
  return [rows, load] as const;
}

const useOrgId = () => useAuth().org?.id;

export function Overview() {
  const { org } = useAuth();
  const [s] = useRows("studies"); const [r] = useRows("reports"); const [p] = useRows("patients");
  const stats: [string, number][] = [["Studies", s.length], ["Draft reports", r.filter((x) => x.status !== "approved").length], ["Approved reports", r.filter((x) => x.status === "approved").length], ["Patients", p.length]];
  return (
    <Page title="Overview" sub={org?.name}>
      <div className="grid gap-4 sm:grid-cols-4">{stats.map(([l, n]) => <div key={l} className={card}><p className="text-3xl font-semibold">{n}</p><p className="mt-1 text-sm text-muted-foreground">{l}</p></div>)}</div>
      <div className={card}><h2 className="font-semibold">Recent studies</h2>
        <ul className="mt-3 divide-y divide-border text-sm">{s.slice(0, 6).map((x) => <li key={x.id} className="flex justify-between py-2"><span>{x.title}</span><span className="text-muted-foreground">{x.modality} · {x.status}</span></li>)}
          {!s.length && <li className="py-2 text-muted-foreground">No studies yet — upload one from Studies.</li>}</ul></div>
    </Page>
  );
}

export function Studies() {
  const orgId = useOrgId();
  const [rows, load] = useRows("studies");
  const [title, setTitle] = useState(""); const [modality, setModality] = useState("CT"); const [info, setInfo] = useState("");
  const [files, setFiles] = useState<FileList | null>(null);
  const [busy, setBusy] = useState(""); const [err, setErr] = useState("");

  const create = async () => {
    if (!orgId || !title) return;
    setBusy("upload"); setErr("");
    try {
      const paths: string[] = [];
      for (const f of Array.from(files ?? [])) {
        const path = `${orgId}/${crypto.randomUUID()}-${f.name}`;
        const { error } = await supabase.storage.from("studies").upload(path, f);
        if (error) throw error;
        paths.push(path);
      }
      const { error } = await supabase.from("studies").insert({ org_id: orgId, title, modality, clinical_info: info, file_paths: paths });
      if (error) throw error;
      setTitle(""); setInfo(""); setFiles(null); await load();
    } catch (e) { setErr(e instanceof Error ? e.message : String(e)); } finally { setBusy(""); }
  };

  const analyze = async (s: Row) => {
    setBusy(s.id); setErr("");
    try {
      const out = await ai("analyze_study", { title: s.title, modality: s.modality, clinical_info: s.clinical_info, files: s.file_paths });
      await supabase.from("studies").update({ ai_output: out, status: "analysed" }).eq("id", s.id);
      await load();
    } catch (e) { setErr(e instanceof Error ? e.message : String(e)); } finally { setBusy(""); }
  };

  const toReport = async (s: Row) => {
    const sec = s.ai_output?.draft_report;
    if (!orgId) return;
    await supabase.from("reports").insert({ org_id: orgId, study_id: s.id, title: s.title, ...(sec ? { sections: sec } : {}) });
    setErr("Draft report created — open Reporting.");
  };

  return (
    <Page title="Studies" sub="Upload DICOM, ZIP, PNG or JPEG studies and prepare AI-assisted observations for review.">
      <div className={`${card} space-y-3`}>
        <div className="grid gap-3 sm:grid-cols-[1fr_120px]">
          <input className={field} placeholder="Study title (e.g. CT Chest · contrast · adult)" value={title} onChange={(e) => setTitle(e.target.value)} />
          <select className={field} value={modality} onChange={(e) => setModality(e.target.value)}>{["X-ray", "CT", "MRI", "Ultrasound", "Mammography", "Other"].map((m) => <option key={m}>{m}</option>)}</select>
        </div>
        <textarea className={field} rows={2} placeholder="Clinical information" value={info} onChange={(e) => setInfo(e.target.value)} />
        <input type="file" multiple accept=".dcm,.zip,.png,.jpg,.jpeg,.pdf" onChange={(e) => setFiles(e.target.files)} className="text-sm" />
        <Button onClick={create} disabled={!title || busy === "upload"}>{busy === "upload" ? "Uploading…" : "Add study"}</Button>
        <Err e={err} />
      </div>
      {rows.map((s) => (
        <div key={s.id} className={card}>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div><p className="font-semibold">{s.title}</p><p className="text-xs text-muted-foreground">{s.modality} · {s.file_paths?.length ?? 0} file(s) · {s.status}</p></div>
            <div className="flex gap-2"><Button size="sm" variant="outline" disabled={busy === s.id} onClick={() => analyze(s)}>{busy === s.id ? "Analysing…" : "AI analysis"}</Button>
              {s.ai_output && <Button size="sm" onClick={() => toReport(s)}>Create draft report</Button>}</div>
          </div>
          {s.ai_output && (
            <div className="mt-4 space-y-3 text-sm"><Badge>AI-GENERATED · FOR PROFESSIONAL REVIEW</Badge>
              <p>{s.ai_output.study_organization}</p>
              {(["detected_details", "suggested_observations", "differential_considerations"] as const).map((k) => s.ai_output[k]?.length ? (
                <div key={k}><p className="text-xs font-semibold uppercase tracking-wider text-primary">{k.replace("_", " ")}</p><ul className="mt-1 list-disc pl-5 text-muted-foreground">{s.ai_output[k].map((i: string) => <li key={i}>{i}</li>)}</ul></div>) : null)}
            </div>
          )}
        </div>
      ))}
    </Page>
  );
}

export function CopilotPage() {
  const orgId = useOrgId();
  const [msgs, setMsgs] = useState<Row[]>([]); const [text, setText] = useState(""); const [busy, setBusy] = useState(false); const [err, setErr] = useState("");
  useEffect(() => { supabase.from("copilot_messages").select("*").order("created_at").then(({ data }) => setMsgs(data ?? [])); }, []);
  const send = async () => {
    if (!orgId || !text.trim()) return;
    const q = text; setText(""); setBusy(true); setErr("");
    const history = [...msgs.map((m) => ({ role: m.role, content: m.content })), { role: "user", content: q }].slice(-12);
    try {
      const a = await ai("copilot", undefined, history);
      const { data } = await supabase.from("copilot_messages").insert([{ org_id: orgId, role: "user", content: q }, { org_id: orgId, role: "assistant", content: a }]).select();
      setMsgs((m) => [...m, ...(data ?? [])]);
    } catch (e) { setErr(e instanceof Error ? e.message : String(e)); setText(q); } finally { setBusy(false); }
  };
  return (
    <Page title="Clinical Copilot" sub="Organize findings, explore considerations and clarify radiology questions.">
      <div className={`${card} space-y-3`}>
        {msgs.map((m) => <div key={m.id} className={`max-w-[85%] whitespace-pre-wrap rounded-xl p-3 text-sm ${m.role === "user" ? "ml-auto bg-primary/10" : "border border-border bg-background"}`}>{m.content}</div>)}
        {!msgs.length && <p className="text-sm text-muted-foreground">Ask about findings, differentials or terminology.</p>}
        <Err e={err} />
        <div className="flex gap-2"><input className={field} value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} placeholder="Help me organize the findings from this study…" /><Button onClick={send} disabled={busy}>{busy ? "…" : "Send"}</Button></div>
        <p className="text-[11px] text-muted-foreground">Suggestions are informational and require professional review.</p>
      </div>
    </Page>
  );
}

const SECTIONS = ["clinical_indication", "technique", "comparison", "findings", "impression", "recommendations"];

export function Reporting() {
  const orgId = useOrgId();
  const [rows, load] = useRows("reports", "updated_at");
  const [dictation, setDictation] = useState(""); const [busy, setBusy] = useState(""); const [err, setErr] = useState("");

  const update = async (id: string, patch: Row) => { await supabase.from("reports").update(patch).eq("id", id); await load(); };
  const newReport = async () => { if (orgId) { await supabase.from("reports").insert({ org_id: orgId }); await load(); } };

  const generate = async (r: Row) => {
    if (!dictation.trim()) return;
    setBusy(r.id); setErr("");
    try { const s = await ai("draft_report", dictation); await update(r.id, { sections: s }); } catch (e) { setErr(e instanceof Error ? e.message : String(e)); } finally { setBusy(""); }
  };
  const qa = async (r: Row) => {
    setBusy(r.id); setErr("");
    try { const q = await ai("quality_review", r.sections); await update(r.id, { qa: q }); } catch (e) { setErr(e instanceof Error ? e.message : String(e)); } finally { setBusy(""); }
  };
  const dictate = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SR = (window as any).SpeechRecognition ?? (window as any).webkitSpeechRecognition;
    if (!SR) return setErr("Voice dictation is not supported in this browser.");
    const rec = new SR(); rec.continuous = true; rec.interimResults = false;
    rec.onresult = (e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => setDictation((d) => d + " " + Array.from(e.results).map((x) => x[0].transcript).join(" "));
    rec.start(); setTimeout(() => rec.stop(), 120000);
  };

  return (
    <Page title="Dictation and Reporting" sub="Dictate or type findings, generate a structured draft, edit every section, run quality review, then approve." action={<Button onClick={newReport}>New report</Button>}>
      <div className={`${card} space-y-2`}>
        <textarea className={field} rows={3} placeholder="Dictate or type findings…" value={dictation} onChange={(e) => setDictation(e.target.value)} />
        <Button variant="outline" size="sm" onClick={dictate}>Start dictation</Button><Err e={err} />
      </div>
      {rows.map((r) => (
        <div key={r.id} className={`${card} space-y-3`}>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <input className="min-w-0 flex-1 bg-transparent font-semibold focus:outline-none" defaultValue={r.title} onBlur={(e) => update(r.id, { title: e.target.value })} />
            <Badge>{r.status.toUpperCase()}</Badge>
          </div>
          {SECTIONS.map((k) => (
            <div key={k}><label className="text-[11px] font-semibold uppercase tracking-wider text-primary">{k.replace("_", " ")}</label>
              <textarea className={field} rows={2} disabled={r.status === "approved"} defaultValue={r.sections?.[k] ?? ""} onBlur={(e) => update(r.id, { sections: { ...r.sections, [k]: e.target.value } })} /></div>
          ))}
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline" disabled={busy === r.id || r.status === "approved"} onClick={() => generate(r)}>Generate from dictation</Button>
            <Button size="sm" variant="outline" disabled={busy === r.id} onClick={() => qa(r)}>Run quality review</Button>
            {r.status === "draft" && <Button size="sm" variant="outline" onClick={() => update(r.id, { status: "in_review" })}>Send to review</Button>}
            {r.status === "in_review" && <Button size="sm" onClick={() => confirm("Approve this report as the reviewing professional?") && update(r.id, { status: "approved" })}>Approve</Button>}
          </div>
          {r.qa?.items && (
            <ul className="space-y-1.5 text-sm">{r.qa.items.map((i: Row, n: number) => <li key={n} className="rounded-md border border-border bg-background p-2"><span className={i.status === "ok" ? "text-success" : "text-warning"}>{i.status === "ok" ? "✓" : "!"}</span> <b>{i.check}</b> — {i.detail}</li>)}
              <li className="text-[11px] text-muted-foreground">Quality review never edits or approves a report.</li></ul>
          )}
        </div>
      ))}
    </Page>
  );
}

export function Requests() {
  const orgId = useOrgId(); const [rows, load] = useRows("imaging_requests");
  const [text, setText] = useState(""); const [busy, setBusy] = useState(false); const [err, setErr] = useState("");
  const run = async () => {
    if (!orgId || !text.trim()) return; setBusy(true); setErr("");
    try { const x = await ai("extract_request", text); await supabase.from("imaging_requests").insert({ org_id: orgId, source_text: text, extracted: x }); setText(""); await load(); }
    catch (e) { setErr(e instanceof Error ? e.message : String(e)); } finally { setBusy(false); }
  };
  return (
    <Page title="Imaging Requests" sub="Extract information from referrals and identify missing clinical details.">
      <div className={`${card} space-y-2`}><textarea className={field} rows={4} placeholder="Paste referral text…" value={text} onChange={(e) => setText(e.target.value)} /><Button onClick={run} disabled={busy}>{busy ? "Extracting…" : "Extract"}</Button><Err e={err} /></div>
      {rows.map((r) => <div key={r.id} className={`${card} text-sm`}><Badge>AI-EXTRACTED</Badge><dl className="mt-3 grid gap-1">{Object.entries(r.extracted ?? {}).map(([k, v]) => <div key={k}><dt className="inline font-semibold capitalize">{k.replace(/_/g, " ")}: </dt><dd className="inline text-muted-foreground">{Array.isArray(v) ? v.join("; ") || "—" : String(v)}</dd></div>)}</dl></div>)}
    </Page>
  );
}

export function Patients() {
  const orgId = useOrgId(); const [rows, load] = useRows("patients");
  const [name, setName] = useState(""); const [mrn, setMrn] = useState("");
  const add = async () => { if (!orgId || !name) return; await supabase.from("patients").insert({ org_id: orgId, full_name: name, mrn }); setName(""); setMrn(""); await load(); };
  return (
    <Page title="Patient records">
      <div className={`${card} flex flex-wrap gap-2`}><input className={`${field} flex-1`} placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} /><input className={`${field} w-40`} placeholder="MRN" value={mrn} onChange={(e) => setMrn(e.target.value)} /><Button onClick={add}>Add</Button></div>
      <div className={card}><ul className="divide-y divide-border text-sm">{rows.map((p) => <li key={p.id} className="flex justify-between py-2"><span>{p.full_name}</span><span className="text-muted-foreground">{p.mrn}</span></li>)}{!rows.length && <li className="text-muted-foreground">No patients yet.</li>}</ul></div>
    </Page>
  );
}

export function Scribe() {
  const orgId = useOrgId(); const [rows, load] = useRows("scribe_notes");
  const [t, setT] = useState(""); const [busy, setBusy] = useState(false); const [err, setErr] = useState("");
  const run = async () => {
    if (!orgId || !t.trim()) return; setBusy(true); setErr("");
    try { const note = await ai("scribe", t); await supabase.from("scribe_notes").insert({ org_id: orgId, transcript: t, note }); setT(""); await load(); }
    catch (e) { setErr(e instanceof Error ? e.message : String(e)); } finally { setBusy(false); }
  };
  return (
    <Page title="Consultation scribe" sub="Turn a consultation transcript into a structured note for review.">
      <div className={`${card} space-y-2`}><textarea className={field} rows={5} placeholder="Paste or type the consultation transcript…" value={t} onChange={(e) => setT(e.target.value)} /><Button onClick={run} disabled={busy}>{busy ? "Writing…" : "Create note"}</Button><Err e={err} /></div>
      {rows.map((n) => <div key={n.id} className={`${card} whitespace-pre-wrap text-sm`}><Badge>AI-GENERATED DRAFT</Badge><p className="mt-2">{n.note}</p></div>)}
    </Page>
  );
}

export function Workforce() {
  const orgId = useOrgId();
  const [locs, loadL] = useRows("locations"); const [shifts, loadS] = useRows("shifts", "starts_at"); const [att] = useRows("attendance", "checked_in_at");
  const [ln, setLn] = useState(""); const [sn, setSn] = useState(""); const [sl, setSl] = useState(""); const [a, setA] = useState(""); const [b, setB] = useState("");
  const [insight, setInsight] = useState(""); const [err, setErr] = useState("");
  const addLoc = async () => { if (orgId && ln) { await supabase.from("locations").insert({ org_id: orgId, name: ln }); setLn(""); await loadL(); } };
  const addShift = async () => { if (orgId && sn && a && b) { await supabase.from("shifts").insert({ org_id: orgId, staff_name: sn, location_id: sl || null, starts_at: a, ends_at: b }); setSn(""); await loadS(); } };
  const insights = async () => { setErr(""); try { setInsight(await ai("schedule_insights", { shifts: shifts.slice(0, 60), attendance: att.slice(0, 100) })); } catch (e) { setErr(e instanceof Error ? e.message : String(e)); } };
  return (
    <Page title="Workforce Intelligence" sub="Locations, secure check-in links, shifts, attendance and AI coverage insights.">
      <div className={`${card} space-y-3`}><h2 className="font-semibold">Locations & check-in links</h2>
        <div className="flex gap-2"><input className={field} placeholder="Location name" value={ln} onChange={(e) => setLn(e.target.value)} /><Button onClick={addLoc}>Add</Button></div>
        <ul className="divide-y divide-border text-sm">{locs.map((l) => <li key={l.id} className="py-2"><b>{l.name}</b><br /><code className="break-all text-xs text-muted-foreground">{location.origin}/checkin/{l.checkin_token}</code></li>)}</ul></div>
      <div className={`${card} space-y-3`}><h2 className="font-semibold">Shifts</h2>
        <div className="grid gap-2 sm:grid-cols-5"><input className={field} placeholder="Staff name" value={sn} onChange={(e) => setSn(e.target.value)} />
          <select className={field} value={sl} onChange={(e) => setSl(e.target.value)}><option value="">Location</option>{locs.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}</select>
          <input type="datetime-local" className={field} value={a} onChange={(e) => setA(e.target.value)} /><input type="datetime-local" className={field} value={b} onChange={(e) => setB(e.target.value)} /><Button onClick={addShift}>Add shift</Button></div>
        <ul className="divide-y divide-border text-sm">{shifts.slice(0, 15).map((s) => <li key={s.id} className="flex justify-between py-2"><span>{s.staff_name}</span><span className="text-muted-foreground">{new Date(s.starts_at).toLocaleString()} → {new Date(s.ends_at).toLocaleTimeString()}</span></li>)}</ul></div>
      <div className={`${card} space-y-2`}><h2 className="font-semibold">Attendance history</h2>
        <ul className="divide-y divide-border text-sm">{att.slice(0, 15).map((x) => <li key={x.id} className="flex justify-between py-2"><span>{x.staff_name}</span><span className="text-muted-foreground">{new Date(x.checked_in_at).toLocaleString()}</span></li>)}{!att.length && <li className="text-muted-foreground">No check-ins yet.</li>}</ul>
        <Button variant="outline" onClick={insights}>Generate coverage insights</Button><Err e={err} />{insight && <p className="whitespace-pre-wrap text-sm text-muted-foreground">{insight}</p>}</div>
    </Page>
  );
}

export function SettingsPage() {
  const { org } = useAuth();
  const [members] = useRows("members");
  const [yearly, setYearly] = useState(false);
  return (
    <Page title="Settings">
      <div className={card}><h2 className="font-semibold">Plan & credits</h2>
        <p className="mt-1 text-sm text-muted-foreground">Current plan: <b className="capitalize text-foreground">{org?.plan}</b> · {org?.credits_used}/{org?.credits_total} AI credits used this month.</p>
        <div className="mt-3 inline-flex rounded-full border border-border p-1 text-sm">{([["Monthly", false], ["Yearly", true]] as const).map(([l, y]) => <button key={l} onClick={() => setYearly(y)} className={`rounded-full px-4 py-1 ${yearly === y ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>{l}</button>)}</div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">{PLANS.filter((p) => p.id !== "free").map((p) => {
          const url = checkoutUrl(p.id, yearly);
          return <div key={p.id} className="rounded-lg border border-border p-4"><p className="font-semibold">{p.name}</p><p className="text-sm text-muted-foreground">${yearly ? p.price * 10 : p.price}/{yearly ? "year" : "month"} · {p.credits} credits</p>
            {url ? <a href={`${url}${url.includes("?") ? "&" : "?"}client_reference_id=${org?.id}`} target="_blank" rel="noopener noreferrer" className="mt-3 inline-block text-sm font-medium text-primary hover:underline">Subscribe →</a> : <p className="mt-3 text-xs text-muted-foreground">Checkout link not configured yet.</p>}</div>;
        })}</div></div>
      <div className={card}><h2 className="font-semibold">Team</h2><ul className="mt-2 divide-y divide-border text-sm">{members.map((m) => <li key={m.user_id} className="flex justify-between py-2"><span>{m.email}</span><Badge>{String(m.role).toUpperCase()}</Badge></li>)}</ul></div>
    </Page>
  );
}
