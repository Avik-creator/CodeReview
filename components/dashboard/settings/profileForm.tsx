"use client";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getUserProfile, updateUserProfile } from "@/app/actions/settings";
import { useState } from "react";
import { toast } from "sonner";
import { Calendar, Mail, Save, User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDate, getInitials } from "@/lib/utils";

export const ProfileForm = () => {
  const queryClient = useQueryClient();

  const { data: profileData, isLoading } = useQuery({
    queryKey: ["userProfile"],
    queryFn: async () => await getUserProfile(),
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  });

  // Initialize state directly from profileData - React Query handles the updates
  const [name, setName] = useState(profileData?.name ?? "");
  const [email, setEmail] = useState(profileData?.email ?? "");

  // Update local state when profileData changes, but only if it's actually different
  // This prevents unnecessary re-renders
  if (
    profileData &&
    (name !== (profileData.name ?? "") || email !== (profileData.email ?? ""))
  ) {
    setName(profileData.name ?? "");
    setEmail(profileData.email ?? "");
  }

  const updateMutation = useMutation({
    mutationFn: async (data: { name: string; email: string }) =>
      await updateUserProfile(data),
    onSuccess: (data) => {
      if (data.success) {
        toast.success("Profile updated successfully");
        queryClient.invalidateQueries({ queryKey: ["userProfile"] });
      } else {
        toast.error(data.error || "Failed to update profile");
      }
    },
    onError: () => {
      toast.error("An unexpected error occurred");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate({ name, email });
  };

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Profile Header Card */}
      <Card className="border-border/50 bg-linear-to-br from-card to-card/50">
        <CardContent className="p-4 sm:p-6 pt-4 sm:pt-6">
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
            <Avatar className="h-16 w-16 sm:h-20 sm:w-20 border-2 border-primary/20 shadow-lg shrink-0">
              <AvatarImage
                src={profileData?.image || "/placeholder.svg"}
                alt={profileData?.name || "User"}
              />
              <AvatarFallback className="text-base sm:text-lg font-semibold bg-primary/10 text-primary">
                {getInitials(profileData?.name || "")}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 text-center sm:text-left w-full">
              <h2 className="text-xl sm:text-2xl font-bold text-foreground wrap-break-word">
                {profileData?.name}
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground flex items-center justify-center sm:justify-start gap-2 mt-1 flex-wrap">
                <Mail className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                <span className="break-all">{profileData?.email}</span>
              </p>
              <div className="flex items-center gap-2 mt-2 sm:mt-3 text-xs sm:text-sm text-muted-foreground justify-center sm:justify-start">
                <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                <span>
                  Joined {formatDate(new Date(profileData?.createdAt || ""))}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile Edit Form */}
      <Card className="border-border/50">
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <User className="h-4 w-4 sm:h-5 sm:w-5 text-primary shrink-0" />
            <span>Profile Information</span>
          </CardTitle>
          <CardDescription className="text-sm">
            Update your account details and preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0">
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            <div className="space-y-3 sm:space-y-4">
              {/* Name Field */}
              <div className="space-y-2">
                <Label
                  htmlFor="name"
                  className="text-sm font-medium text-foreground"
                >
                  Full Name
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground shrink-0" />
                  <Input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                    className="pl-10 bg-background border-border focus:border-primary focus:ring-primary/20 text-sm sm:text-base"
                    required
                  />
                </div>
              </div>

              {/* Email Field */}
              <div className="space-y-2">
                <Label
                  htmlFor="email"
                  className="text-sm font-medium text-foreground"
                >
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground shrink-0" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your.email@example.com"
                    className="pl-10 bg-background border-border focus:border-primary focus:ring-primary/20 text-sm sm:text-base"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 pt-4 border-t border-border">
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium shadow-md hover:shadow-lg transition-all w-full sm:w-auto text-sm sm:text-base"
              >
                {isLoading ? (
                  <>
                    <div className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setName(profileData?.name || "");
                  setEmail(profileData?.email || "");
                }}
                disabled={isLoading}
                className="border-border hover:bg-muted w-full sm:w-auto text-sm sm:text-base"
              >
                Reset
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
