
import { Link, useLocation } from "wouter";
import { Globe, Building, Plus, MapPin, Smile, Home, User, Settings, LogOut, LogIn } from "lucide-react";
import { useAuth } from "@/hooks";
import { Button } from "@/components/ui/button";
import { MobileSidebar } from "./mobile-sidebar";

export function Sidebar() {
  const [location] = useLocation();
  const [_, navigate] = useLocation();
  const { user, logoutMutation } = useAuth();

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        navigate('/auth');
      },
    });
  };

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

  // Desktop main navigation links
  const mainNavLinks = links.slice(0, 6);
  // Desktop footer links
  const footerLinks = links.slice(6);

  return (
    <>
      {/* Desktop sidebar */}
      <div className="hidden sm:block fixed left-0 top-0 h-full bg-white shadow-lg z-10 sm:w-20 md:w-64 border-r border-gray-200">
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-center h-16 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <span className="text-primary">
                <Globe className="h-8 w-8" />
              </span>
              <span className="sidebar-text hidden md:block text-gray-700 font-semibold text-lg">TravelPlanner</span>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto py-4">
            <nav className="px-4 space-y-1">
              {mainNavLinks.map((link) => (
                <Link key={link.path} href={link.path}>
                  <div
                    className={`flex items-center px-4 py-3 text-sm rounded-md cursor-pointer ${
                      location === link.path
                        ? "bg-primary text-white"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <link.icon className="h-5 w-5 sm:mr-0 md:mr-3" />
                    <span className="hidden md:block">{link.label}</span>
                  </div>
                </Link>
              ))}
            </nav>
          </div>
          
          <div className="border-t border-gray-200 pt-4 pb-3">
            <div className="px-4">
              {footerLinks.map((link) => (
                <Link key={link.path} href={link.path}>
                  <div
                    className={`flex items-center px-4 py-3 text-sm rounded-md cursor-pointer ${
                      location === link.path
                        ? "bg-primary text-white"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <link.icon className="h-5 w-5 sm:mr-0 md:mr-3" />
                    <span className="hidden md:block">{link.label}</span>
                  </div>
                </Link>
              ))}
              
              {/* Login/Logout Button */}
              <div className="mt-4 px-4">
                {user ? (
                  <Button 
                    variant="destructive" 
                    className="w-full flex items-center justify-center"
                    onClick={handleLogout}
                    disabled={logoutMutation.isPending}
                  >
                    <LogOut className="h-5 w-5 sm:mr-0 md:mr-2" />
                    <span className="hidden md:block">Logout</span>
                  </Button>
                ) : (
                  <Link href="/auth">
                    <Button 
                      variant="secondary" 
                      className="w-full flex items-center justify-center"
                    >
                      <LogIn className="h-5 w-5 sm:mr-0 md:mr-2" />
                      <span className="hidden md:block">Login</span>
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <MobileSidebar />
    </>
  );
}
