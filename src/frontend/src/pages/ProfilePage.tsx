import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useQueryClient } from "@tanstack/react-query";
import { LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useGetCallerPatientProfile,
  useSaveCallerUserProfile,
} from "../hooks/useQueries";
import { clearClientSessionToken } from "../utils/clientSessionToken";

export default function ProfilePage() {
  const {
    data: userProfile,
    isLoading: profileLoading,
    isFetched,
  } = useGetCallerPatientProfile();
  const saveProfile = useSaveCallerUserProfile();
  const { clear, identity } = useInternetIdentity();
  const queryClient = useQueryClient();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phoneNumber: "",
    email: "",
  });

  const isAuthenticated = !!identity;

  useEffect(() => {
    if (userProfile) {
      setFormData({
        name: userProfile.name || "",
        phoneNumber: userProfile.phoneNumber || "",
        email: userProfile.email || "",
      });
    }
  }, [userProfile]);

  useEffect(() => {
    if (!profileLoading && isFetched && userProfile === null) {
      setIsEditing(true);
    }
  }, [profileLoading, isFetched, userProfile]);

  const handleSave = async () => {
    if (
      !formData.name.trim() ||
      !formData.phoneNumber.trim() ||
      !formData.email.trim()
    ) {
      toast.error("Please fill in all fields");
      return;
    }

    if (!formData.email.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }

    try {
      await saveProfile.mutateAsync(formData);
      setIsEditing(false);
    } catch (error: unknown) {
      console.error("Error saving profile:", error);
      const err = error as { message?: string };
      if (err.message?.includes("Invalid profile data")) {
        toast.error("Please ensure all fields are filled correctly");
      } else {
        toast.error("Failed to save profile. Please try again.");
      }
    }
  };

  const handleCancel = () => {
    if (!userProfile) {
      toast.error("Please complete your profile");
      return;
    }

    setFormData({
      name: userProfile?.name || "",
      phoneNumber: userProfile?.phoneNumber || "",
      email: userProfile?.email || "",
    });
    setIsEditing(false);
  };

  const handleLogout = async () => {
    try {
      clearClientSessionToken();
      await clear();
      queryClient.clear();
      toast.success("Logged out successfully");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Failed to logout");
    }
  };

  const isSaving = saveProfile.isPending;
  const pageTitle = userProfile ? "Profile" : "Create Your Profile";
  const pageDescription = userProfile
    ? "Manage your information"
    : "Enter your information to book appointments";
  const saveButtonText = userProfile ? "Save Changes" : "Create Profile";

  // Suppress unused variable warning
  void isAuthenticated;

  return (
    <div className="container mx-auto px-4 py-6 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{pageTitle}</h1>
        <p className="text-muted-foreground">{pageDescription}</p>
      </div>

      <div className="border rounded-lg p-4 mb-4">
        <div className="space-y-4">
          <div>
            <Label htmlFor="name" className="mb-2 block">
              Full Name
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              disabled={!isEditing}
              placeholder="Enter your full name"
            />
          </div>

          <div>
            <Label htmlFor="phone" className="mb-2 block">
              Phone Number
            </Label>
            <Input
              id="phone"
              value={formData.phoneNumber}
              onChange={(e) =>
                setFormData({ ...formData, phoneNumber: e.target.value })
              }
              disabled={!isEditing}
              placeholder="Enter your phone number"
            />
          </div>

          <div>
            <Label htmlFor="email" className="mb-2 block">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              disabled={!isEditing}
              placeholder="Enter your email"
            />
          </div>
        </div>

        <div className="flex gap-2 pt-4 mt-4 border-t">
          {isEditing ? (
            <>
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="flex-1"
              >
                {isSaving ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Saving...
                  </>
                ) : (
                  saveButtonText
                )}
              </Button>
              {userProfile && (
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  className="flex-1"
                >
                  Cancel
                </Button>
              )}
            </>
          ) : (
            <Button onClick={() => setIsEditing(true)} className="w-full">
              Edit Profile
            </Button>
          )}
        </div>
      </div>

      {userProfile && (
        <div className="border rounded-lg p-4 bg-gray-50 mb-4">
          <h2 className="font-semibold mb-2 text-sm text-gray-700">
            Current Profile
          </h2>
          <div className="space-y-1 text-sm">
            <p>
              <span className="font-medium">Name:</span> {userProfile.name}
            </p>
            <p>
              <span className="font-medium">Phone:</span>{" "}
              {userProfile.phoneNumber}
            </p>
            <p>
              <span className="font-medium">Email:</span> {userProfile.email}
            </p>
          </div>
        </div>
      )}

      <div className="border rounded-lg p-4">
        <h2 className="font-semibold mb-2 text-sm text-gray-700">Session</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Clear your session data and return to the home page
        </p>
        <Button variant="outline" onClick={handleLogout} className="w-full">
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  );
}
