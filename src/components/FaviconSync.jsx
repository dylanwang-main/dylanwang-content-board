import { useEffect } from "react";
import { useMe } from "@/hooks/useCreatorData";

const DEFAULT_FAVICON = "https://base44.com/logo_v2.svg";

export default function FaviconSync() {
  const { data: me } = useMe();
  const href = me?.logo_url || DEFAULT_FAVICON;

  useEffect(() => {
    let link = document.querySelector("link[rel~='icon']");

    if (!link) {
      link = document.createElement("link");
      link.rel = "icon";
      document.head.appendChild(link);
    }

    link.removeAttribute("type");
    link.href = href;
  }, [href]);

  return null;
}