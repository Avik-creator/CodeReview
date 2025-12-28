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
import { useState, useMemo } from "react";
import { toast } from "sonner";
import { Calendar, Mail, Save, User, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate, getInitials } from "@/lib/utils";

export const ProfileForm = () => {
  const { data: profileData, isLoading } = useQuery({
    queryKey: ["userProfile"],
    queryFn: async () => await getUserProfile(),
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  });

  const formKey = useMemo(() => {
    return profileData ? `${profileData.name}-${profileData.email}` : "initial";
  }, [profileData?.name, profileData?.email]);

  if (isLoading) {
    return <ProfileFormSkeleton />;
  }

  return <ProfileFormInner key={formKey} profileData={profileData} />;
};

// Loading skeleton component
const ProfileFormSkeleton = () => {
  return (
    <div className="space-y-4 md:space-y-6">
      {/* Profile Header Skeleton */}
      <Card className="border-border/50 bg-linear-to-br from-card to-card/50">
        <CardContent className="p-4 sm:p-6 pt-4 sm:pt-6">
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
            <Skeleton className="h-16 w-16 sm:h-20 sm:w-20 rounded-full shrink-0" />
            <div className="flex-1 text-center sm:text-left w-full space-y-2">
              <Skeleton className="h-7 sm:h-8 w-48 mx-auto sm:mx-0" />
              <Skeleton className="h-5 w-64 mx-auto sm:mx-0" />
              <Skeleton className="h-4 w-40 mx-auto sm:mx-0" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Form Skeleton */}
      <Card className="border-border/50">
        <CardHeader className="p-4 sm:p-6">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0">
          <div className="space-y-4 sm:space-y-6">
            <div className="space-y-3 sm:space-y-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-4 border-t border-border">
              <Skeleton className="h-10 w-full sm:w-32" />
              <Skeleton className="h-10 w-full sm:w-24" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Separate component that remounts with fresh data
const ProfileFormInner = ({
  profileData,
}: {
  profileData?: {
    id: string;
    name: string;
    email: string;
    image: string | null;
    createdAt: Date | string;
    updatedAt: Date | string;
  };
}) => {
  const queryClient = useQueryClient();

  // Initialize state from props - this only runs once per mount
  const [name, setName] = useState(profileData?.name ?? "");
  const [email, setEmail] = useState(profileData?.email ?? "");

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

  const isFormChanged =
    name !== (profileData?.name ?? "") || email !== (profileData?.email ?? "");

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
                <span>Joined {formatDate(profileData?.createdAt)}</span>
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
                    disabled={updateMutation.isPending}
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
                    disabled={updateMutation.isPending}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 pt-4 border-t border-border">
              <Button
                type="submit"
                disabled={updateMutation.isPending || !isFormChanged}
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium shadow-md hover:shadow-lg transition-all w-full sm:w-auto text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {updateMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
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
                disabled={updateMutation.isPending || !isFormChanged}
                className="border-border hover:bg-muted w-full sm:w-auto text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Reset
              </Button>
            </div>

            {isFormChanged && !updateMutation.isPending && (
              <p className="text-xs text-muted-foreground text-center sm:text-left">
                You have unsaved changes
              </p>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
