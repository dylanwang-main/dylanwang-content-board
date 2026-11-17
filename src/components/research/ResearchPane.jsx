import PageLoader from "@/components/kit/PageLoader";

export default function ResearchPane({ isLoading, isEmpty, children }) {
  if (isLoading) return <PageLoader />;

  if (isEmpty) {
    return (
      <div className="rounded-xl border border-border/60 bg-card/80 p-10 text-center shadow-sm">
        <p className="text-sm text-muted-foreground">
          No research yet. Run the page scanner to get started.
        </p>
      </div>
    );
  }

  return children;
}