import React from "react";
import AppLayout from "../components/common/AppLayout";
import ProfileSettings from "../components/intern/ProfileSettings";

export default function ProfilePage() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">Account & Profile Settings</h2>
          <p className="text-xs text-slate-500">
            Manage your personal profile, academic background, contact info, and portfolio links
          </p>
        </div>

        <ProfileSettings />
      </div>
    </AppLayout>
  );
}
