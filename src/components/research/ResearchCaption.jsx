export default function ResearchCaption({ record }) {
  if (!record) return null;

  return (
    <p className="text-sm text-muted-foreground">
      Showing: <span className="text-foreground">{record.source}</span> · {record.platform}
    </p>
  );
}