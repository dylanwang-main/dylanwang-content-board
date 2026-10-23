import { useRef, useState } from "react";
import { Loader2, Upload } from "lucide-react";
import { useUploadBrainFile } from "@/hooks/useBrain";
import { BRAIN_ACCEPT, BRAIN_MAX_BYTES } from "@/lib/brain";

export default function SectionUploader({ section }) {
  const upload = useUploadBrainFile();
  const inputRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const handleFiles = async (fileList) => {
    const files = Array.from(fileList || []);
    if (files.length === 0) return;

    const oversized = files.filter((file) => file.size > BRAIN_MAX_BYTES);
    const accepted = files.filter((file) => file.size <= BRAIN_MAX_BYTES);

    setError(
      oversized.length
        ? `${oversized.map((file) => file.name).join(", ")} is over 20 MB and was skipped.`
        : ""
    );

    if (accepted.length === 0) return;

    setBusy(true);
    try {
      for (const file of accepted) {
        await upload.mutateAsync({ section, file });
      }
    } catch (uploadError) {
      setError(uploadError?.message || "That file could not be uploaded. Please try again.");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div>
      <button
        type="button"
        disabled={busy}
        onClick={() => inputRef.current?.click()}
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          handleFiles(event.dataTransfer.files);
        }}
        className="flex w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-primary/40 bg-accent/40 px-6 py-8 text-center transition-colors hover:bg-accent/70 disabled:cursor-not-allowed"
      >
        {busy ? (
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
        ) : (
          <Upload className="h-5 w-5 text-primary" />
        )}
        <span className="text-sm font-medium">
          {busy ? "Uploading…" : "Drop files or click to upload"}
        </span>
        <span className="text-xs text-muted-foreground">
          PDF, TXT, MD, CSV or images · up to 20 MB each
        </span>
      </button>

      <input
        ref={inputRef}
        type="file"
        multiple
        accept={BRAIN_ACCEPT}
        className="hidden"
        onChange={(event) => handleFiles(event.target.files)}
      />

      {error && <p className="mt-2 text-xs text-destructive">{error}</p>}
    </div>
  );
}