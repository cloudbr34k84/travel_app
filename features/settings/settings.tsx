import { useState } from "react";
import { PageHeader } from "@shared-components/common/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@shared-components/ui/card";
import { Label } from "@shared-components/ui/label";
import { Input } from "@shared-components/ui/input";
import { Switch } from "@shared-components/ui/switch";
import { Button } from "@shared-components/ui/button";
import { Separator } from "@shared-components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@shared-components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@shared-components/ui/tabs";
import { useToast } from "@shared/hooks/use-toast";
import { Bell, Moon, Sun, Globe, Lock, CreditCard, HelpCircle } from "lucide-react";
import PasswordToggleField from "@shared/components/form/PasswordToggleField";

export default function Settings() {
  const { toast } = useToast();
  
  // Sample settings state
  const [settings, setSettings] = useState({
    appearance: {
      theme: "light",
      language: "en",
      timeFormat: "12h"
    },
    notifications: {
      email: true,
      push: true,
      tripReminders: true,
      marketingEmails: false
    },
    privacy: {
      showProfile: true,
      shareTrips: false,
      allowFriendRequests: true
    },
    security: {
      twoFactorEnabled: false,
      receiveLoginAlerts: true
    }
  });
  
  // Handle setting changes
  const handleSettingChange = (category: string, setting: string, value: any) => {
    setSettings({
      ...settings,
      [category]: {
        ...settings[category as keyof typeof settings],
        [setting]: value
      }
    });
  };
  
  // Handle form submission
  const handleSaveSettings = (category: string) => {
    // In a real app, this would save to an API
    toast({
      title: "Success",
      description: `${category} settings updated successfully`,
    });
  };
  
  return (
    <div className="p-6">
      <PageHeader
        title="Settings"
        description="Manage your account settings and preferences"
      />
      
      <Tabs defaultValue="appearance" className="w-full">
        <TabsList className="w-full md:w-auto grid grid-cols-2 md:grid-cols-4 mb-6">
          <TabsTrigger value="appearance" className="flex items-center">
            <Sun className="h-4 w-4 mr-2" />
            Appearance
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center">
            <Bell className="h-4 w-4 mr-2" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="privacy" className="flex items-center">
            <Lock className="h-4 w-4 mr-2" />
            Privacy
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center">
            <CreditCard className="h-4 w-4 mr-2" />
            Security
          </TabsTrigger>
        </TabsList>
        
        {/* Appearance Settings */}
        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>
                Customize how Travel Planner looks and functions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Theme</Label>
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-2">
                    <Sun className="h-4 w-4" />
                    <span>Light</span>
                  </div>
                  <Switch
                    checked={settings.appearance.theme === "dark"}
                    onCheckedChange={(checked) => 
                      handleSettingChange("appearance", "theme", checked ? "dark" : "light")
                    }
                  />
                  <div className="flex items-center space-x-2">
                    <Moon className="h-4 w-4" />
                    <span>Dark</span>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <Label>Language</Label>
                <Select
                  value={settings.appearance.language}
                  onValueChange={(value) => 
                    handleSettingChange("appearance", "language", value)
                  }
                >
                  <SelectTrigger className="w-full md:w-72">
                    <SelectValue placeholder="Select a language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Español</SelectItem>
                    <SelectItem value="fr">Français</SelectItem>
                    <SelectItem value="de">Deutsch</SelectItem>
                    <SelectItem value="ja">日本語</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <Label>Time Format</Label>
                <Select
                  value={settings.appearance.timeFormat}
                  onValueChange={(value) => 
                    handleSettingChange("appearance", "timeFormat", value)
                  }
                >
                  <SelectTrigger className="w-full md:w-72">
                    <SelectValue placeholder="Select a time format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="12h">12-hour (1:30 PM)</SelectItem>
                    <SelectItem value="24h">24-hour (13:30)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex justify-end">
                <Button 
                  className="bg-primary hover:bg-primary-800"
                  onClick={() => handleSaveSettings("Appearance")}
                >
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Notifications Settings */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>
                Manage how you receive notifications and alerts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-gray-500">
                      Receive notifications via email
                    </p>
                  </div>
                  <Switch
                    checked={settings.notifications.email}
                    onCheckedChange={(checked) => 
                      handleSettingChange("notifications", "email", checked)
                    }
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Push Notifications</Label>
                    <p className="text-sm text-gray-500">
                      Receive push notifications on your device
                    </p>
                  </div>
                  <Switch
                    checked={settings.notifications.push}
                    onCheckedChange={(checked) => 
                      handleSettingChange("notifications", "push", checked)
                    }
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Trip Reminders</Label>
                    <p className="text-sm text-gray-500">
                      Get reminded about upcoming trips
                    </p>
                  </div>
                  <Switch
                    checked={settings.notifications.tripReminders}
                    onCheckedChange={(checked) => 
                      handleSettingChange("notifications", "tripReminders", checked)
                    }
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Marketing Emails</Label>
                    <p className="text-sm text-gray-500">
                      Receive updates about new features and promotions
                    </p>
                  </div>
                  <Switch
                    checked={settings.notifications.marketingEmails}
                    onCheckedChange={(checked) => 
                      handleSettingChange("notifications", "marketingEmails", checked)
                    }
                  />
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button 
                  className="bg-primary hover:bg-primary-800"
                  onClick={() => handleSaveSettings("Notifications")}
                >
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Privacy Settings */}
        <TabsContent value="privacy">
          <Card>
            <CardHeader>
              <CardTitle>Privacy</CardTitle>
              <CardDescription>
                Control who can see your information and how it's used
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Show Profile</Label>
                    <p className="text-sm text-gray-500">
                      Allow others to view your profile
                    </p>
                  </div>
                  <Switch
                    checked={settings.privacy.showProfile}
                    onCheckedChange={(checked) => 
                      handleSettingChange("privacy", "showProfile", checked)
                    }
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Share Trips</Label>
                    <p className="text-sm text-gray-500">
                      Make your trips visible to others
                    </p>
                  </div>
                  <Switch
                    checked={settings.privacy.shareTrips}
                    onCheckedChange={(checked) => 
                      handleSettingChange("privacy", "shareTrips", checked)
                    }
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Allow Friend Requests</Label>
                    <p className="text-sm text-gray-500">
                      Receive friend requests from other users
                    </p>
                  </div>
                  <Switch
                    checked={settings.privacy.allowFriendRequests}
                    onCheckedChange={(checked) => 
                      handleSettingChange("privacy", "allowFriendRequests", checked)
                    }
                  />
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button 
                  className="bg-primary hover:bg-primary-800"
                  onClick={() => handleSaveSettings("Privacy")}
                >
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Security Settings */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security</CardTitle>
              <CardDescription>
                Manage your account security settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <PasswordToggleField id="currentPassword" name="currentPassword" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <PasswordToggleField id="newPassword" name="newPassword" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <PasswordToggleField id="confirmPassword" name="confirmPassword" />
                </div>
                
                <Button 
                  variant="outline"
                  onClick={() => {
                    toast({
                      title: "Coming Soon",
                      description: "Password change functionality will be available soon",
                    });
                  }}
                >
                  Change Password
                </Button>
                
                <Separator className="my-2" />
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Two-Factor Authentication</Label>
                    <p className="text-sm text-gray-500">
                      Add an extra layer of security to your account
                    </p>
                  </div>
                  <Switch
                    checked={settings.security.twoFactorEnabled}
                    onCheckedChange={(checked) => 
                      handleSettingChange("security", "twoFactorEnabled", checked)
                    }
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Login Alerts</Label>
                    <p className="text-sm text-gray-500">
                      Receive notifications about new logins to your account
                    </p>
                  </div>
                  <Switch
                    checked={settings.security.receiveLoginAlerts}
                    onCheckedChange={(checked) => 
                      handleSettingChange("security", "receiveLoginAlerts", checked)
                    }
                  />
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button 
                  className="bg-primary hover:bg-primary-800"
                  onClick={() => handleSaveSettings("Security")}
                >
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
