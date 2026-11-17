import AvatarField from "@/components/research/AvatarField";
import BulletList from "@/components/research/BulletList";

export default function AvatarCard({ label, avatar, highlighted = false }) {
  if (!avatar) return null;

  return (
    <div
      className={`rounded-lg border p-5 ${
        highlighted ? "border-primary/50 bg-primary/5" : "border-border/60 bg-card/70"
      }`}
    >
      <p className="text-xs text-primary">{label}</p>
      <h3 className="mt-2 font-heading text-xl">{avatar.name}</h3>
      {avatar.description && (
        <p className="mt-1 text-sm text-muted-foreground">{avatar.description}</p>
      )}

      <div className="mt-4 space-y-4">
        <AvatarField label="Primary desire" value={avatar.primary_desire} />
        <AvatarField label="Defining experience" value={avatar.defining_experience} />
        <BulletList title="Main problems" items={avatar.main_problems} />
      </div>
    </div>
  );
}