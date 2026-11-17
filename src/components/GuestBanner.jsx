import { Link } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";

// Shown to guests so it's clear this is a private demo, and how to keep it.
export default function GuestBanner() {
  const { isGuest } = useAuth();
  if (!isGuest) return null;

  return (
    <div className="mb-6 flex flex-col gap-3 rounded-lg border border-primary/25 bg-primary/5 px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between">
      <p className="flex items-start gap-2 text-muted-foreground">
        <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-primary" strokeWidth={1.5} />
        <span>
          <span className="font-medium text-foreground">You're in a demo workspace.</span> It's filled with sample
          data, private to you, and resets after 24 hours.
        </span>
      </p>
      <div className="flex shrink-0 gap-3">
        <Link to="/register" className="font-medium text-primary hover:underline">
          Create account to keep it
        </Link>
        <Link to="/login" className="text-muted-foreground hover:text-foreground">
          Log in
        </Link>
      </div>
    </div>
  );
}
