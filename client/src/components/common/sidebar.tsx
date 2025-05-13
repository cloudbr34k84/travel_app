import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Globe, Building, Plus, MapPin, Smile, Home, User, Settings } from "lucide-react";

export function Sidebar() {
  const [location] = useLocation();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth <= 640);
    };

    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);

    return () => {
      window.removeEventListener("resize", checkIfMobile);
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

  return (
    <div className="sidebar bg-white w-64 h-full shadow-lg fixed left-0 top-0 z-10">
      <div className="sidebar-container flex flex-col h-full">
        <div className="sidebar-logo flex items-center justify-center h-16 border-b border-gray-border">
          <div className="flex items-center space-x-2">
            <span className="text-primary">
              <Globe className="h-8 w-8" />
            </span>
            <span className="sidebar-text text-gray-text font-semibold text-lg">TravelPlanner</span>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto py-4">
          <nav className="px-4 space-y-1">
            {links.slice(0, 6).map((link) => (
              <Link key={link.path} href={link.path}>
                <div
                  className={`sidebar-link flex items-center px-4 py-3 text-sm rounded-md cursor-pointer ${
                    location === link.path
                      ? "active"
                      : "text-gray-text hover:bg-gray-bg"
                  }`}
                >
                  <link.icon className="h-5 w-5 mr-3" />
                  <span className="sidebar-text">{link.label}</span>
                </div>
              </Link>
            ))}
          </nav>
        </div>
        <div className="border-t border-gray-border pt-4 pb-3">
          <div className="px-4">
            {links.slice(6).map((link) => (
              <Link key={link.path} href={link.path}>
                <div
                  className={`sidebar-link flex items-center px-4 py-3 text-sm rounded-md cursor-pointer ${
                    location === link.path
                      ? "active"
                      : "text-gray-text hover:bg-gray-bg"
                  }`}
                >
                  <link.icon className="h-5 w-5 mr-3" />
                  <span className="sidebar-text">{link.label}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}