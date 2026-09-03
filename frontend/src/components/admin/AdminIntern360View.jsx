import React from "react";
import InternDetailView from "../mentor/InternDetailView";

export default function AdminIntern360View({ internId, onBack }) {
  return <InternDetailView internId={internId} onBack={onBack} isAdmin={true} />;
}
