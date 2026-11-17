import { useRef, useState } from "react";
import { ImageUp, Loader2, X } from "lucide-react";
import { api } from "@/api/db";
import { Button } from "@/components/ui/button";
import { Image } from "@/components/ui/image";

export default function LogoUpload({ value, onChange }) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  const handleFile = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setUploading(true);

    try {
      const { file_url } = await api.integrations.Core.UploadPublicFile({ file });
      onChange(file_url);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-4">
      <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-xl border border-border/70 bg-secondary/40">
        {value ? (
          <Image src={value} alt="Your logo" className="h-full w-full" fittingType="fit" />
        ) : (
          <ImageUp className="h-5 w-5 text-muted-foreground" />
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFile}
      />

      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="outline"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
        >
          {uploading ? <Loader2 className="animate-spin" /> : null}
          {value ? "Replace logo" : "Upload logo"}
        </Button>

        {value && (
          <Button type="button" variant="ghost" onClick={() => onChange("")}>
            <X />
            Remove
          </Button>
        )}
      </div>
    </div>
  );
}