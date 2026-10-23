import React from "react";
import { STATUSES, STATUS_STYLES } from "@/lib/content";

export default function StatusBadge({ status }) {
  const match = STATUSES.find((entry) => entry.value === status);

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium ${STATUS_STYLES[status] || ""}`}>
      {match ? match.label : status}
    </span>
  );
}