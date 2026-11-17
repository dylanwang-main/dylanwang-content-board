import { useState } from "react";
import { Trash2 } from "lucide-react";
import ContentForm from "@/components/library/ContentForm";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useDeleteContent, useSaveContent } from "@/hooks/useCreatorData";

export default function ContentDialog({ item, onClose, platforms, pillars }) {
  const save = useSaveContent();
  const remove = useDeleteContent();
  const [confirming, setConfirming] = useState(false);

  const handleSubmit = async (data) => {
    await save.mutateAsync({ id: item.id, data });
    onClose();
  };

  const handleDelete = async () => {
    if (!confirming) {
      setConfirming(true);
      return;
    }

    await remove.mutateAsync(item.id);
    onClose();
  };

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="max-h-[92vh] w-[calc(100vw-1.5rem)] max-w-5xl overflow-y-auto rounded-lg">
        <DialogHeader>
          <DialogTitle className="text-[11px] font-medium text-primary">
            Edit piece
          </DialogTitle>
        </DialogHeader>

        <ContentForm
          key={item.id}
          initial={item}
          platforms={platforms}
          pillars={pillars}
          onSubmit={handleSubmit}
          submitting={save.isPending}
          submitLabel="Save changes"
          footer={
            <Button
              type="button"
              variant="ghost"
              onClick={handleDelete}
              disabled={remove.isPending}
              className="rounded-full text-destructive hover:text-destructive"
            >
              <Trash2 />
              {confirming ? "Click again to delete" : "Delete"}
            </Button>
          }
        />
      </DialogContent>
    </Dialog>
  );
}