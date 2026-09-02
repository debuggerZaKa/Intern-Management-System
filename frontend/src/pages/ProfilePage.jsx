import React from "react";
import AppLayout from "../components/common/AppLayout";
import ProfileSettings from "../components/intern/ProfileSettings";

export default function ProfilePage() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <ProfileSettings />
      </div>
    </AppLayout>
  );
}
