"use client";

import { ProfileForm } from "@/components/dashboard/settings/profileForm";

const SettingsPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account setting and connected Repositories.
        </p>
      </div>
      <ProfileForm />
    </div>
  );
};

export default SettingsPage;
