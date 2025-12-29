"use client";

import { ProfileForm } from "@/components/dashboard/settings/profileForm";
import { RepositoryList } from "@/components/dashboard/settings/repositoryList";
import { AISettings } from "@/components/dashboard/settings/ai-settings";

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
      <AISettings />
      <RepositoryList />
    </div>
  );
};

export default SettingsPage;
