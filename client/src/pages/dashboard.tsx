import { useState } from "react";
import { PageHeader } from "@/components/common/page-header";
import { StatCard } from "@/components/common/stat-card";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import { format } from "date-fns";
import { StatusBadge } from "@/components/common/status-badge";
import { Building, MapPin, Smile, Calendar, Clock, Plus } from "lucide-react";
import { Trip, Destination, InsertTrip } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { TripForm } from "@/components/forms/trip-form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";

export default function Dashboard() {
  const { toast } = useToast();
  const [tripFormOpen, setTripFormOpen] = useState(false);

  // Fetch dashboard stats
  const { data: stats, isLoading: isLoadingStats } = useQuery({
    queryKey: ["/api/dashboard/stats"],
  });

  // Fetch trips
  const { data: trips, isLoading: isLoadingTrips } = useQuery({
    queryKey: ["/api/trips"],
  });

  // Fetch destinations
  const { data: destinations, isLoading: isLoadingDestinations } = useQuery({
    queryKey: ["/api/destinations"],
  });

  // Handle new trip creation
  const handleCreateTrip = async (values: InsertTrip) => {
    try {
      await apiRequest("POST", "/api/trips", values);
      toast({
        title: "Success",
        description: "Trip created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/trips"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      setTripFormOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create trip",
        variant: "destructive",
      });
    }
  };

  // Get next upcoming trip
  const getNextTrip = () => {
    if (!trips || trips.length === 0) return null;
    
    const today = new Date();
    const upcomingTrips = trips.filter((trip: Trip) => {
      const startDate = new Date(trip.startDate);
      return startDate > today && trip.status === "planned";
    });
    
    if (upcomingTrips.length === 0) return null;
    
    // Sort by start date (closest first)
    upcomingTrips.sort((a: Trip, b: Trip) => {
      return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
    });
    
    return upcomingTrips[0];
  };

  // Get recent completed trips
  const getRecentTrips = () => {
    if (!trips || trips.length === 0) return [];
    
    const completedTrips = trips.filter((trip: Trip) => trip.status === "completed");
    
    // Sort by end date (most recent first)
    completedTrips.sort((a: Trip, b: Trip) => {
      return new Date(b.endDate).getTime() - new Date(a.endDate).getTime();
    });
    
    return completedTrips.slice(0, 4);
  };

  // Get destinations for a trip
  const getTripDestinations = (trip: Trip) => {
    // This would normally use the trip-destinations relationship,
    // but for simplicity in this example, we'll just return the first destination
    if (!destinations || destinations.length === 0) return [];
    return [destinations[0].name];
  };

  // Calculate days to next trip
  const getDaysToTrip = (trip: Trip) => {
    const today = new Date();
    const startDate = new Date(trip.startDate);
    const timeDiff = startDate.getTime() - today.getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24));
  };

  const nextTrip = getNextTrip();
  const recentTrips = getRecentTrips();

  return (
    <div className="p-6">
      <PageHeader
        title="Dashboard"
        description="Welcome back! Here's an overview of your travel plans."
        buttonLabel="Create New Trip"
        buttonIcon={<Plus className="h-4 w-4" />}
        onButtonClick={() => setTripFormOpen(true)}
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatCard
          icon={<Building />}
          iconColor="text-primary"
          iconBgColor="bg-blue-100"
          label="Upcoming Trips"
          value={isLoadingStats ? "..." : stats?.upcomingTripsCount}
        />
        <StatCard
          icon={<MapPin />}
          iconColor="text-accent-400"
          iconBgColor="bg-amber-100"
          label="Destinations"
          value={isLoadingStats ? "..." : stats?.destinationsCount}
        />
        <StatCard
          icon={<Smile />}
          iconColor="text-green-600"
          iconBgColor="bg-green-100"
          label="Activities"
          value={isLoadingStats ? "..." : stats?.activitiesCount}
        />
        <StatCard
          icon={<Building />}
          iconColor="text-purple-600"
          iconBgColor="bg-purple-100"
          label="Accommodations"
          value={isLoadingStats ? "..." : stats?.accommodationsCount}
        />
      </div>

      {/* Recent Trips and Upcoming Trip */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming Trip */}
        <div className="bg-white rounded-lg shadow col-span-1">
          <div className="p-6 border-b border-gray-border">
            <h2 className="text-lg font-semibold text-gray-text">Next Trip</h2>
          </div>
          {nextTrip ? (
            <>
              <div className="relative h-48 overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400"
                  alt={nextTrip.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-6">
                  <span className="text-white text-xs font-medium bg-primary rounded-full px-2 py-1 inline-block mb-2 w-fit">
                    {getDaysToTrip(nextTrip) === 0 ? "Today" : 
                     getDaysToTrip(nextTrip) === 1 ? "Tomorrow" : 
                     `In ${getDaysToTrip(nextTrip)} days`}
                  </span>
                  <h3 className="text-white text-xl font-bold">{nextTrip.name}</h3>
                  <p className="text-white/80 text-sm">
                    {getTripDestinations(nextTrip).join(" • ")}
                  </p>
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                    <Calendar className="h-4 w-4 text-gray-500" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">
                      {format(new Date(nextTrip.startDate), "MMM d")} - {format(new Date(nextTrip.endDate), "MMM d, yyyy")}
                    </p>
                    <p className="text-sm font-medium text-gray-text">
                      {Math.ceil((new Date(nextTrip.endDate).getTime() - new Date(nextTrip.startDate).getTime()) / (1000 * 60 * 60 * 24))} days
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center mb-4">
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                    <Smile className="h-4 w-4 text-gray-500" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Activities</p>
                    <p className="text-sm font-medium text-gray-text">8 planned</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                    <Building className="h-4 w-4 text-gray-500" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Accommodations</p>
                    <p className="text-sm font-medium text-gray-text">3 booked</p>
                  </div>
                </div>
                
                <div className="mt-6">
                  <Link href={`/trips/${nextTrip.id}`}>
                    <Button className="w-full bg-primary hover:bg-primary-800">
                      View Trip Details
                    </Button>
                  </Link>
                </div>
              </div>
            </>
          ) : (
            <div className="p-6 text-center">
              <p className="text-gray-500 mb-4">No upcoming trips planned</p>
              <Button 
                className="bg-primary hover:bg-primary-800"
                onClick={() => setTripFormOpen(true)}
              >
                Plan a New Trip
              </Button>
            </div>
          )}
        </div>

        {/* Recent Trips List */}
        <div className="bg-white rounded-lg shadow col-span-1 lg:col-span-2">
          <div className="p-6 border-b border-gray-border flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-text">Recent Trips</h2>
            <Link href="/trips">
              <div className="text-primary text-sm font-medium hover:text-primary-800 cursor-pointer">
                View All
              </div>
            </Link>
          </div>
          <div className="divide-y divide-gray-border">
            {recentTrips.length > 0 ? (
              recentTrips.map((trip: Trip) => (
                <div key={trip.id} className="p-4 flex">
                  <img
                    src="https://images.unsplash.com/photo-1506929562872-bb421503ef21?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=120"
                    alt={trip.name}
                    className="w-24 h-16 object-cover rounded-md mr-4"
                  />
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-gray-text">{trip.name}</h3>
                        <p className="text-sm text-gray-500">
                          {format(new Date(trip.startDate), "MMM d")} - {format(new Date(trip.endDate), "MMM d, yyyy")}
                        </p>
                      </div>
                      <StatusBadge status={trip.status as "completed"} />
                    </div>
                    <div className="flex items-center mt-2 text-xs text-gray-500">
                      <span className="flex items-center mr-3">
                        <MapPin className="h-3 w-3 mr-1" />
                        {getTripDestinations(trip).length} destinations
                      </span>
                      <span className="flex items-center mr-3">
                        <Smile className="h-3 w-3 mr-1" />
                        7 activities
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-6 text-center">
                <p className="text-gray-500">No recent trips to display</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <TripForm
        open={tripFormOpen}
        onOpenChange={setTripFormOpen}
        onSubmit={handleCreateTrip}
      />
    </div>
  );
}
