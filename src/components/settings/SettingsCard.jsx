export default function SettingsCard({ title, description, children }) {
  return (
    <section className="rounded-3xl border border-border/70 bg-card/70 p-5 shadow-lg shadow-black/20 sm:p-6">
      <h2 className="font-heading text-[18px] font-semibold">{title}</h2>
      {description && (
        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{description}</p>
      )}
      <div className="mt-6 space-y-5">{children}</div>
    </section>
  );
}