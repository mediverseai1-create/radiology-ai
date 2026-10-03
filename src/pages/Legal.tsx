import { Link } from "react-router-dom";
import { Logo } from "../components/ui";

type Doc = { title: string; intro: string; sections: [string, string][] };

const DOCS: Record<"privacy" | "terms", Doc> = {
  privacy: {
    title: "Privacy Policy",
    intro: "This policy explains how RadiologyAI.online handles information inside organization workspaces.",
    sections: [
      ["Information we process", "We process account details, organization membership records, uploaded imaging studies and documents, generated observations and reports, and operational records such as locations, shifts and attendance entries created by authorized members."],
      ["How information is used", "Information is used to operate the workspace: organizing studies, producing AI-assisted observations and draft reports, running quality checks and supporting department operations. Outputs are always presented for review by qualified professionals."],
      ["Access and isolation", "Records belong to the organization that created them. Access is limited to authorized members of that organization according to their assigned role."],
      ["AI processing", "Content submitted for analysis is sent to AI model providers solely to generate the requested output. AI-generated content is clearly identified and is never signed or approved automatically."],
      ["Retention and deletion", "Records remain available to the organization until removed by an authorized member. Organization administrators may request deletion of workspace data."],
      ["Contact", "Questions about this policy can be sent to hello@radiologyai.online."],
    ],
  },
  terms: {
    title: "Terms of Service",
    intro: "These terms govern use of the RadiologyAI.online platform by organizations and their members.",
    sections: [
      ["Professional use only", "RadiologyAI.online is intended for use by appropriately qualified professionals and the organizations they work within. It provides clinical decision support and workflow tooling; it does not provide a diagnosis."],
      ["Professional responsibility", "All AI-generated observations, considerations and draft reports require review, editing where necessary, and approval by a qualified professional. Nothing is signed or approved automatically by the platform."],
      ["Authorized content", "Members may only upload imaging studies, referrals and documents they are authorized to process, and must comply with applicable clinical, privacy and data-protection obligations."],
      ["Accounts and access", "Organization administrators are responsible for managing members, roles and access. Credentials must not be shared between individuals."],
      ["Availability and changes", "The platform is provided on an ongoing basis and features may change as the service develops. We may update these terms and will reflect changes on this page."],
      ["Contact", "Questions about these terms can be sent to hello@radiologyai.online."],
    ],
  },
};

export default function Legal({ kind }: { kind: keyof typeof DOCS }) {
  const d = DOCS[kind];
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 lg:px-8">
          <Link to="/"><Logo /></Link>
          <Link to="/" className="text-sm font-medium text-muted-foreground hover:text-foreground">Back to home</Link>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-5 py-16">
        <h1 className="text-4xl font-semibold tracking-tight text-foreground">{d.title}</h1>
        <p className="mt-4 text-sm text-muted-foreground">{d.intro}</p>
        <div className="mt-10 space-y-8">
          {d.sections.map(([h, p]) => (
            <section key={h}><h2 className="text-lg font-semibold text-foreground">{h}</h2><p className="mt-2 text-sm leading-relaxed text-muted-foreground">{p}</p></section>
          ))}
        </div>
      </main>
    </div>
  );
}
