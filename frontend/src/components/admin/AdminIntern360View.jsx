import React from "react";
import InternDetailView from "../mentor/InternDetailView";

export default function AdminIntern360View({
  internId,
  initialTrackId = null,
  defaultToCompleted = false,
  onBack,
}) {
  return (
    <InternDetailView
      internId={internId}
      initialTrackId={initialTrackId}
      defaultToCompleted={defaultToCompleted}
      onBack={onBack}
      isAdmin={true}
    />
  );
}
