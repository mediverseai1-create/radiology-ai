import { useEffect, useRef, useState, type ReactNode, type AnchorHTMLAttributes, type ButtonHTMLAttributes } from "react";
import { Link } from "react-router-dom";

const base = "inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0";
const variants = {
  primary: "bg-primary text-primary-foreground shadow hover:bg-primary/90",
  outline: "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
  ghost: "hover:bg-accent hover:text-accent-foreground",
};
const sizes = {
  sm: "h-8 rounded-md px-3 text-xs",
  md: "h-9 rounded-md px-4 py-2 text-sm",
  lg: "h-12 rounded-md px-7 text-base",
};
export const btn = (v: keyof typeof variants = "primary", s: keyof typeof sizes = "md", extra = "") => `${base} ${variants[v]} ${sizes[s]} ${extra}`;

export function LinkButton({ to, variant, size, className = "", ...p }: { to: string; variant?: keyof typeof variants; size?: keyof typeof sizes } & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href">) {
  const cls = btn(variant, size, className);
  return to.startsWith("#") ? <a href={to} className={cls} {...p} /> : <Link to={to} className={cls} {...(p as object)} />;
}
export function Button({ variant, size, className = "", ...p }: { variant?: keyof typeof variants; size?: keyof typeof sizes } & ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button className={btn(variant, size, className)} {...p} />;
}

export function Logo({ size = "h-8 w-8" }: { size?: string }) {
  return (
    <span className="flex items-center gap-2.5">
      <img src="/logo.svg" alt="RadiologyAI logo" className={`object-contain ${size}`} />
      <span className="text-[17px] font-semibold tracking-tight text-foreground">RadiologyAI<span className="text-primary">.online</span></span>
    </span>
  );
}

/** Scroll-reveal wrapper (matches .rai-reveal on the reference). */
export function Reveal({ children, delay = 0, className = "" }: { children: ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setShown(true); io.disconnect(); } }, { threshold: 0.12 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return <div ref={ref} className={`rai-reveal ${shown ? "rai-reveal-in" : ""} ${className}`} style={{ transitionDelay: `${delay}ms` }}>{children}</div>;
}

export function WindowChrome({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-elevated)]">
      <div className="flex items-center gap-2 border-b border-border bg-secondary/60 px-4 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-destructive/40" />
        <span className="h-2.5 w-2.5 rounded-full bg-warning/50" />
        <span className="h-2.5 w-2.5 rounded-full bg-success/50" />
        <span className="ml-3 truncate text-[11px] font-medium tracking-wide text-muted-foreground">{title}</span>
      </div>
      {children}
    </div>
  );
}

export const Eyebrow = ({ children }: { children: ReactNode }) => <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">{children}</p>;
export const H2 = ({ children, className = "" }: { children: ReactNode; className?: string }) => <h2 className={`text-3xl font-semibold tracking-tight text-foreground sm:text-4xl lg:text-[2.75rem] lg:leading-[1.1] ${className}`}>{children}</h2>;
export const Lead = ({ children }: { children: ReactNode }) => <p className="mt-5 text-lg leading-relaxed text-muted-foreground">{children}</p>;
export const Bars = ({ a, b, second = "bg-foreground/15" }: { a: number; b: number; second?: string }) => (
  <div className="space-y-1.5"><span className="block h-2 rounded-full bg-muted" style={{ width: `${a}%` }} /><span className={`block h-2 rounded-full ${second}`} style={{ width: `${b}%` }} /></div>
);
