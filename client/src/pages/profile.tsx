import { useState } from "react";
import { PageHeader } from "@/components/common/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { User, MapPin, Mail, Phone, Globe, Calendar, Edit2, Camera } from "lucide-react";

export default function Profile() {
  const { toast } = useToast();
  const [editMode, setEditMode] = useState(false);
  
  // User data (would normally come from API)
  const [userData, setUserData] = useState({
    name: "Alex Johnson",
    email: "alex.johnson@example.com",
    phone: "+1 (555) 123-4567",
    location: "New York, USA",
    bio: "Travel enthusiast with a passion for exploring new cultures and cuisines. Always planning my next adventure!",
    joinDate: "January 2023",
    profileImage: "",
    travelInterests: ["Nature", "Culture", "Food", "Adventure", "History"],
    travelStyle: "Relaxed explorer with a mix of planned activities and spontaneous adventures.",
    languages: ["English", "Spanish", "French (basic)"],
    social: {
      twitter: "@alextravel",
      instagram: "@alex.adventures",
      website: "alexjohnson.travel"
    }
  });
  
  // State for form fields during edit
  const [formData, setFormData] = useState({ ...userData });
  
  const handleInputChange = (key: string, value: string) => {
    setFormData({
      ...formData,
      [key]: value
    });
  };
  
  const handleSave = () => {
    setUserData(formData);
    setEditMode(false);
    toast({
      title: "Success",
      description: "Profile updated successfully",
    });
  };
  
  return (
    <div className="p-6">
      <PageHeader
        title="Profile"
        description="Manage your personal information and preferences"
        buttonLabel={editMode ? "Cancel" : "Edit Profile"}
        buttonIcon={<Edit2 className="h-4 w-4" />}
        onButtonClick={() => {
          if (editMode) {
            setFormData({ ...userData });
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
                <AvatarImage src={userData.profileImage} />
                <AvatarFallback className="bg-primary text-white text-4xl">
                  {userData.name.split(' ').map(n => n[0]).join('')}
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
            
            <h2 className="text-2xl font-bold text-center mb-1">{userData.name}</h2>
            <p className="text-gray-500 text-center mb-4 flex items-center justify-center">
              <MapPin className="h-4 w-4 mr-1" />
              {userData.location}
            </p>
            
            <Separator className="my-4" />
            
            <div className="w-full space-y-3">
              <div className="flex items-center">
                <Mail className="h-5 w-5 mr-3 text-gray-500" />
                <span>{userData.email}</span>
              </div>
              <div className="flex items-center">
                <Phone className="h-5 w-5 mr-3 text-gray-500" />
                <span>{userData.phone}</span>
              </div>
              <div className="flex items-center">
                <Globe className="h-5 w-5 mr-3 text-gray-500" />
                <span>{userData.social.website}</span>
              </div>
              <div className="flex items-center">
                <Calendar className="h-5 w-5 mr-3 text-gray-500" />
                <span>Joined {userData.joinDate}</span>
              </div>
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
                <TabsTrigger value="travel" className="flex-1">Travel Preferences</TabsTrigger>
              </TabsList>
              
              <TabsContent value="about" className="pt-4 space-y-4">
                {editMode ? (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input 
                        id="name" 
                        value={formData.name} 
                        onChange={(e) => handleInputChange('name', e.target.value)}
                      />
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
                      <Input 
                        id="bio" 
                        value={formData.bio} 
                        onChange={(e) => handleInputChange('bio', e.target.value)}
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Bio</h3>
                      <p className="mt-1">{userData.bio}</p>
                    </div>
                    
                    <Separator />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Email</h3>
                        <p className="mt-1">{userData.email}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Phone</h3>
                        <p className="mt-1">{userData.phone}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Location</h3>
                        <p className="mt-1">{userData.location}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Website</h3>
                        <p className="mt-1">{userData.social.website}</p>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Social Accounts</h3>
                      <div className="mt-1 space-y-1">
                        <p>Twitter: {userData.social.twitter}</p>
                        <p>Instagram: {userData.social.instagram}</p>
                      </div>
                    </div>
                  </>
                )}
              </TabsContent>
              
              <TabsContent value="travel" className="pt-4 space-y-4">
                {editMode ? (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="travelStyle">Travel Style</Label>
                      <Input 
                        id="travelStyle" 
                        value={formData.travelStyle} 
                        onChange={(e) => handleInputChange('travelStyle', e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="languages">Languages (comma-separated)</Label>
                      <Input 
                        id="languages" 
                        value={formData.languages.join(', ')} 
                        onChange={(e) => handleInputChange('languages', e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="travelInterests">Travel Interests (comma-separated)</Label>
                      <Input 
                        id="travelInterests" 
                        value={formData.travelInterests.join(', ')} 
                        onChange={(e) => handleInputChange('travelInterests', e.target.value)}
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Travel Style</h3>
                      <p className="mt-1">{userData.travelStyle}</p>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Travel Interests</h3>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {userData.travelInterests.map((interest) => (
                          <span
                            key={interest}
                            className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium"
                          >
                            {interest}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Languages</h3>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {userData.languages.map((language) => (
                          <span
                            key={language}
                            className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium"
                          >
                            {language}
                          </span>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </TabsContent>
            </Tabs>
            
            {editMode && (
              <div className="mt-6 flex justify-end">
                <Button 
                  className="bg-primary hover:bg-primary-800"
                  onClick={handleSave}
                >
                  Save Changes
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
