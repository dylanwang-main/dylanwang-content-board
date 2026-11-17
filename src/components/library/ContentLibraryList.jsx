import LibraryRow from "@/components/library/LibraryRow";

export default function ContentLibraryList({ items, onSelect }) {
  return (
    <div className="rounded-xl border border-border/60 bg-card/70 p-2 sm:p-3">
      {items.length === 0 ? (
        <p className="py-10 text-center text-sm text-muted-foreground">
          Nothing matches these filters.
        </p>
      ) : (
        <div className="flex flex-col gap-1">
          {items.map((item) => (
            <LibraryRow key={item.id} item={item} onSelect={onSelect} />
          ))}
        </div>
      )}
    </div>
  );
}