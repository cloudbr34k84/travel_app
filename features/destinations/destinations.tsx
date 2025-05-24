/**
 * Destinations page component
 * 
 * Manages the display and interaction with destination data:
 * - Lists all destinations with filtering options
 * - Allows creating, editing, and deleting destinations
 * 
 * State management for modal:
 * - Uses `formOpen` to control the visibility of the destination form modal
 * - Uses `editingDestination` to store the currently selected destination for editing
 * - These states work together to safely handle modal open/close and form data population
 * - A setTimeout delay is used when closing the modal to avoid stale data rendering
 *   before the modal close animation completes
 */
import { useState } from "react";
import { Link } from "wouter";
import { PageHeader } from "@shared-components/common/page-header";
import { SearchFilter } from "@shared-components/ui/search-filter";
import { DestinationCard } from "@features/destinations/destination-card";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { Destination, Activity, Accommodation } from "@shared/schema";
import { useToast } from "@shared/hooks/use-toast";
import { apiRequest, queryClient } from "@shared/lib/queryClient";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@shared-components/ui/dialog";
import { Button } from "@shared-components/ui/button";

interface FilterOption {
  value: string;
  label: string;
}

export default function Destinations() {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [regionFilter, setRegionFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [destinationToDelete, setDestinationToDelete] = useState<number | null>(null);

  // Fetch destinations
  const { data: destinations, isLoading } = useQuery<Destination[]>({
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

  // Create destination mutation
  const createDestination = useMutation({
    mutationFn: (newDestination: InsertDestination) => apiRequest("POST", "/api/destinations", newDestination),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/destinations"] });
      toast({
        title: "Success",
        description: "Destination created successfully",
      });
      setFormOpen(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create destination",
        variant: "destructive",
      });
    },
  });

  // Update destination mutation
  const updateDestination = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<InsertDestination> }) => apiRequest("PUT", `/api/destinations/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/destinations"] });
      toast({
        title: "Success",
        description: "Destination updated successfully",
      });
      setFormOpen(false);
      // The editingDestination will be cleared by the setTimeout in handleFormOpenChange
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update destination",
        variant: "destructive",
      });
    },
  });

  // Delete destination mutation
  const deleteDestination = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/destinations/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/destinations"] });
      toast({
        title: "Success",
        description: "Destination deleted successfully",
      });
      setDeleteDialogOpen(false);
      setDestinationToDelete(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete destination",
        variant: "destructive",
      });
    },
  });

  const handleCreateOrUpdateDestination = (values: InsertDestination) => {
    if (editingDestination) {
      updateDestination.mutate({ id: editingDestination.id, data: values });
    } else {
      createDestination.mutate(values);
    }
  };

  const handleEdit = (destination: Destination) => {
    setEditingDestination(destination);
    setFormOpen(true);
  };

  const handleDelete = (id: number) => {
    setDestinationToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (destinationToDelete !== null) {
      deleteDestination.mutate(destinationToDelete);
    }
  };

  const handleFormOpenChange = (open: boolean) => {
    setFormOpen(open);
    if (!open) {
      // Allow modal animation to finish before clearing selected destination
      setTimeout(() => setEditingDestination(null), 300);
    }
  };

  // Filter destinations based on search and filters
  const filteredDestinations: Destination[] = destinations?.filter((destination: Destination) => {
    const matchesSearch = search === "" || 
      destination.name.toLowerCase().includes(search.toLowerCase()) ||
      destination.country.toLowerCase().includes(search.toLowerCase());
    
    const matchesRegion = regionFilter === "all" || destination.region === regionFilter;
    const matchesStatus = statusFilter === "all" || destination.status === statusFilter;
    
    return matchesSearch && matchesRegion && matchesStatus;
  }) || [];

  // Count activities and accommodations for each destination
  const getActivityCount = (destinationId: number): number => {
    if (!activities) return 0;
    return activities.filter((activity: Activity) => activity.destinationId === destinationId).length;
  };

  const getAccommodationCount = (destinationId: number): number => {
    if (!accommodations) return 0;
    return accommodations.filter((accommodation: Accommodation) => accommodation.destinationId === destinationId).length;
  };

  const regionOptions = [
    { value: "all", label: "All Regions" },
    { value: "Africa", label: "Africa" },
    { value: "Asia", label: "Asia" },
    { value: "Europe", label: "Europe" },
    { value: "North America", label: "North America" },
    { value: "South America", label: "South America" },
    { value: "Oceania", label: "Oceania" },
    { value: "Antarctica", label: "Antarctica" },
  ];

  const statusOptions = [
    { value: "all", label: "All Status" },
    { value: "visited", label: "Visited" },
    { value: "planned", label: "Planned" },
    { value: "wishlist", label: "Wishlist" },
  ];

  return (
    <div className="p-6">
      <PageHeader
        title="Destinations"
        description="Manage your travel destinations"
        buttonLabel="Add Destination"
        buttonIcon={<Plus className="h-4 w-4" />}
        onButtonClick={() => window.location.href = '/destinations/new'}
      />

      <SearchFilter
        searchPlaceholder="Search destinations..."
        onSearchChange={setSearch}
        filters={[
          {
            name: "Regions",
            options: regionOptions,
            value: regionFilter,
            onChange: setRegionFilter,
          },
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
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white rounded-lg shadow h-80 animate-pulse">
              <div className="h-48 bg-gray-200 rounded-t-lg"></div>
              <div className="p-5">
                <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="flex justify-between mb-4">
                  <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                </div>
                <div className="h-8 bg-gray-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredDestinations?.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDestinations.map((destination: Destination) => (
            <DestinationCard
              key={destination.id}
              destination={destination}
              activityCount={getActivityCount(destination.id)}
              accommodationCount={getAccommodationCount(destination.id)}
              onEdit={(destination) => window.location.href = `/destinations/${destination.id}/edit`}
              onDelete={handleDelete}
              onView={(destination) => window.location.href = `/destinations/${destination.id}`}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <p className="text-gray-500">No destinations found</p>
          <Button
            className="mt-4 bg-primary hover:bg-primary-800"
            onClick={() => {
              setEditingDestination(null);
              setFormOpen(true);
            }}
          >
            Add Your First Destination
          </Button>
        </div>
      )}

      {/* Create/Edit Destination Form */}
      <DestinationForm
        open={formOpen}
        onOpenChange={handleFormOpenChange}
        onSubmit={handleCreateOrUpdateDestination}
        defaultValues={editingDestination || undefined}
        isEditing={!!editingDestination}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Destination</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this destination? This action cannot be undone.
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
