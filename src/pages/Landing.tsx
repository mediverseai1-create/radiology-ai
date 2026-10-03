import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import * as Acc from "@radix-ui/react-accordion";
import {
  Activity, ArrowRight, Brain, Building2, CalendarClock, Check, CircleCheck, ChevronDown, ClipboardCheck, Clock3, FileText,
  FolderLock, GraduationCap, Images, Layers, MapPin, Menu, Mic, Network, QrCode, Radio, ScanLine, ShieldCheck, Sparkles,
  Stethoscope, TriangleAlert, Users, Workflow, X, type LucideIcon,
} from "lucide-react";
import { Bars, Eyebrow, H2, Lead, LinkButton, Logo, Reveal, WindowChrome, Button, btn } from "../components/ui";

const NAV = [["Platform", "#platform"], ["Solutions", "#solutions"], ["How It Works", "#how-it-works"], ["For Organizations", "#organizations"], ["Pricing", "#pricing"]];
const titleCard = "rounded-lg border border-border bg-card";

function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const f = () => setScrolled(window.scrollY > 8);
    f(); window.addEventListener("scroll", f, { passive: true });
    return () => window.removeEventListener("scroll", f);
  }, []);
  return (
    <header className={`sticky top-0 z-50 border-b transition-colors duration-300 ${scrolled ? "border-border bg-background/90 backdrop-blur-md" : "border-transparent bg-background/60 backdrop-blur-sm"}`}>
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-5 lg:px-8">
        <a href="#top" className="shrink-0"><Logo /></a>
        <nav className="hidden items-center gap-1 lg:flex">
          {NAV.map(([l, h]) => <a key={h} href={h} className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground">{l}</a>)}
        </nav>
        <div className="hidden items-center gap-2 md:flex">
          <LinkButton to="/auth" variant="ghost">Sign In</LinkButton>
          <LinkButton to="/auth">Get Started</LinkButton>
        </div>
        <Button variant="outline" className="h-9 w-9 md:hidden" onClick={() => setOpen(!open)} aria-label="Menu">{open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}</Button>
      </div>
      {open && (
        <div className="border-t border-border bg-background px-5 py-4 lg:hidden">
          <nav className="flex flex-col gap-1">
            {NAV.map(([l, h]) => <a key={h} href={h} onClick={() => setOpen(false)} className="rounded-md px-3 py-2 text-sm font-medium text-foreground hover:bg-secondary">{l}</a>)}
          </nav>
          <div className="mt-3 flex gap-2"><LinkButton to="/auth" variant="outline" className="flex-1">Sign In</LinkButton><LinkButton to="/auth" className="flex-1">Get Started</LinkButton></div>
        </div>
      )}
    </header>
  );
}

const HERO_STEPS: [LucideIcon, string][] = [[Images, "Upload imaging study"], [Sparkles, "AI-assisted analysis"], [ScanLine, "Clinician review"], [FileText, "Structured draft report"], [ClipboardCheck, "Quality review"]];

function Hero() {
  return (
    <section className="relative overflow-hidden" style={{ background: "var(--gradient-hero)" }}>
      <div className="pointer-events-none absolute -right-40 -top-40 h-[38rem] w-[38rem] rounded-full opacity-40 blur-3xl" style={{ background: "var(--gradient-primary)" }} />
      <div className="relative mx-auto grid max-w-7xl gap-14 px-5 py-20 lg:grid-cols-[1.02fr_1fr] lg:items-center lg:gap-16 lg:px-8 lg:py-28">
        <Reveal>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">AI Intelligence for Radiology</p>
          <h1 className="mt-5 text-4xl font-semibold leading-[1.05] tracking-tight text-foreground sm:text-5xl lg:text-6xl">The AI operating system for modern radiology.</h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">RadiologyAI.online helps radiology organizations analyse imaging studies, organize clinical reasoning, accelerate reporting, improve report quality and coordinate department operations from one connected AI platform.</p>
          <div className="mt-9 flex flex-wrap gap-3">
            <LinkButton to="/auth" size="lg">Explore RadiologyAI <ArrowRight className="ml-1 h-4 w-4" /></LinkButton>
            <LinkButton to="#platform" variant="outline" size="lg">View the Platform</LinkButton>
          </div>
          <p className="mt-6 text-sm text-muted-foreground">Built for hospitals, diagnostic imaging centres, radiology groups and teleradiology organizations.</p>
        </Reveal>
        <Reveal delay={120}>
          <div className="relative">
            <div className="absolute -inset-6 -z-10 rounded-[2rem] opacity-70 blur-2xl" style={{ background: "var(--gradient-hero)" }} />
            <WindowChrome title="radiologyai.online / workspace">
              <div className="grid gap-0 sm:grid-cols-[170px_1fr]">
                <aside className="hidden flex-col gap-3 border-r border-border bg-secondary/40 p-4 sm:flex">
                  {["Overview", "Studies", "Workspace", "Copilot", "Reporting", "Report QA"].map((l) => (
                    <div key={l} className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-[11px] font-medium ${l === "Studies" ? "bg-primary/10 text-primary" : "text-muted-foreground"}`}>
                      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-60" />{l}
                    </div>
                  ))}
                </aside>
                <div className="p-5">
                  <div className="flex items-center justify-between">
                    <div><p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-primary">Connected workflow</p><p className="mt-1 text-sm font-semibold text-foreground">CT Chest · contrast · adult</p></div>
                    <span className="rounded-full border border-primary/25 bg-primary/5 px-2.5 py-1 text-[10px] font-semibold text-primary">AI ASSISTED</span>
                  </div>
                  <ol className="mt-5 space-y-2.5">
                    {HERO_STEPS.map(([Icon, l], i) => (
                      <li key={l} className="flex items-center gap-3 rounded-lg border border-border bg-background px-3 py-2.5" style={{ animation: `rai-rise 640ms ease-out ${i * 90}ms both` }}>
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary"><Icon className="h-3.5 w-3.5" /></span>
                        <span className="flex-1 text-xs font-medium text-foreground">{l}</span>
                        <span className="text-[10px] font-medium text-muted-foreground">step {i + 1}</span>
                      </li>
                    ))}
                  </ol>
                  <div className="mt-5 grid grid-cols-3 gap-2">
                    {["Study organization", "Suggested observations", "Draft report"].map((l) => (
                      <div key={l} className="rounded-lg bg-secondary/70 p-2.5"><p className="text-[10px] font-semibold text-foreground">{l}</p><div className="mt-2"><Bars a={90} b={62} second="bg-primary/30" /></div></div>
                    ))}
                  </div>
                </div>
              </div>
            </WindowChrome>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

const ORGS: [LucideIcon, string][] = [[Building2, "Hospital radiology departments"], [ScanLine, "Diagnostic imaging centres"], [Users, "Radiology groups"], [Radio, "Teleradiology companies"], [Stethoscope, "Specialist clinics"], [GraduationCap, "Academic medical centres"], [Network, "Multi-location imaging organizations"]];

function Organizations() {
  return (
    <section id="organizations" className="border-y border-border bg-background">
      <div className="mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-24">
        <Reveal><div className="max-w-3xl"><H2>Built for organizations delivering medical imaging at scale.</H2><Lead>Whether operating one imaging centre or coordinating reporting across multiple locations, RadiologyAI.online gives teams a shared system for imaging review, reporting, quality and operational intelligence.</Lead></div></Reveal>
        <div className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {ORGS.map(([Icon, l], i) => (
            <Reveal key={l} delay={i * 60}>
              <div className="group flex h-full items-center gap-3 rounded-lg border border-border bg-card px-4 py-4 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-[var(--shadow-card)]">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary"><Icon className="h-4 w-4" /></span>
                <span className="text-sm font-medium text-foreground">{l}</span>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

const PLATFORM: [LucideIcon, string, string][] = [
  [Images, "AI Image Analysis", "Upload X-ray, CT, MRI, ultrasound, mammography or other supported imaging studies. RadiologyAI organizes available study information and prepares AI-assisted observations for professional review."],
  [Stethoscope, "Image Workspace", "Review imaging studies in a focused workspace with series navigation, zoom, pan, windowing, measurements, annotations, comparisons and clinical context."],
  [Brain, "Clinical Copilot", "Organize clinical information, reason through observed findings, explore differential considerations and clarify complex radiology questions."],
  [Mic, "Dictation and Reporting", "Convert voice dictation and clinical observations into complete, editable draft reports using structured examination templates."],
  [ClipboardCheck, "Report Quality Review", "Identify laterality conflicts, contradictions, missing measurements, unclear recommendations and inconsistencies between findings and impressions."],
  [Workflow, "Imaging Requests", "Extract information from referrals, identify missing clinical details and organize questions requiring professional review."],
  [CalendarClock, "Workforce Intelligence", "Manage staff check-in, locations, shifts, department coverage and AI-powered operational insights."],
  [FolderLock, "Organization Workspace", "Keep imaging studies, reports, conversations and operational records within secure organization-specific workspaces."],
];

function Platform() {
  return (
    <section id="platform" className="bg-primary-soft/50">
      <div className="mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-28">
        <Reveal><div className="mx-auto max-w-3xl text-center"><Eyebrow>The Platform</Eyebrow><H2 className="mt-4">Everything a radiology department works with—connected by AI.</H2></div></Reveal>
        <div className="mt-14 grid gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
          {PLATFORM.map(([Icon, t, d], i) => (
            <Reveal key={t} delay={(i % 4) * 70}>
              <article className="group h-full bg-card p-6 transition-colors hover:bg-card/60">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary transition-transform group-hover:scale-105"><Icon className="h-5 w-5" /></span>
                <h3 className="mt-4 text-base font-semibold text-foreground">{t}</h3>
                <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">{d}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

const IMG_OUT = ["Study organization", "Detected study details", "Suggested observations", "Differential considerations", "Editable draft radiology report"];

function ImageIntelligence() {
  return (
    <section id="solutions" className="border-y border-border bg-background">
      <div className="mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-28">
        <Reveal><div className="mx-auto max-w-3xl text-center"><Eyebrow>AI Image Intelligence</Eyebrow><H2 className="mt-4">From uploaded imaging study to review-ready clinical intelligence.</H2><Lead>Upload an imaging study and allow RadiologyAI to organize available files, identify relevant study information, surface possible areas for attention and prepare structured observations for qualified professional review.</Lead></div></Reveal>
        <Reveal className="mt-14" delay={100}>
          <WindowChrome title="radiologyai.online / imaging studies · AI analysis">
            <div className="grid gap-0 lg:grid-cols-[1.05fr_1fr]">
              <div className="relative border-b border-border bg-foreground/[0.96] p-5 lg:border-b-0 lg:border-r">
                <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-[radial-gradient(circle_at_50%_45%,oklch(0.42_0.03_258)_0%,oklch(0.16_0.02_258)_70%)]">
                  <div className="absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-primary/25 to-transparent" style={{ animation: "rai-scan 3.6s ease-in-out infinite" }} />
                  <div className="absolute left-[38%] top-[42%] h-14 w-14 rounded-full border-2 border-primary/80 shadow-[0_0_28px_var(--primary-glow)]" />
                  <div className="absolute bottom-3 left-3 flex items-center gap-2 rounded-md bg-background/85 px-2 py-1 text-[10px] font-medium text-foreground"><Activity className="h-3 w-3 text-primary" /> Series 3 / 214 · axial</div>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {["Zoom", "Pan", "Window", "Measure", "Annotate", "Compare"].map((t) => <span key={t} className="rounded-md border border-border/40 bg-background/10 px-2 py-1 text-[10px] font-medium text-background">{t}</span>)}
                </div>
              </div>
              <div className="p-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-primary">AI-assisted output</p>
                <ul className="mt-4 space-y-3">
                  {IMG_OUT.map((l, i) => (
                    <li key={l} className="rounded-lg border border-border bg-background p-3">
                      <div className="flex items-center gap-2"><CircleCheck className="h-3.5 w-3.5 text-primary" /><p className="text-xs font-semibold text-foreground">{l}</p></div>
                      <div className="mt-2 pl-[1.375rem]"><Bars a={i % 2 ? 78 : 94} b={i % 2 ? 52 : 66} /></div>
                    </li>
                  ))}
                </ul>
                <p className="mt-4 rounded-lg bg-secondary/70 px-3 py-2 text-[10px] text-muted-foreground">Outputs are prepared for review by qualified professionals.</p>
              </div>
            </div>
          </WindowChrome>
        </Reveal>
        <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {IMG_OUT.map((l, i) => (
            <Reveal key={l} delay={i * 60}><div className={`flex h-full items-start gap-2.5 p-4 ${titleCard}`}><CircleCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" /><span className="text-sm font-medium text-foreground">{l}</span></div></Reveal>
          ))}
        </div>
        <div className="mt-10 flex justify-center"><LinkButton to="/auth" size="lg">Analyse an Imaging Study <ArrowRight className="ml-1 h-4 w-4" /></LinkButton></div>
      </div>
    </section>
  );
}

const REPORT_STEPS = ["Select or upload a study", "Dictate or type findings", "Generate a structured draft", "Edit every section", "Run a quality review", "Approve through the organization's professional workflow"];
const SECTIONS = ["Clinical indication", "Technique", "Comparison", "Findings", "Impression", "Recommendations"];
const HEIGHTS = [6, 13, 20, 9, 16, 23, 12, 19, 8, 15, 22, 11, 18, 7, 14, 21, 10, 17];

function Reporting() {
  return (
    <section className="bg-primary-soft/50">
      <div className="mx-auto grid max-w-7xl gap-14 px-5 py-20 lg:grid-cols-2 lg:items-center lg:px-8 lg:py-28">
        <Reveal>
          <div className="max-w-3xl"><Eyebrow>AI Reporting Copilot</Eyebrow><H2 className="mt-4">Move from findings to a structured report in less time.</H2><Lead>Radiologists can dictate naturally, enter observations or use information from the current imaging study. RadiologyAI transforms that information into an editable draft organized by clinical indication, technique, comparison, findings, impression and recommendations.</Lead></div>
          <ol className="mt-8 space-y-3">
            {REPORT_STEPS.map((s, i) => <li key={s} className="flex items-center gap-3"><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-primary/30 bg-background text-xs font-semibold text-primary">{i + 1}</span><span className="text-sm font-medium text-foreground">{s}</span></li>)}
          </ol>
          <LinkButton to="/auth" size="lg" className="mt-9">Explore AI Reporting <ArrowRight className="ml-1 h-4 w-4" /></LinkButton>
        </Reveal>
        <Reveal delay={100}>
          <WindowChrome title="radiologyai.online / reporting">
            <div className="p-5">
              <div className="flex items-center gap-3 rounded-xl border border-primary/25 bg-primary/5 p-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/15 text-primary"><Mic className="h-4 w-4" /></span>
                <div className="flex-1"><p className="text-xs font-semibold text-foreground">Dictation active</p>
                  <div className="mt-2 flex items-end gap-1">{[...HEIGHTS, ...HEIGHTS].slice(0, 30).map((h, i) => <span key={i} className="w-1 rounded-full bg-primary/60" style={{ height: h, animation: `rai-pulse 1.4s ease-in-out ${i * 45}ms infinite` }} />)}</div>
                </div>
              </div>
              <div className="mt-4 space-y-2.5">
                {SECTIONS.map((s, i) => (
                  <div key={s} className="rounded-lg border border-border bg-background p-3">
                    <div className="flex items-center justify-between"><p className="text-[11px] font-semibold text-foreground">{s}</p><span className="text-[10px] font-medium text-primary">editable</span></div>
                    <div className="mt-2"><Bars a={100} b={i % 2 ? 70 : 85} /></div>
                  </div>
                ))}
              </div>
            </div>
          </WindowChrome>
        </Reveal>
      </div>
    </section>
  );
}

function Copilot() {
  return (
    <section className="border-y border-border bg-background">
      <div className="mx-auto grid max-w-7xl gap-14 px-5 py-20 lg:grid-cols-2 lg:items-center lg:px-8 lg:py-28">
        <Reveal>
          <WindowChrome title="radiologyai.online / clinical copilot">
            <div className="space-y-3 p-5">
              <div className="ml-auto max-w-[80%] rounded-xl rounded-br-sm bg-primary/10 p-3"><p className="text-xs text-foreground">Help me organize the findings from this contrast-enhanced study and list the considerations worth reviewing.</p></div>
              <div className="max-w-[88%] rounded-xl rounded-bl-sm border border-border bg-background p-3">
                <div className="flex items-center gap-2"><Brain className="h-3.5 w-3.5 text-primary" /><p className="text-[11px] font-semibold text-foreground">Clinical Copilot</p></div>
                <div className="mt-2.5 space-y-1.5">
                  <span className="block h-2 rounded-full bg-muted" style={{ width: "96%" }} /><span className="block h-2 rounded-full bg-muted" style={{ width: "88%" }} />
                  <span className="block h-2 rounded-full bg-primary/30" style={{ width: "72%" }} /><span className="block h-2 rounded-full bg-muted" style={{ width: "60%" }} />
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5">{["Organized findings", "Considerations", "Questions to review"].map((t) => <span key={t} className="rounded-full border border-border bg-secondary/70 px-2 py-0.5 text-[10px] font-medium text-muted-foreground">{t}</span>)}</div>
              </div>
              <p className="rounded-lg bg-secondary/70 px-3 py-2 text-[10px] text-muted-foreground">Suggestions are informational and require professional review.</p>
            </div>
          </WindowChrome>
        </Reveal>
        <Reveal delay={100}>
          <div className="max-w-3xl"><Eyebrow>Clinical Reasoning Assistance</Eyebrow><H2 className="mt-4">A radiology-focused AI copilot for complex clinical thinking.</H2><Lead>Bring together clinical history, examination details, prior reports and observed findings. RadiologyAI helps organize the available information, explore possible considerations, clarify terminology and identify questions requiring further review.</Lead></div>
          <div className="mt-8 grid gap-2.5 sm:grid-cols-2">
            {["Organize observed findings", "Explore differential considerations", "Review clinical questions", "Clarify radiology terminology", "Compare current and prior information", "Identify missing context"].map((t) => (
              <div key={t} className="flex items-center gap-2.5 rounded-lg border border-border bg-card px-3.5 py-3"><Sparkles className="h-4 w-4 shrink-0 text-primary" /><span className="text-sm font-medium text-foreground">{t}</span></div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

const QA: [string, string, boolean][] = [
  ["Laterality", "Findings mention left; impression states right", true], ["Findings vs impression", "Impression omits a described finding", true],
  ["Missing measurements", "All described lesions carry measurements", false], ["Ambiguous language", "\"Possibly significant\" is unclear", true],
  ["Follow-up clarity", "Interval and modality stated", false], ["Incomplete sections", "All template sections completed", false],
];

function Quality() {
  return (
    <section className="bg-primary-soft/50">
      <div className="mx-auto grid max-w-7xl gap-14 px-5 py-20 lg:grid-cols-2 lg:items-center lg:px-8 lg:py-28">
        <Reveal>
          <div className="max-w-3xl"><Eyebrow>Quality Intelligence</Eyebrow><H2 className="mt-4">Add an intelligent second review before final approval.</H2><Lead>RadiologyAI examines draft reports for possible inconsistencies, omissions and unclear wording, helping qualified professionals review reports more efficiently.</Lead></div>
          <div className="mt-8 flex flex-wrap gap-2">{["Laterality", "Findings versus impression", "Missing measurements", "Ambiguous language", "Follow-up clarity", "Contradictions", "Incomplete sections"].map((t) => <span key={t} className="rounded-full border border-primary/25 bg-background px-3.5 py-1.5 text-sm font-medium text-foreground">{t}</span>)}</div>
        </Reveal>
        <Reveal delay={100}>
          <WindowChrome title="radiologyai.online / report quality review">
            <div className="p-5">
              <div className="flex items-center justify-between rounded-lg bg-secondary/70 px-3 py-2"><p className="text-[11px] font-semibold text-foreground">Draft report · demonstration</p><span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">3 items to review</span></div>
              <ul className="mt-4 space-y-2.5">
                {QA.map(([t, d, warn]) => (
                  <li key={t} className="flex items-start gap-3 rounded-lg border border-border bg-background p-3">
                    {warn ? <TriangleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0 text-warning" /> : <CircleCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-success" />}
                    <div><p className="text-[11px] font-semibold text-foreground">{t}</p><p className="mt-0.5 text-[11px] text-muted-foreground">{d}</p></div>
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-[10px] text-muted-foreground">Quality review never edits or approves a report — it highlights items for the reporting professional.</p>
            </div>
          </WindowChrome>
        </Reveal>
      </div>
    </section>
  );
}

const FLOW: [LucideIcon, string][] = [[Images, "Upload the imaging study"], [ScanLine, "Review images and record observations"], [Brain, "Consult the Clinical Copilot"], [FileText, "Generate an editable draft report"], [ClipboardCheck, "Run report-quality checks"], [CircleCheck, "Complete professional review and approval"]];

function Flow() {
  return (
    <section className="border-y border-border bg-background">
      <div className="mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-28">
        <Reveal><div className="mx-auto max-w-3xl text-center"><H2>One connected workflow from study upload to final professional review.</H2><Lead>Every stage remains connected, allowing authorized teams to move through the reporting process without repeatedly transferring information between disconnected tools.</Lead></div></Reveal>
        <div className="relative mt-14">
          <div className="absolute left-0 right-0 top-6 hidden h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent lg:block" />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-6">
            {FLOW.map(([Icon, t], i) => (
              <Reveal key={t} delay={i * 70}>
                <div className="relative flex h-full flex-col items-start gap-3 lg:items-center lg:text-center">
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl border border-primary/25 bg-card text-primary shadow-[var(--shadow-card)]"><Icon className="h-5 w-5" /></span>
                  <div><p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">Step {i + 1}</p><p className="mt-1.5 text-sm font-medium text-foreground">{t}</p></div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

const OPS: [LucideIcon, string][] = [[QrCode, "Secure staff check-in links"], [Clock3, "Automatically recorded check-in times"], [MapPin, "Clinic and department locations"], [CalendarClock, "Shift schedules"], [Layers, "Attendance history"], [Users, "Coverage patterns"], [Workflow, "Scheduling recommendations"], [Sparkles, "Operational insights"]];

function Operations() {
  return (
    <section className="bg-primary-soft/50">
      <div className="mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-24">
        <Reveal><div className="max-w-3xl"><Eyebrow>Radiology Operations</Eyebrow><H2 className="mt-4">Intelligence beyond the reporting room.</H2><Lead>RadiologyAI.online also helps imaging organizations coordinate the operational side of their departments through staff check-in, shifts, locations, attendance records and AI-generated coverage insights.</Lead></div></Reveal>
        <div className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {OPS.map(([Icon, t], i) => <Reveal key={t} delay={(i % 4) * 60}><div className="flex h-full items-center gap-3 rounded-lg border border-border bg-card px-4 py-3.5"><Icon className="h-4 w-4 shrink-0 text-primary" /><span className="text-sm text-foreground">{t}</span></div></Reveal>)}
        </div>
      </div>
    </section>
  );
}

const WHY = [
  ["One Connected Platform", "Imaging, reasoning, reporting, quality and operations remain connected."],
  ["Faster Documentation", "Transform voice dictation and observations into structured, editable drafts."],
  ["More Consistent Reporting", "Use reusable examination templates and intelligent quality checks."],
  ["Organization-Aware Intelligence", "Maintain relevant study, report and organizational context across connected workflows."],
  ["Professional Control", "Every AI-generated observation, suggestion and report remains editable and subject to qualified professional review."],
  ["Scalable Infrastructure", "Support individual imaging centres, radiology groups and multi-location organizations."],
];

function Why() {
  return (
    <section className="border-y border-border bg-background">
      <div className="mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-28">
        <Reveal><div className="mx-auto max-w-3xl text-center"><Eyebrow>Why RadiologyAI</Eyebrow><H2 className="mt-4">Designed around the way radiology organizations actually work.</H2></div></Reveal>
        <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {WHY.map(([t, d], i) => <Reveal key={t} delay={(i % 3) * 70}><div className="h-full border-l-2 border-primary/25 pl-5"><h3 className="text-lg font-semibold text-foreground">{t}</h3><p className="mt-2 text-sm leading-relaxed text-muted-foreground">{d}</p></div></Reveal>)}
        </div>
      </div>
    </section>
  );
}

const HOW = [
  ["Create your organization", "Set up your radiology department, imaging centre or reporting group."],
  ["Add your imaging workflow", "Upload authorized studies, clinical information, referrals or existing draft reports."],
  ["Work with RadiologyAI", "Use AI-assisted image analysis, clinical reasoning, reporting and quality-review tools."],
  ["Review and save", "Qualified professionals review the outputs, make necessary changes and save approved information within the organization's workflow."],
];

function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-primary-soft/50">
      <div className="mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-28">
        <Reveal><div className="mx-auto max-w-3xl text-center"><Eyebrow>How It Works</Eyebrow><H2 className="mt-4">Introduce AI into your radiology workflow in four steps.</H2></div></Reveal>
        <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {HOW.map(([t, d], i) => (
            <Reveal key={t} delay={i * 70}><div className="h-full rounded-xl border border-border bg-card p-6 shadow-[var(--shadow-card)]"><span className="text-4xl font-semibold tracking-tight text-primary/25">0{i + 1}</span><h3 className="mt-3 text-base font-semibold text-foreground">{t}</h3><p className="mt-2 text-sm leading-relaxed text-muted-foreground">{d}</p></div></Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function Security() {
  return (
    <section className="border-y border-border bg-background">
      <div className="mx-auto grid max-w-7xl gap-12 px-5 py-20 lg:grid-cols-[0.9fr_1.1fr] lg:px-8 lg:py-24">
        <Reveal>
          <div className="max-w-3xl"><Eyebrow>Security and Responsibility</Eyebrow><H2 className="mt-4">Built for responsible professional use.</H2></div>
          <p className="mt-6 rounded-xl border border-primary/25 bg-primary/5 p-5 text-sm leading-relaxed text-foreground">All AI-generated observations, clinical considerations and draft reports require review and approval by appropriately qualified professionals.</p>
        </Reveal>
        <Reveal delay={100}>
          <div className="grid gap-3 sm:grid-cols-2">
            {["Organization-specific workspaces", "Role-based access", "Secure file handling", "Authorized user access", "Audit-ready activity history", "Human review requirements", "Clearly identified AI-generated outputs", "No automatic signing or approval of reports"].map((t) => (
              <div key={t} className={`flex items-start gap-2.5 p-4 ${titleCard}`}><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" /><span className="text-sm text-foreground">{t}</span></div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

type Plan = { id: "free" | "professional" | "business"; name: string; blurb: string; price: number; credits: string; features: string[]; featured?: boolean };
export const PLANS: Plan[] = [
  { id: "free", name: "Free", blurb: "Try the full platform with a small monthly allowance.", price: 0, credits: "200", features: ["Full access to every module", "Study analysis, Copilot, reporting and review", "Patient records and consultation scribe"] },
  { id: "professional", name: "Professional", blurb: "For individual radiologists and steady day-to-day reporting.", price: 47, credits: "4,000", features: ["Full access to every module", "Study analysis, Copilot, reporting and review", "Patient records and consultation scribe"] },
  { id: "business", name: "Business", blurb: "For diagnostic centres, departments and teleradiology teams.", price: 97, credits: "11,000", featured: true, features: ["Full access to every module", "Shared workspace with role-based team access", "Workforce, attendance and operations tools"] },
];
const env = import.meta.env;
export const checkoutUrl = (plan: string, yearly: boolean) =>
  ({ professional: yearly ? env.VITE_CHECKOUT_PRO_YEARLY : env.VITE_CHECKOUT_PRO_MONTHLY, business: yearly ? env.VITE_CHECKOUT_BUSINESS_YEARLY : env.VITE_CHECKOUT_BUSINESS_MONTHLY } as Record<string, string | undefined>)[plan];

function Pricing() {
  const [yearly, setYearly] = useState(false);
  return (
    <section id="pricing" className="bg-primary-soft/50">
      <div className="mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-28">
        <Reveal><div className="mx-auto max-w-3xl text-center"><Eyebrow>Pricing</Eyebrow><H2 className="mt-4">Simple, usage-based pricing.</H2><Lead>Every plan includes the complete platform — study analysis, the Clinical Copilot, reporting, review, patient records and the consultation scribe. Plans differ only in how much monthly AI usage they include.</Lead></div></Reveal>
        <Reveal><div className="mt-8 flex justify-center"><div className="inline-flex rounded-full border border-border bg-background p-1">
          {([["Monthly", false], ["Yearly", true]] as const).map(([l, y]) => <button key={l} type="button" onClick={() => setYearly(y)} className={`rounded-full px-5 py-2 text-sm font-medium transition-colors ${yearly === y ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>{l}</button>)}
        </div></div></Reveal>
        <div className="mx-auto mt-12 grid max-w-5xl gap-5 md:grid-cols-3">
          {PLANS.map((p, i) => {
            const url = checkoutUrl(p.id, yearly);
            const cta = p.id === "free" ? "Start Free" : "Subscribe";
            const cls = btn(p.featured ? "primary" : "outline", "md", "mt-6 w-full");
            return (
              <Reveal key={p.id} delay={i * 70}>
                <div className={`flex h-full flex-col rounded-2xl border bg-card p-6 ${p.featured ? "border-primary/50 shadow-[var(--shadow-elevated)]" : "border-border shadow-[var(--shadow-card)]"}`}>
                  {p.featured && <span className="mb-3 inline-flex w-fit rounded-full bg-primary px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-primary-foreground">Most chosen</span>}
                  <h3 className="text-lg font-semibold text-foreground">{p.name}</h3>
                  <p className="mt-1.5 min-h-10 text-sm text-muted-foreground">{p.blurb}</p>
                  <div className="mt-5">
                    <p className="text-3xl font-semibold tracking-tight text-foreground">${yearly ? p.price * 10 : p.price}<span className="ml-1 text-sm font-medium text-muted-foreground">/{yearly ? "year" : "month"}</span></p>
                    <p className="mt-2 text-sm font-semibold text-primary">{p.credits} AI credits / month</p>
                  </div>
                  <ul className="mt-5 flex-1 space-y-2.5">
                    {[`${p.credits} AI credits per month`, ...p.features].map((f) => <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground"><Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />{f}</li>)}
                  </ul>
                  {p.id === "free" || !url
                    ? <Link to="/auth" className={cls}>{cta}</Link>
                    : <a href={url} target="_blank" rel="noopener noreferrer" className={cls}>{cta}</a>}
                </div>
              </Reveal>
            );
          })}
        </div>
        <p className="mt-6 text-center text-xs text-muted-foreground">Prices are per workspace, not per user. Paid plans open our secure external checkout; after payment your plan is activated on your workspace. You can also subscribe and track your credit usage from Settings inside the application.</p>
      </div>
    </section>
  );
}

const FAQ = [
  ["What is RadiologyAI.online?", "RadiologyAI.online is an AI intelligence and workflow platform for radiology organizations. It connects imaging analysis, clinical reasoning assistance, dictation, structured reporting, report quality review, imaging requests and department operations in one system."],
  ["Who is RadiologyAI.online built for?", "Hospital radiology departments, diagnostic imaging centres, radiology groups, teleradiology companies, specialist clinics, academic medical centres and multi-location imaging organizations."],
  ["Which imaging-study formats can be uploaded?", "Authorized users can upload DICOM files, ZIP archives of a study and standard image formats such as PNG and JPEG, alongside referral documents and existing draft reports."],
  ["Can RadiologyAI create draft radiology reports?", "Yes. Dictation, typed observations and study information are transformed into an editable draft organized by clinical indication, technique, comparison, findings, impression and recommendations."],
  ["Does RadiologyAI automatically approve reports?", "No. Nothing is signed or approved automatically. All AI-generated observations, considerations and draft reports require review and approval by appropriately qualified professionals."],
  ["Can organizations manage multiple users?", "Yes. Each organization has its own workspace with role-based access so administrators can invite colleagues and control what each member can view and manage."],
  ["How is uploaded information handled?", "Uploads and generated records stay inside the organization's workspace, with access limited to authorized members and an activity history available for review."],
  ["Can RadiologyAI support multiple imaging locations?", "Yes. Locations, shifts, staff check-in and coverage insights are designed for organizations coordinating imaging and reporting across several sites."],
];

function Faq() {
  return (
    <section className="border-y border-border bg-background">
      <div className="mx-auto max-w-3xl px-5 py-20 lg:px-8 lg:py-28">
        <Reveal><div className="mx-auto max-w-3xl text-center"><Eyebrow>FAQ</Eyebrow><H2 className="mt-4">Frequently asked questions</H2></div></Reveal>
        <Reveal>
          <Acc.Root type="single" collapsible className="mt-12 w-full">
            {FAQ.map(([q, a], i) => (
              <Acc.Item key={q} value={`i${i}`} className="border-b">
                <Acc.Header className="flex">
                  <Acc.Trigger className="flex flex-1 items-center justify-between py-4 text-left text-base font-medium transition-all hover:underline [&[data-state=open]>svg]:rotate-180 cursor-pointer">
                    {q}<ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200" />
                  </Acc.Trigger>
                </Acc.Header>
                <Acc.Content className="overflow-hidden text-sm data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
                  <div className="pb-4 pt-0 text-sm leading-relaxed text-muted-foreground">{a}</div>
                </Acc.Content>
              </Acc.Item>
            ))}
          </Acc.Root>
        </Reveal>
      </div>
    </section>
  );
}

function FinalCta() {
  return (
    <section className="relative overflow-hidden" style={{ background: "var(--gradient-hero)" }}>
      <div className="pointer-events-none absolute -bottom-32 left-1/2 h-[26rem] w-[52rem] -translate-x-1/2 rounded-full opacity-30 blur-3xl" style={{ background: "var(--gradient-primary)" }} />
      <div className="relative mx-auto max-w-3xl px-5 py-24 text-center lg:py-28">
        <Reveal>
          <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl lg:text-5xl">Bring AI intelligence into your radiology organization.</h2>
          <p className="mt-6 text-lg leading-relaxed text-muted-foreground">Connect imaging review, clinical reasoning, reporting, quality assurance and department operations through one powerful AI platform.</p>
          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <LinkButton to="/auth" size="lg">Create Your Organization <ArrowRight className="ml-1 h-4 w-4" /></LinkButton>
            <LinkButton to="/auth" variant="outline" size="lg">Sign In</LinkButton>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function Footer() {
  const col = (title: string, links: [string, string][]) => (
    <div><h3 className="text-sm font-semibold text-foreground">{title}</h3>
      <ul className="mt-4 space-y-2.5">{links.map(([l, h]) => <li key={l}>{h.startsWith("/") ? <Link to={h} className="text-sm text-muted-foreground transition-colors hover:text-primary">{l}</Link> : <a href={h} className="text-sm text-muted-foreground transition-colors hover:text-primary">{l}</a>}</li>)}</ul>
    </div>
  );
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <Logo />
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">AI intelligence, reporting and workflow infrastructure for modern radiology organizations.</p>
            <div className="mt-6 flex gap-2"><LinkButton to="/auth" variant="outline" size="sm">Sign In</LinkButton><LinkButton to="/auth" size="sm">Get Started</LinkButton></div>
          </div>
          {col("Platform", [["AI Image Analysis", "#solutions"], ["Clinical Copilot", "#platform"], ["Dictation and Reporting", "#platform"], ["Report Quality Review", "#platform"], ["Workforce Intelligence", "#platform"]])}
          {col("Solutions", [["Hospital departments", "#organizations"], ["Diagnostic imaging centres", "#organizations"], ["Radiology groups", "#organizations"], ["Teleradiology companies", "#organizations"], ["How It Works", "#how-it-works"]])}
          {col("Company", [["Pricing", "#pricing"], ["Privacy Policy", "/privacy"], ["Terms of Service", "/terms"], ["Contact", "mailto:hello@radiologyai.online"]])}
        </div>
        <div className="mt-12 flex flex-col gap-3 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} RadiologyAI.online</p>
          <p>AI-generated outputs require review and approval by qualified professionals.</p>
        </div>
      </div>
    </footer>
  );
}

export default function Landing() {
  return (
    <div id="top">
      <Header />
      <main>
        <Hero /><Organizations /><Platform /><ImageIntelligence /><Reporting /><Copilot /><Quality /><Flow /><Operations /><Why /><HowItWorks /><Security /><Pricing /><Faq /><FinalCta />
      </main>
      <Footer />
    </div>
  );
}
