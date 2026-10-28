import { useState } from "react";
import PageHeader from "@/components/kit/PageHeader";
import YouTubeCreate from "@/components/youtube/YouTubeCreate";
import YouTubePipeline from "@/components/youtube/YouTubePipeline";
import YouTubeVideos from "@/components/youtube/YouTubeVideos";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function YouTube() {
  const [tab, setTab] = useState("create");
  const [focusId, setFocusId] = useState(null);

  const openPipeline = (id) => {
    setFocusId(id || null);
    setTab("pipeline");
  };

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="YouTube"
        title="Plan and track YouTube"
        description="Turn a topic into a full video plan, track it to published, and sync your channel."
      />

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="rounded-full">
          <TabsTrigger value="create" className="rounded-full px-4">
            Create
          </TabsTrigger>
          <TabsTrigger value="pipeline" className="rounded-full px-4">
            Pipeline
          </TabsTrigger>
          <TabsTrigger value="videos" className="rounded-full px-4">
            Videos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="create" className="mt-6">
          <YouTubeCreate onOpenPipeline={openPipeline} />
        </TabsContent>

        <TabsContent value="pipeline" className="mt-6">
          <YouTubePipeline focusId={focusId} onFocusHandled={() => setFocusId(null)} />
        </TabsContent>

        <TabsContent value="videos" className="mt-6">
          <YouTubeVideos />
        </TabsContent>
      </Tabs>
    </div>
  );
}