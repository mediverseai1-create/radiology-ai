import { NavLink, Navigate, Route, Routes } from "react-router-dom";
import { Brain, CalendarClock, ClipboardCheck, FileText, Images, LayoutDashboard, LogOut, Settings as Cog, Stethoscope, Users, Workflow, Mic } from "lucide-react";
import { useAuth } from "../../lib/auth";
import { Logo } from "../../components/ui";
import { Overview, Studies, CopilotPage, Reporting, Requests, Workforce, Patients, Scribe, SettingsPage } from "./Modules";

const NAV = [
  ["", "Overview", LayoutDashboard], ["studies", "Studies", Images], ["copilot", "Copilot", Brain], ["reporting", "Reporting", FileText],
  ["requests", "Imaging Requests", Workflow], ["patients", "Patients", Users], ["scribe", "Scribe", Mic], ["workforce", "Workforce", CalendarClock], ["settings", "Settings", Cog],
] as const;

export default function AppShell() {
  const { session, loading, org, signOut } = useAuth();
  if (loading) return <div className="grid min-h-screen place-items-center text-sm text-muted-foreground">Loading…</div>;
  if (!session) return <Navigate to="/auth" replace />;
  const used = org ? Math.round((org.credits_used / Math.max(org.credits_total, 1)) * 100) : 0;
  return (
    <div className="grid min-h-screen lg:grid-cols-[240px_1fr]">
      <aside className="flex flex-col border-b border-border bg-card p-4 lg:border-b-0 lg:border-r">
        <Logo />
        <p className="mt-4 truncate rounded-md bg-secondary px-2.5 py-1.5 text-xs font-medium text-secondary-foreground"><Stethoscope className="mr-1.5 inline h-3 w-3" />{org?.name ?? "Workspace"}</p>
        <nav className="mt-4 flex gap-1 overflow-x-auto lg:flex-1 lg:flex-col">
          {NAV.map(([to, label, Icon]) => (
            <NavLink key={to} to={`/app/${to}`} end={to === ""} className={({ isActive }) => `flex items-center gap-2.5 whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium transition-colors ${isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-secondary hover:text-foreground"}`}>
              <Icon className="h-4 w-4" />{label}
            </NavLink>
          ))}
        </nav>
        {org && (
          <div className="mt-4 hidden rounded-lg border border-border p-3 text-xs lg:block">
            <div className="flex justify-between font-medium"><span className="capitalize">{org.plan}</span><span>{org.credits_used}/{org.credits_total}</span></div>
            <div className="mt-2 h-1.5 rounded-full bg-muted"><div className="h-full rounded-full bg-primary" style={{ width: `${Math.min(used, 100)}%` }} /></div>
            <p className="mt-1.5 text-muted-foreground">AI credits used</p>
          </div>
        )}
        <button onClick={signOut} className="mt-3 flex items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground"><LogOut className="h-4 w-4" />Sign out</button>
      </aside>
      <main className="min-w-0 bg-muted/40 p-5 lg:p-8">
        <Routes>
          <Route index element={<Overview />} />
          <Route path="studies" element={<Studies />} />
          <Route path="copilot" element={<CopilotPage />} />
          <Route path="reporting" element={<Reporting />} />
          <Route path="requests" element={<Requests />} />
          <Route path="patients" element={<Patients />} />
          <Route path="scribe" element={<Scribe />} />
          <Route path="workforce" element={<Workforce />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/app" replace />} />
        </Routes>
        <p className="mt-10 text-xs text-muted-foreground"><ClipboardCheck className="mr-1 inline h-3 w-3" />AI-generated outputs require review and approval by qualified professionals.</p>
      </main>
    </div>
  );
}
