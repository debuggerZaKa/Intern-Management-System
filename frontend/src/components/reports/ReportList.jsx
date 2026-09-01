import React from "react";
import ReportItem from "./ReportItem";
import EmptyState from "../common/EmptyState";
import { FileText } from "lucide-react";

export default function ReportList({ reports = [], onSelectReport }) {
  if (!reports || reports.length === 0) {
    return (
      <EmptyState
        icon={FileText}
        title="No reports listed"
        description="Weekly reports submitted by interns will appear here."
      />
    );
  }

  return (
    <div className="space-y-2.5">
      {reports.map((report) => (
        <ReportItem
          key={report.id}
          report={report}
          onSelect={onSelectReport}
        />
      ))}
    </div>
  );
}
