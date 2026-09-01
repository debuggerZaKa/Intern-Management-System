import React from "react";
import BlockerItem from "./BlockerItem";
import EmptyState from "../common/EmptyState";
import { AlertCircle } from "lucide-react";

export default function BlockerList({ blockers = [], onResolveBlocker }) {
  if (!blockers || blockers.length === 0) {
    return (
      <EmptyState
        icon={AlertCircle}
        title="No active blockers"
        description="All roadblocks are currently resolved."
      />
    );
  }

  return (
    <div className="space-y-2.5">
      {blockers.map((blocker) => (
        <BlockerItem
          key={blocker.id}
          blocker={blocker}
          onResolve={onResolveBlocker}
        />
      ))}
    </div>
  );
}
