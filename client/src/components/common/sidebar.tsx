
import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Globe, Building, Plus, MapPin, Smile, Home, User, Settings } from "lucide-react";

export function Sidebar() {
  const [location] = useLocation();
  const [isMobile, setIsMobile] = useState(false);
  const [isSmallScreen, setIsSmallScreen] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth <= 640);
      setIsSmallScreen(window.innerWidth <= 768);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);

    return () => {
      window.removeEventListener("resize", checkScreenSize);
    };
  }, []);

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

  // For mobile view, only show main navigation items
  const mobileNavLinks = isMobile ? links.slice(0, 5) : links.slice(0, 6);
  const footerLinks = isMobile ? [] : links.slice(6);

  return (
    <div className={`sidebar bg-white shadow-lg z-10 ${
      isMobile 
        ? "fixed bottom-0 left-0 right-0 w-full h-auto border-t border-gray-border" 
        : isSmallScreen 
          ? "fixed left-0 top-0 w-20 h-full" 
          : "fixed left-0 top-0 w-64 h-full"
    }`}>
      <div className={`sidebar-container flex ${isMobile ? "flex-row justify-around items-center" : "flex-col"} h-full`}>
        {!isMobile && (
          <div className="sidebar-logo flex items-center justify-center h-16 border-b border-gray-border">
            <div className="flex items-center space-x-2">
              <span className="text-primary">
                <Globe className="h-8 w-8" />
              </span>
              {!isSmallScreen && (
                <span className="sidebar-text text-gray-text font-semibold text-lg">TravelPlanner</span>
              )}
            </div>
          </div>
        )}
        
        <div className={`${isMobile ? "w-full py-2" : "flex-1 overflow-y-auto py-4"}`}>
          <nav className={`${isMobile ? "flex justify-around" : "px-4 space-y-1"}`}>
            {mobileNavLinks.map((link) => (
              <Link key={link.path} href={link.path}>
                <div
                  className={`sidebar-link flex ${isMobile ? "flex-col items-center" : "items-center px-4 py-3"} text-sm rounded-md cursor-pointer ${
                    location === link.path
                      ? "active"
                      : "text-gray-text hover:bg-gray-bg"
                  }`}
                >
                  <link.icon className={`${isMobile ? "h-6 w-6" : "h-5 w-5 mr-3"}`} />
                  {(!isSmallScreen || isMobile) && (
                    <span className={`sidebar-text ${isMobile ? "text-xs mt-1" : ""}`}>{link.label}</span>
                  )}
                </div>
              </Link>
            ))}
          </nav>
        </div>
        
        {!isMobile && footerLinks.length > 0 && (
          <div className="border-t border-gray-border pt-4 pb-3">
            <div className="px-4">
              {footerLinks.map((link) => (
                <Link key={link.path} href={link.path}>
                  <div
                    className={`sidebar-link flex items-center px-4 py-3 text-sm rounded-md cursor-pointer ${
                      location === link.path
                        ? "active"
                        : "text-gray-text hover:bg-gray-bg"
                    }`}
                  >
                    <link.icon className="h-5 w-5 mr-3" />
                    {!isSmallScreen && <span className="sidebar-text">{link.label}</span>}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
