import React, { useState, useEffect } from 'react';
import { PageHeader } from "@shared-components/common/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@shared-components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@shared-components/ui/avatar";
import { Button } from "@shared-components/ui/button";
import { Input } from "@shared-components/ui/input";
import { Label } from "@shared-components/ui/label";
import { Separator } from "@shared-components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@shared-components/ui/tabs";
import { Textarea } from "@shared-components/ui/textarea";
import { useToast } from "@shared/hooks/use-toast";
import { useAuth } from "@shared/hooks/use-auth";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@shared/lib/queryClient";
import { MapPin, Mail, Phone, Calendar, Edit2, Camera, Loader2 } from "lucide-react";

export default function Profile() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [editMode, setEditMode] = useState(false);
  
  // Profile form data
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    location: "",
    bio: ""
  });
  
  // Update form data when user data changes
  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phone: user.phone || "",
        location: user.location || "",
        bio: user.bio || ""
      });
    }
  }, [user]);
  
  // Profile update mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: Partial<typeof formData>) => {
      const response = await apiRequest("PUT", "/api/user", data);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update profile");
      }
      return await response.json();
    },
    onSuccess: () => {
      // Refresh user data
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      
      setEditMode(false);
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Password change mutation
  const changePasswordMutation = useMutation({
    mutationFn: async (data: { currentPassword: string; newPassword: string }) => {
      const response = await apiRequest("POST", "/api/user/change-password", data);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to change password");
      }
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Password updated successfully",
      });
      // Reset form fields
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Password form state
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  
  // Name formatting helper
  const formatName = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName} ${user.lastName}`;
    } else if (user?.firstName) {
      return user.firstName;
    } else if (user?.lastName) {
      return user.lastName;
    }
    return user?.username || "User";
  };
  
  // Format date helper
  const formatDate = (date?: Date | null) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  const handleInputChange = (key: string, value: string) => {
    setFormData({
      ...formData,
      [key]: value
    });
  };
  
  const handlePasswordChange = (key: string, value: string) => {
    setPasswordData({
      ...passwordData,
      [key]: value
    });
  };
  
  const handleSaveProfile = () => {
    updateProfileMutation.mutate(formData);
  };
  
  const handleSavePassword = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate passwords match
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords do not match",
        variant: "destructive",
      });
      return;
    }
    
    // Validate password complexity
    if (passwordData.newPassword.length < 8) {
      toast({
        title: "Error",
        description: "Password must be at least 8 characters long",
        variant: "destructive",
      });
      return;
    }
    
    changePasswordMutation.mutate({
      currentPassword: passwordData.currentPassword,
      newPassword: passwordData.newPassword
    });
  };
  
  // Loading state
  if (!user) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }
  
  return (
    <div className="p-6">
      <PageHeader
        title="Profile"
        description="Manage your personal information and preferences"
        buttonLabel={editMode ? "Cancel" : "Edit Profile"}
        buttonIcon={<Edit2 className="h-4 w-4" />}
        onButtonClick={() => {
          if (editMode) {
            // Reset form data to current user data
            setFormData({
              firstName: user.firstName || "",
              lastName: user.lastName || "",
              email: user.email || "",
              phone: user.phone || "",
              location: user.location || "",
              bio: user.bio || ""
            });
          }
          setEditMode(!editMode);
        }}
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="col-span-1">
          <CardContent className="p-6 flex flex-col items-center">
            <div className="relative mb-4">
              <Avatar className="w-32 h-32">
                <AvatarImage src={user.avatar || ""} />
                <AvatarFallback className="bg-primary text-white text-4xl">
                  {formatName().split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              {editMode && (
                <Button
                  size="sm"
                  variant="secondary"
                  className="absolute bottom-0 right-0 rounded-full"
                  onClick={() => toast({
                    title: "Coming Soon",
                    description: "Profile image upload feature will be available soon",
                  })}
                >
                  <Camera className="h-4 w-4" />
                </Button>
              )}
            </div>
            
            <h2 className="text-2xl font-bold text-center mb-1">{formatName()}</h2>
            <p className="text-gray-500 text-center mb-4 flex items-center justify-center">
              <MapPin className="h-4 w-4 mr-1" />
              {user.location || "Not specified"}
            </p>
            
            <Separator className="my-4" />
            
            <div className="w-full space-y-3">
              <div className="flex items-center">
                <Mail className="h-5 w-5 mr-3 text-gray-500" />
                <span>{user.email}</span>
              </div>
              <div className="flex items-center">
                <Phone className="h-5 w-5 mr-3 text-gray-500" />
                <span>{user.phone || "Not specified"}</span>
              </div>
              <div className="flex items-center">
                <Calendar className="h-5 w-5 mr-3 text-gray-500" />
                <span>Joined {formatDate(user.createdAt)}</span>
              </div>
              {user.lastLogin && (
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 mr-3 text-gray-500" />
                  <span>Last login {formatDate(user.lastLogin)}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        {/* Profile Details */}
        <Card className="col-span-1 lg:col-span-2">
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="about" className="w-full">
              <TabsList className="w-full">
                <TabsTrigger value="about" className="flex-1">About</TabsTrigger>
                <TabsTrigger value="security" className="flex-1">Security</TabsTrigger>
              </TabsList>
              
              <TabsContent value="about" className="pt-4 space-y-4">
                {editMode ? (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input 
                          id="firstName" 
                          value={formData.firstName} 
                          onChange={(e) => handleInputChange('firstName', e.target.value)}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input 
                          id="lastName" 
                          value={formData.lastName} 
                          onChange={(e) => handleInputChange('lastName', e.target.value)}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input 
                        id="email" 
                        type="email" 
                        value={formData.email} 
                        onChange={(e) => handleInputChange('email', e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input 
                        id="phone" 
                        value={formData.phone} 
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      <Input 
                        id="location" 
                        value={formData.location} 
                        onChange={(e) => handleInputChange('location', e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea 
                        id="bio" 
                        value={formData.bio} 
                        onChange={(e) => handleInputChange('bio', e.target.value)}
                        rows={4}
                      />
                    </div>
                    
                    <div className="mt-6 flex justify-end">
                      <Button 
                        className="bg-primary hover:bg-primary-800"
                        onClick={handleSaveProfile}
                        disabled={updateProfileMutation.isPending}
                      >
                        {updateProfileMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                          </>
                        ) : "Save Changes"}
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Bio</h3>
                      <p className="mt-1">{user.bio || "No bio provided"}</p>
                    </div>
                    
                    <Separator />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Username</h3>
                        <p className="mt-1">{user.username}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Email</h3>
                        <p className="mt-1">{user.email}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Phone</h3>
                        <p className="mt-1">{user.phone || "Not specified"}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Location</h3>
                        <p className="mt-1">{user.location || "Not specified"}</p>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Account Statistics</h3>
                      <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2">
                        <div>
                          <p className="text-sm text-gray-500">Member since:</p>
                          <p>{formatDate(user.createdAt)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Login count:</p>
                          <p>{user.loginCount}</p>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </TabsContent>
              
              <TabsContent value="security" className="pt-4 space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Change Password</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSavePassword} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="currentPassword">Current Password</Label>
                        <Input 
                          id="currentPassword" 
                          type="password"
                          value={passwordData.currentPassword} 
                          onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="newPassword">New Password</Label>
                        <Input 
                          id="newPassword" 
                          type="password"
                          value={passwordData.newPassword} 
                          onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                          required
                        />
                        <p className="text-xs text-gray-500">
                          Password must be at least 8 characters and include uppercase letters, lowercase letters, and numbers.
                        </p>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirm New Password</Label>
                        <Input 
                          id="confirmPassword" 
                          type="password"
                          value={passwordData.confirmPassword} 
                          onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                          required
                        />
                      </div>
                      
                      <Button 
                        type="submit"
                        className="mt-4"
                        disabled={changePasswordMutation.isPending}
                      >
                        {changePasswordMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Updating...
                          </>
                        ) : "Update Password"}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}