import React from "react";
import UserItem from "./UserItem";
import EmptyState from "../common/EmptyState";
import { Users } from "lucide-react";

export default function UserList({ users = [], onAction }) {
  if (!users || users.length === 0) {
    return (
      <EmptyState
        icon={Users}
        title="No users found"
        description="No users match the selected filters."
      />
    );
  }

  return (
    <div className="space-y-2.5">
      {users.map((user) => (
        <UserItem key={user.id} user={user} onAction={onAction} />
      ))}
    </div>
  );
}
