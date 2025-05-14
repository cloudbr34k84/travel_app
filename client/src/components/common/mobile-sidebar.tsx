import { useState } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Globe, 
  Building, 
  Plus, 
  MapPin, 
  Smile, 
  Home, 
  User, 
  Settings, 
  LogOut, 
  LogIn,
  Menu,
  X
} from "lucide-react";
import { useAuth } from "@/hooks";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

export function MobileSidebar() {
  const [location] = useLocation();
  const [_, navigate] = useLocation();
  const { user, logoutMutation } = useAuth();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        setOpen(false);
        navigate('/auth');
      },
    });
  };

  // Use all navigation links for the mobile sidebar
  const links = [
    { path: "/", label: "Dashboard", icon: Home },
    { path: "/trips", label: "Trips", icon: Building },
    { path: "/trip-builder", label: "Trip Builder", icon: Plus },
    { path: "/destinations", label: "Destinations", icon: MapPin },
    { path: "/activities", label: "Activities", icon: Smile },
    { path: "/accommodations", label: "Accommodations", icon: Building },
    { path: "/profile", label: "Profile", icon: User },
    { path: "/settings", label: "Settings", icon: Settings },
  ];

  // Bottom navigation links (5 primary items)
  const bottomNavLinks = links.slice(0, 5);

  return (
    <div className="sm:hidden">
      {/* Fixed top header with hamburger menu */}
      <div className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 shadow-sm z-30 flex items-center justify-between px-4">
        <div className="flex items-center">
          <Globe className="h-8 w-8 text-primary mr-2" />
          <span className="text-gray-700 font-semibold text-lg">TravelPlanner</span>
        </div>
        
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="h-10 w-10">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-[80%] max-w-[300px]">
            <div className="flex flex-col h-full">
              {/* Mobile Sidebar Header */}
              <div className="flex items-center h-16 border-b border-gray-200 px-4">
                <div className="flex items-center space-x-2">
                  <Globe className="h-7 w-7 text-primary" />
                  <span className="text-gray-700 font-semibold text-lg">TravelPlanner</span>
                </div>
              </div>
              
              {/* Mobile Sidebar Navigation */}
              <div className="flex-1 overflow-y-auto py-4">
                <nav className="px-4 space-y-1">
                  {links.map((link) => (
                    <Link key={link.path} href={link.path}>
                      <div
                        onClick={() => setOpen(false)}
                        className={`flex items-center px-4 py-3 text-sm rounded-md cursor-pointer ${
                          location === link.path
                            ? "bg-primary text-white"
                            : "text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        <link.icon className="h-5 w-5 mr-3" />
                        <span>{link.label}</span>
                      </div>
                    </Link>
                  ))}
                </nav>
              </div>
              
              {/* Mobile Sidebar Footer */}
              <div className="border-t border-gray-200 p-4">
                {user ? (
                  <Button 
                    variant="destructive" 
                    className="w-full flex items-center justify-center"
                    onClick={handleLogout}
                    disabled={logoutMutation.isPending}
                  >
                    <LogOut className="h-5 w-5 mr-2" />
                    <span>Logout</span>
                  </Button>
                ) : (
                  <Link href="/auth">
                    <Button 
                      variant="secondary" 
                      className="w-full flex items-center justify-center"
                      onClick={() => setOpen(false)}
                    >
                      <LogIn className="h-5 w-5 mr-2" />
                      <span>Login</span>
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Bottom navigation (simpler, with fewer items) */}
      <div className="fixed bottom-0 left-0 right-0 w-full mobile-nav-height bg-white border-t border-gray-200 shadow-lg z-30">
        <nav className="flex justify-around items-center h-full px-1">
          {bottomNavLinks.map((link) => (
            <Link key={link.path} href={link.path}>
              <div
                className={`flex flex-col items-center p-1 text-xs cursor-pointer transition-colors duration-200 ${
                  location === link.path
                    ? "text-primary font-medium"
                    : "text-gray-700 hover:text-primary"
                }`}
              >
                <link.icon className="h-6 w-6 mb-1" />
                <span className="whitespace-nowrap">{link.label}</span>
              </div>
            </Link>
          ))}
          
          {/* Mobile drawer menu trigger */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <div className="flex flex-col items-center p-1 text-xs cursor-pointer text-gray-700 hover:text-primary">
                <Menu className="h-6 w-6 mb-1" />
                <span>Menu</span>
              </div>
            </SheetTrigger>
          </Sheet>
        </nav>
      </div>
    </div>
  );
}