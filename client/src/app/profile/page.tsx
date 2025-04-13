"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { User, ProfileUpdateFormData } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { authService, getCurrentUser } from "@/lib/auth";
import { cn, formatPhoneNumber, stringToColor } from "@/lib/utils";
import { Loader2, User as UserIcon } from "lucide-react";

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const router = useRouter();

  // Form states
  const [profileForm, setProfileForm] = useState({
    name: "",
    email: "",
    mobileNumber: "",
    address: ""
  });
  
  const [passwordForm, setPasswordForm] = useState({
    password: "",
    confirmPassword: ""
  });
  
  // Form errors
  const [profileErrors, setProfileErrors] = useState<Record<string, string>>({});
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({});
  
  // Form dirty state tracking
  const [profileDirty, setProfileDirty] = useState(false);
  const [passwordDirty, setPasswordDirty] = useState(false);

  useEffect(() => {
    const currentUser = getCurrentUser();
    
    if (!currentUser) {
      router.push("/login");
      return;
    }

    const fetchUser = async () => {
      try {
        setLoading(true);
        const userData = await authService.getCurrentUser();
        
        if (userData) {
          setUser(userData);
          // Set form initial values
          setProfileForm({
            name: userData.name || "",
            email: userData.email || "",
            mobileNumber: userData.mobileNumber || "",
            address: userData.address || ""
          });
          setProfileDirty(false);
        } else {
          router.push("/login");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        toast.error("Failed to load your profile");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [router]);

  // Handle profile form changes
  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileForm(prev => ({
      ...prev,
      [name]: value
    }));
    setProfileDirty(true);
    
    // Clear error when field is edited
    if (profileErrors[name]) {
      setProfileErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };
  
  // Handle password form changes
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({
      ...prev,
      [name]: value
    }));
    setPasswordDirty(true);
    
    // Clear error when field is edited
    if (passwordErrors[name]) {
      setPasswordErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  // Validate profile form
  const validateProfileForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!profileForm.name || profileForm.name.length < 2) {
      errors.name = "Name must be at least 2 characters";
    }
    
    if (!profileForm.email) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(profileForm.email)) {
      errors.email = "Please enter a valid email";
    }
    
    if (profileForm.mobileNumber && profileForm.mobileNumber.length < 10) {
      errors.mobileNumber = "Phone number must be at least 10 digits";
    }
    
    setProfileErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // Validate password form
  const validatePasswordForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!passwordForm.password || passwordForm.password.length < 8) {
      errors.password = "Password must be at least 8 characters";
    }
    
    if (!passwordForm.confirmPassword) {
      errors.confirmPassword = "Please confirm your password";
    } else if (passwordForm.password !== passwordForm.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }
    
    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle profile update submission
  const handleUpdateProfile = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!validateProfileForm()) {
      return;
    }
    
    try {
      setUpdating(true);
      const data: ProfileUpdateFormData = {
        name: profileForm.name,
        email: profileForm.email,
        mobileNumber: profileForm.mobileNumber || undefined,
        address: profileForm.address || undefined
      };
      
      const updatedUser = await authService.updateProfile(data);
      setUser(updatedUser);
      setProfileDirty(false);
      toast.success("Profile updated successfully");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setUpdating(false);
    }
  };

  // Handle password update submission
  const handleUpdatePassword = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!validatePasswordForm()) {
      return;
    }
    
    try {
      setUpdating(true);
      await authService.updateProfile({ password: passwordForm.password });
      
      // Reset form
      setPasswordForm({
        password: "",
        confirmPassword: ""
      });
      setPasswordDirty(false);
      toast.success("Password updated successfully");
    } catch (error) {
      console.error("Error updating password:", error);
      toast.error("Failed to update password");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="md:w-1/3">
          <Card>
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <Avatar className="h-24 w-24">
                  <AvatarImage src="" alt={user?.name} />
                  <AvatarFallback 
                    className="text-xl" 
                    style={{ backgroundColor: user ? stringToColor(user.name) : "#cbd5e1" }}
                  >
                    {user?.name.charAt(0).toUpperCase() || <UserIcon />}
                  </AvatarFallback>
                </Avatar>
              </div>
              <CardTitle>{user?.name}</CardTitle>
              <CardDescription>{user?.email}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Role</p>
                  <p className="capitalize">{user?.role}</p>
                </div>
                {user?.mobileNumber && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Phone</p>
                    <p>{formatPhoneNumber(user.mobileNumber)}</p>
                  </div>
                )}
                {user?.address && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Address</p>
                    <p>{user.address}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:w-2/3">
          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="profile">Profile Information</TabsTrigger>
              <TabsTrigger value="password">Update Password</TabsTrigger>
            </TabsList>

            <TabsContent value="profile">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>
                    Update your account details here
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleUpdateProfile} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name</Label>
                      <Input 
                        id="name"
                        name="name"
                        value={profileForm.name}
                        onChange={handleProfileChange}
                        className={cn(
                          profileErrors.name && "border-destructive"
                        )}
                      />
                      {profileErrors.name && (
                        <p className="text-sm text-destructive">
                          {profileErrors.name}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input 
                        id="email"
                        name="email"
                        type="email"
                        value={profileForm.email}
                        onChange={handleProfileChange} 
                        className={cn(
                          profileErrors.email && "border-destructive"
                        )}
                      />
                      {profileErrors.email && (
                        <p className="text-sm text-destructive">
                          {profileErrors.email}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="mobileNumber">Phone Number</Label>
                      <Input 
                        id="mobileNumber"
                        name="mobileNumber"
                        value={profileForm.mobileNumber}
                        onChange={handleProfileChange}
                        className={cn(
                          profileErrors.mobileNumber && "border-destructive"
                        )}
                      />
                      {profileErrors.mobileNumber && (
                        <p className="text-sm text-destructive">
                          {profileErrors.mobileNumber}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="address">Address</Label>
                      <Input 
                        id="address"
                        name="address"
                        value={profileForm.address}
                        onChange={handleProfileChange}
                        className={cn(
                          profileErrors.address && "border-destructive"
                        )}
                      />
                      {profileErrors.address && (
                        <p className="text-sm text-destructive">
                          {profileErrors.address}
                        </p>
                      )}
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full"
                      disabled={updating || !profileDirty}
                    >
                      {updating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      {updating ? "Updating..." : "Save Changes"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="password">
              <Card>
                <CardHeader>
                  <CardTitle>Change Password</CardTitle>
                  <CardDescription>
                    Update your password here
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleUpdatePassword} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="password">New Password</Label>
                      <Input 
                        id="password"
                        name="password"
                        type="password"
                        value={passwordForm.password}
                        onChange={handlePasswordChange}
                        className={cn(
                          passwordErrors.password && "border-destructive"
                        )}
                      />
                      {passwordErrors.password && (
                        <p className="text-sm text-destructive">
                          {passwordErrors.password}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm New Password</Label>
                      <Input 
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        value={passwordForm.confirmPassword}
                        onChange={handlePasswordChange}
                        className={cn(
                          passwordErrors.confirmPassword && "border-destructive"
                        )}
                      />
                      {passwordErrors.confirmPassword && (
                        <p className="text-sm text-destructive">
                          {passwordErrors.confirmPassword}
                        </p>
                      )}
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full"
                      disabled={updating || !passwordDirty}
                    >
                      {updating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      {updating ? "Updating..." : "Update Password"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}