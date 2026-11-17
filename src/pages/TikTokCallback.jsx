import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { api } from "@/api/db";
import { checkTikTokState, tiktokCall, tiktokRedirectUri } from "@/lib/tiktok";

// TikTok sends you back here with ?code=…&state=…; trade the code for tokens
// on the server, run a first sync, then land on the TikTok page.
export default function TikTokCallback() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [step, setStep] = useState("Connecting TikTok…");
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    (async () => {
      try {
        if (params.get("error")) throw new Error(params.get("error_description") || "TikTok login was cancelled.");
        if (!checkTikTokState(params.get("state"))) throw new Error("This login link expired. Start again from Settings.");
        await tiktokCall("exchange", { code: params.get("code"), redirect_uri: tiktokRedirectUri() });
        setStep("Pulling your videos…");
        await api.functions.invoke("syncTikTok", {}).catch(() => {});
        navigate("/tiktok", { replace: true });
      } catch (e) {
        setError(e.message);
      }
    })();
  }, [params, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      {error ? (
        <div className="max-w-sm space-y-3 text-center">
          <p className="text-sm text-destructive">{error}</p>
          <Link to="/settings" className="text-sm text-primary hover:underline">
            Back to Settings
          </Link>
        </div>
      ) : (
        <p className="inline-flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> {step}
        </p>
      )}
    </div>
  );
}
