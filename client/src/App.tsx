import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Sidebar } from "@/components/common/sidebar";

import Dashboard from "@/pages/dashboard";
import Destinations from "@/pages/destinations";
import Trips from "@/pages/trips";
import TripBuilder from "@/pages/trip-builder";
import Activities from "@/pages/activities";
import Accommodations from "@/pages/accommodations";
import Profile from "@/pages/profile";
import Settings from "@/pages/settings";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <div className="flex flex-col min-h-screen overflow-hidden">
      <Sidebar />
      <div className="main-content flex-1 ml-0 sm:ml-20 md:ml-64 overflow-y-auto content-safe-area">
        <Switch>
          <Route path="/" component={Dashboard} />
          <Route path="/destinations" component={Destinations} />
          <Route path="/trips" component={Trips} />
          <Route path="/trip-builder" component={TripBuilder} />
          <Route path="/activities" component={Activities} />
          <Route path="/accommodations" component={Accommodations} />
          <Route path="/profile" component={Profile} />
          <Route path="/settings" component={Settings} />
          <Route component={NotFound} />
        </Switch>
      </div>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
