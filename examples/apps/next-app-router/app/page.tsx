import { RequestAccess } from "./RequestAccess";

const highlights = [
  ["12", "Active projects"],
  ["4", "Pending reviews"],
  ["98%", "Policy coverage"],
];

export default function HomePage() {
  return (
    <main id="main" className="mainContent">
      <section id="overview" className="hero" aria-labelledby="page-title">
        <div>
          <p className="eyebrow">Platform workspace</p>
          <h1 id="page-title">A production-minded App Router start</h1>
          <p>Compose responsive application pages while keeping interactive client boundaries focused.</p>
        </div>
        <RequestAccess />
      </section>
      <section aria-label="Workspace highlights" className="metrics">
        {highlights.map(([value, label]) => (
          <article key={label} className="metricCard">
            <strong>{value}</strong>
            <span>{label}</span>
          </article>
        ))}
      </section>
      <section id="activity" className="contentCard">
        <h2>Recent activity</h2>
        <p>Design review completed for the onboarding workflow.</p>
        <p>Accessibility checks passed for the latest release candidate.</p>
      </section>
    </main>
  );
}
