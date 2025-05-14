import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Sidebar } from "@/components/common/sidebar";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";

import Dashboard from "@/pages/dashboard";
import Destinations from "@/pages/destinations";
import Trips from "@/pages/trips";
import TripBuilder from "@/pages/trip-builder";
import Activities from "@/pages/activities";
import Accommodations from "@/pages/accommodations";
import Profile from "@/pages/profile";
import Settings from "@/pages/settings";
import AuthPage from "@/pages/auth-page";
import NotFound from "@/pages/not-found";

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen overflow-hidden">
      <Sidebar />
      <div className="main-content flex-1 ml-0 sm:ml-20 md:ml-64 overflow-y-auto content-safe-area">
        {children}
      </div>
    </div>
  );
}

function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return (
    <Layout>
      {children}
    </Layout>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/auth" component={AuthPage} />
      
      <ProtectedRoute path="/" component={() => (
        <ProtectedLayout>
          <Dashboard />
        </ProtectedLayout>
      )} />
      
      <ProtectedRoute path="/destinations" component={() => (
        <ProtectedLayout>
          <Destinations />
        </ProtectedLayout>
      )} />
      
      <ProtectedRoute path="/trips" component={() => (
        <ProtectedLayout>
          <Trips />
        </ProtectedLayout>
      )} />
      
      <ProtectedRoute path="/trip-builder" component={() => (
        <ProtectedLayout>
          <TripBuilder />
        </ProtectedLayout>
      )} />
      
      <ProtectedRoute path="/activities" component={() => (
        <ProtectedLayout>
          <Activities />
        </ProtectedLayout>
      )} />
      
      <ProtectedRoute path="/accommodations" component={() => (
        <ProtectedLayout>
          <Accommodations />
        </ProtectedLayout>
      )} />
      
      <ProtectedRoute path="/profile" component={() => (
        <ProtectedLayout>
          <Profile />
        </ProtectedLayout>
      )} />
      
      <ProtectedRoute path="/settings" component={() => (
        <ProtectedLayout>
          <Settings />
        </ProtectedLayout>
      )} />
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
