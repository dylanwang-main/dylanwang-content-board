import InstagramConnect from "@/components/settings/InstagramConnect";
import TikTokConnect from "@/components/settings/TikTokConnect";
import YouTubeConnect from "@/components/settings/YouTubeConnect";

export default function ConnectedChannels() {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="font-heading text-xl font-semibold">Connected channels</h2>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Pull in the numbers behind your posts so your content decisions start from real data.
        </p>
      </div>

      <div className="space-y-4">
        <InstagramConnect />
        <TikTokConnect />
        <YouTubeConnect />
      </div>
    </section>
  );
}