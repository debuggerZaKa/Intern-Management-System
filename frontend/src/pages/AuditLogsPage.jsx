import React, { useState, useEffect } from "react";
import { adminService } from "../services/adminService";
import AppLayout from "../components/common/AppLayout";
import AuditLogsViewer from "../components/admin/AuditLogsViewer";
import Loader from "../components/common/Loader";
import ErrorMessage from "../components/common/ErrorMessage";

export default function AuditLogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadLogs = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminService.getAuditLogs(150);
      setLogs(data || []);
    } catch (err) {
      console.error("Failed to load audit logs:", err);
      setError(err.message || "Failed to load system audit logs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">System Security & Audit Trail</h2>
          <p className="text-xs text-slate-500">
            Immutable records of administrative operations, account activations, and permission modifications
          </p>
        </div>

        {error && <ErrorMessage message={error} onClose={() => setError(null)} />}

        {loading ? <Loader message="Loading system audit logs..." /> : <AuditLogsViewer logs={logs} />}
      </div>
    </AppLayout>
  );
}
