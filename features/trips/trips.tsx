import { useState } from "react";
import { useLocation } from "wouter";
import { PageHeader } from "@shared-components/common/page-header";
import { SearchFilter } from "@shared-components/ui/search-filter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus, Calendar, Edit, Eye } from "lucide-react";
import { Trip, Destination, Activity, Accommodation } from "@shared/schema";
import { useToast } from "@shared/hooks/use-toast";
import { apiRequest } from "@shared/lib/queryClient";
import { queryClient } from "@shared/lib/queryClient";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@shared-components/ui/dialog";
import { Button } from "@shared-components/ui/button";
import { StatusBadge } from "@shared-components/common/status-badge";
import { format } from "date-fns";
import { Card, CardContent } from "@shared-components/ui/card";
import { TripCard } from "@features/trips/trip-card";

interface FilterOption {
  value: string;
  label: string;
}

export default function Trips() {
  const { toast } = useToast();
  const [location, navigate] = useLocation();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [tripToDelete, setTripToDelete] = useState<number | null>(null);

  // Fetch trips
  const { data: trips, isLoading } = useQuery<Trip[]>({
    queryKey: ["/api/trips"],
  });

  // Fetch destinations
  const { data: destinations } = useQuery<Destination[]>({
    queryKey: ["/api/destinations"],
  });

  // Fetch activities
  const { data: activities } = useQuery<Activity[]>({
    queryKey: ["/api/activities"],
  });

  // Fetch accommodations
  const { data: accommodations } = useQuery<Accommodation[]>({
    queryKey: ["/api/accommodations"],
  });



  // Delete trip mutation
  const deleteTrip = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/trips/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/trips"] });
      toast({
        title: "Success",
        description: "Trip deleted successfully",
      });
      setDeleteDialogOpen(false);
      setTripToDelete(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete trip",
        variant: "destructive",
      });
    },
  });

  const handleView = (tripId: number): void => {
    navigate(`/trips/${tripId}`);
  };

  const handleEdit = (tripId: number): void => {
    navigate(`/trips/${tripId}?edit=true`);
  };

  const handleDelete = (id: number): void => {
    setTripToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = (): void => {
    if (tripToDelete !== null) {
      deleteTrip.mutate(tripToDelete);
    }
  };

  /**
   * Filter trips based on search term and status filter
   * @returns Array of filtered Trip objects or empty array if no trips exist
   */
  const filteredTrips: Trip[] = trips ? trips.filter((trip: Trip): boolean => {
    // Match trip name against search term (case-insensitive)
    const matchesSearch: boolean = search === "" || 
      trip.name.toLowerCase().includes(search.toLowerCase());
    
    // Match trip status against selected status filter  
    const matchesStatus: boolean = statusFilter === "all" || trip.statusId.toString() === statusFilter;
    
    // Trip must match both conditions to be included
    return matchesSearch && matchesStatus;
  }) : [];

  /**
   * Sort trips chronologically by start date (upcoming first)
   * @returns New array with sorted Trip objects
   */
  const sortedTrips: Trip[] = [...filteredTrips].sort((a: Trip, b: Trip): number => {
    // Convert string dates to timestamps for comparison
    const dateA: number = new Date(a.startDate).getTime();
    const dateB: number = new Date(b.startDate).getTime();
    
    // Sort ascending by date (earlier dates first)
    return dateA - dateB;
  });

  /**
   * Get destination names for a trip
   * In a production app, this would fetch actual trip-destination relationships
   * from the database using the tripId
   * 
   * @param trip The trip object to get destinations for
   * @returns Array of destination name strings
   */
  const getTripDestinations = (trip: Trip): string[] => {
    // In a real implementation, we'd fetch the trip-destinations relationship
    // using the TripDestination table and join with Destination
    
    // For now, return placeholder destinations
    // This would be replaced with actual destination data in production
    return ["Tokyo", "Kyoto", "Osaka"];
  };

  /**
   * Calculate days until trip starts or return status message
   * @param trip The trip object containing dates and status
   * @returns A number for days remaining or string for completed/cancelled status
   */
  const getDaysToTrip = (trip: Trip): number | string => {
    // Handle completed or cancelled trips with status strings
    if (trip.statusId === 3) { // Assuming 3 is completed status
      return "Completed";
    } else if (trip.statusId === 4) { // Assuming 4 is cancelled status
      return "Cancelled";
    }
    
    // For active trips, calculate days remaining
    const today: Date = new Date();
    const startDate: Date = new Date(trip.startDate);
    const timeDiff: number = startDate.getTime() - today.getTime();
    
    // Return days to trip as a number (milliseconds to days)
    return Math.ceil(timeDiff / (1000 * 3600 * 24));
  };

  /**
   * Get a representative image for a trip
   * @param trip The trip object to get an image for
   * @returns URL string for the trip's representative image
   */
  const getTripImage = (trip: Trip): string => {
    // In a real implementation, we'd get an image based on the trip's destinations
    // This would typically come from a destination's image property or an image service
    
    // For now, return a placeholder image
    return "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e";
  };

  const statusOptions: FilterOption[] = [
    { value: "all", label: "All Status" },
    { value: "1", label: "Wishlist" },
    { value: "2", label: "Planned" },
    { value: "3", label: "Completed" },
    { value: "4", label: "Cancelled" },
  ];

  return (
    <div className="p-6">
      <PageHeader
        title="Trips"
        description="Manage your travel plans and adventures"
        buttonLabel="Create New Trip"
        buttonIcon={<Plus className="h-4 w-4" />}
        onButtonClick={() => navigate("/trips/new")}
      />

      <SearchFilter
        searchPlaceholder="Search trips..."
        onSearchChange={setSearch}
        filters={[
          {
            name: "Status",
            options: statusOptions,
            value: statusFilter,
            onChange: setStatusFilter,
          },
        ]}
      />

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-lg shadow h-96 animate-pulse">
              <div className="h-48 bg-gray-200 rounded-t-lg"></div>
              <div className="p-5">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-full mb-4"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      ) : sortedTrips?.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedTrips.map((trip: Trip) => {
            const isUpcoming = new Date(trip.startDate) > new Date() && trip.statusId === 1; // Assuming 1 is planned status
            return (
              <TripCard
                key={trip.id}
                trip={trip}
                image={getTripImage(trip)}
                destinations={getTripDestinations(trip)}
                activitiesCount={8} // This would come from a real count in a full implementation
                accommodationsCount={3} // This would come from a real count in a full implementation
                daysToTrip={isUpcoming ? 
                  typeof getDaysToTrip(trip) === 'number' ? getDaysToTrip(trip) as number : undefined
                  : undefined
                }
                onView={() => handleView(trip.id)}
                onEdit={() => handleEdit(trip.id)}
                onDelete={() => handleDelete(trip.id)}
              />
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <p className="text-gray-500">No trips found</p>
          <Button
            className="mt-4 bg-primary hover:bg-primary-800"
            onClick={() => navigate("/trips/new")}
          >
            Plan Your First Trip
          </Button>
        </div>
      )}



      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Trip</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this trip? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
