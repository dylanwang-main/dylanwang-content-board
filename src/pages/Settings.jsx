import PageHeader from "@/components/kit/PageHeader";
import PageLoader from "@/components/kit/PageLoader";
import ConnectedChannels from "@/components/settings/ConnectedChannels";
import SettingsForm from "@/components/settings/SettingsForm";
import AiKeysCard from "@/components/settings/AiKeysCard";
import { useMe } from "@/hooks/useCreatorData";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export default function Settings() {
  const { data: me, isLoading } = useMe();
  const { logout, isGuest } = useAuth();

  return (
    <div className="space-y-10">
      <PageHeader
        eyebrow="Settings"
        title="Settings"
        description="Your profile, your goals, your platforms"
      />

      {isLoading || !me ? (
        <PageLoader />
      ) : (
        <div className="mx-auto max-w-3xl space-y-6">
          <SettingsForm me={me} />
          <AiKeysCard />
          <ConnectedChannels />
          <div className="flex items-center justify-between rounded-3xl border border-border/70 bg-card/70 p-6">
            <p className="text-sm text-muted-foreground">
              {isGuest ? (
                "You're using a demo workspace."
              ) : (
                <>
                  Signed in as <span className="text-foreground">{me.email}</span>
                </>
              )}
            </p>
            <Button variant="outline" className="rounded-full" onClick={logout}>
              <LogOut className="mr-2 h-4 w-4" />
              {isGuest ? "Reset demo" : "Sign out"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}