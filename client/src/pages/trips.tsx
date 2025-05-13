import { useState } from "react";
import { PageHeader } from "@/components/common/page-header";
import { SearchFilter } from "@/components/ui/search-filter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus, Calendar } from "lucide-react";
import { Trip, Destination, InsertTrip, Activity, Accommodation } from "@shared/schema";
import { TripForm } from "@/components/forms/trip-form";
import { TripApiValues } from "@/components/forms/trip-form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/common/status-badge";
import { format } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { TripCard } from "@/components/trips/trip-card";

interface FilterOption {
  value: string;
  label: string;
}

export default function Trips() {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingTrip, setEditingTrip] = useState<Trip | null>(null);
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

  // Create trip mutation
  const createTrip = useMutation({
    mutationFn: (newTrip: InsertTrip) => apiRequest("POST", "/api/trips", newTrip),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/trips"] });
      toast({
        title: "Success",
        description: "Trip created successfully",
      });
      setFormOpen(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create trip",
        variant: "destructive",
      });
    },
  });

  // Update trip mutation
  const updateTrip = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<InsertTrip> }) => apiRequest("PUT", `/api/trips/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/trips"] });
      toast({
        title: "Success",
        description: "Trip updated successfully",
      });
      setEditingTrip(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update trip",
        variant: "destructive",
      });
    },
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

  // Use the correct type for the form submission values
  const handleCreateOrUpdateTrip = (values: TripApiValues): void => {
    // Convert to InsertTrip format expected by the mutations
    const tripData: InsertTrip = {
      name: values.name,
      startDate: values.startDate,  // Already in the correct string format
      endDate: values.endDate,      // Already in the correct string format
      status: values.status,
    };
    
    if (editingTrip) {
      updateTrip.mutate({ id: editingTrip.id, data: tripData });
    } else {
      createTrip.mutate(tripData);
    }
  };

  const handleEdit = (trip: Trip): void => {
    setEditingTrip(trip);
    setFormOpen(true);
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

  const handleFormOpenChange = (open: boolean): void => {
    setFormOpen(open);
    if (!open) {
      setEditingTrip(null);
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
    const matchesStatus: boolean = statusFilter === "all" || trip.status === statusFilter;
    
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
    if (trip.status === "completed") {
      return "Completed";
    } else if (trip.status === "cancelled") {
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
    { value: "planned", label: "Planned" },
    { value: "completed", label: "Completed" },
    { value: "cancelled", label: "Cancelled" },
  ];

  return (
    <div className="p-6">
      <PageHeader
        title="Trips"
        description="Manage your travel plans and adventures"
        buttonLabel="Create New Trip"
        buttonIcon={<Plus className="h-4 w-4" />}
        onButtonClick={() => setFormOpen(true)}
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
            const isUpcoming = new Date(trip.startDate) > new Date() && trip.status === "planned";
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
                onView={(id) => {
                  // This would navigate to trip details
                  toast({
                    title: "Coming Soon",
                    description: "Trip details view is under development",
                  });
                }}
              />
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <p className="text-gray-500">No trips found</p>
          <Button
            className="mt-4 bg-primary hover:bg-primary-800"
            onClick={() => setFormOpen(true)}
          >
            Plan Your First Trip
          </Button>
        </div>
      )}

      {/* Create/Edit Trip Form */}
      <TripForm
        open={formOpen}
        onOpenChange={handleFormOpenChange}
        onSubmit={handleCreateOrUpdateTrip}
        defaultValues={editingTrip || undefined}
        isEditing={!!editingTrip}
      />

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
