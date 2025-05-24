import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "../../shared/lib/queryClient";
import { Toaster } from "@shared-components/ui/toaster";
import { TooltipProvider } from "@shared-components/ui/tooltip";
import { Sidebar } from "@shared-components/common/sidebar";
import { AuthProvider } from "@shared/hooks/use-auth";
import { ProtectedRoute } from "@shared/lib/protected-route";

import Dashboard from "@features/dashboard/dashboard";
import Destinations from "@features/destinations/destinations";
import Trips from "@features/trips/trips";
import TripBuilder from "@features/trips/trip-builder";
import Activities from "@features/activities/activities";
import Accommodations from "@features/accommodations/accommodations";
import Profile from "@features/profile/profile";
import Settings from "@features/settings/settings";
import AuthPage from "@features/auth/auth-page";
import NotFound from "@shared/not-found";

// Activity Pages
import NewActivityPage from "@features/activities/NewActivityPage";
import ViewActivityPage from "@features/activities/ViewActivityPage";
import EditActivityPage from "@features/activities/EditActivityPage";

// Accommodation Pages
import NewAccommodationPage from "@features/accommodations/pages/new";
import ViewAccommodationPage from "@features/accommodations/pages/[id]";
import EditAccommodationPage from "@features/accommodations/pages/[id]/edit";

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="main-content flex-1 overflow-y-auto content-safe-area">
        <div className="page-container">
          {children}
        </div>
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

      <ProtectedRoute path="/activities/new" component={() => (
        <ProtectedLayout>
          <NewActivityPage />
        </ProtectedLayout>
      )} />
      
      <ProtectedRoute path="/activities/:id" component={() => (
        <ProtectedLayout>
          <ViewActivityPage />
        </ProtectedLayout>
      )} />
      
      <ProtectedRoute path="/activities/:id/edit" component={() => (
        <ProtectedLayout>
          <EditActivityPage />
        </ProtectedLayout>
      )} />
      
      <ProtectedRoute path="/accommodations" component={() => (
        <ProtectedLayout>
          <Accommodations />
        </ProtectedLayout>
      )} />
      <ProtectedRoute path="/accommodations/new" component={() => (
        <ProtectedLayout>
          <NewAccommodationPage />
        </ProtectedLayout>
      )} />
      <ProtectedRoute path="/accommodations/:id" component={() => (
        <ProtectedLayout>
          <ViewAccommodationPage />
        </ProtectedLayout>
      )} />
      <ProtectedRoute path="/accommodations/:id/edit" component={() => (
        <ProtectedLayout>
          <EditAccommodationPage />
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
