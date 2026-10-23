import PageHeader from "@/components/kit/PageHeader";
import PageLoader from "@/components/kit/PageLoader";
import SettingsForm from "@/components/settings/SettingsForm";
import { useMe } from "@/hooks/useCreatorData";

export default function Settings() {
  const { data: me, isLoading } = useMe();

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
        <div className="mx-auto max-w-3xl">
          <SettingsForm me={me} />
        </div>
      )}
    </div>
  );
}