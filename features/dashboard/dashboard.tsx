import { useLocation } from "wouter";
import { PageHeader } from "@shared-components/common/page-header";
import { StatCard } from "@shared-components/common/stat-card";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@shared-components/ui/card";
import { Link } from "wouter";
import { format } from "date-fns";
import { StatusBadge } from "@shared-components/common/status-badge";
import { Building, MapPin, Smile, Calendar, Clock, Plus } from "lucide-react";
import { Trip, Destination } from "@shared/schema";
import { Button } from "@shared-components/ui/button";

export default function Dashboard() {
  const [location, navigate] = useLocation();

  // Define interface for dashboard stats
  interface DashboardStats {
    upcomingTripsCount: number;
    destinationsCount: number;
    activitiesCount: number;
    accommodationsCount: number;
  }

  // Fetch dashboard stats
  const { data: stats } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
  });

  // Fetch upcoming trips
  const { data: trips } = useQuery<Trip[]>({
    queryKey: ["/api/trips"],
  });

  // Fetch destinations for display
  const { data: destinations } = useQuery<Destination[]>({
    queryKey: ["/api/destinations"],
  });

  // Get the next upcoming trip
  const nextTrip = trips?.find((trip: Trip) => {
    const startDate = new Date(trip.startDate);
    const today = new Date();
    return startDate > today && trip.statusId === 2; // Assuming 2 is planned status
  });

  // Get recent trips (last 3)
  const recentTrips = trips?.slice(0, 3) || [];

  return (
    <div className="p-6">
      <PageHeader 
        title="Dashboard" 
        description="Welcome back! Here's an overview of your travel plans."
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Upcoming Trips"
          value={stats?.upcomingTripsCount || 0}
          description="Planned adventures"
          icon={<Calendar className="h-6 w-6" />}
        />
        <StatCard
          title="Destinations"
          value={stats?.destinationsCount || 0}
          description="Places to explore"
          icon={<MapPin className="h-6 w-6" />}
        />
        <StatCard
          title="Activities"
          value={stats?.activitiesCount || 0}
          description="Things to do"
          icon={<Smile className="h-6 w-6" />}
        />
        <StatCard
          title="Accommodations"
          value={stats?.accommodationsCount || 0}
          description="Places to stay"
          icon={<Building className="h-6 w-6" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Next Trip Card */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold">Next Trip</h3>
          </div>
          {nextTrip ? (
            <>
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-xl font-semibold">{nextTrip.name}</h4>
                  <StatusBadge status="planned" />
                </div>
                
                <div className="flex items-center text-gray-600 mb-2">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span className="text-sm">
                    {format(new Date(nextTrip.startDate), "MMM d")} - {format(new Date(nextTrip.endDate), "MMM d, yyyy")}
                  </span>
                </div>
                
                <div className="flex items-center text-gray-600 mb-4">
                  <Clock className="h-4 w-4 mr-2" />
                  <span className="text-sm">
                    {Math.ceil((new Date(nextTrip.startDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days to go
                  </span>
                </div>
                
                <div className="grid grid-cols-3 gap-4 text-center py-4 border-t border-gray-100">
                  <div>
                    <p className="text-sm text-gray-500">Destinations</p>
                    <p className="text-sm font-medium text-gray-text">2 cities</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Activities</p>
                    <p className="text-sm font-medium text-gray-text">8 planned</p>
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
                onClick={() => navigate("/trips/new")}
              >
                Plan a New Trip
              </Button>
            </div>
          )}
        </div>

        {/* Recent Trips */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Recent Trips</h3>
              <Link href="/trips">
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </Link>
            </div>
          </div>
          <div className="divide-y divide-gray-200">
            {recentTrips.length > 0 ? (
              recentTrips.map((trip: Trip) => (
                <div key={trip.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">{trip.name}</h4>
                      <p className="text-sm text-gray-500">
                        {format(new Date(trip.startDate), "MMM d")} - {format(new Date(trip.endDate), "MMM d, yyyy")}
                      </p>
                    </div>
                    <StatusBadge status={trip.statusId === 1 ? "wishlist" : trip.statusId === 2 ? "planned" : trip.statusId === 3 ? "completed" : "cancelled"} />
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
    </div>
  );
}