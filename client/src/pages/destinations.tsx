import { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { SearchFilter } from "@/components/ui/search-filter";
import { DestinationCard } from "@/components/ui/destination-card";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { Destination } from "@shared/schema";
import { DestinationForm } from "@/components/forms/destination-form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function Destinations() {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [regionFilter, setRegionFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingDestination, setEditingDestination] = useState<Destination | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [destinationToDelete, setDestinationToDelete] = useState<number | null>(null);

  // Fetch destinations
  const { data: destinations, isLoading } = useQuery({
    queryKey: ["/api/destinations"],
  });

  // Fetch activities
  const { data: activities } = useQuery({
    queryKey: ["/api/activities"],
  });

  // Fetch accommodations
  const { data: accommodations } = useQuery({
    queryKey: ["/api/accommodations"],
  });

  // Create destination mutation
  const createDestination = useMutation({
    mutationFn: (newDestination: any) => apiRequest("POST", "/api/destinations", newDestination),
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
    mutationFn: ({ id, data }: { id: number; data: any }) => apiRequest("PUT", `/api/destinations/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/destinations"] });
      toast({
        title: "Success",
        description: "Destination updated successfully",
      });
      setEditingDestination(null);
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

  const handleCreateOrUpdateDestination = (values: any) => {
    if (editingDestination) {
      updateDestination.mutate({ id: editingDestination.id, data: values });
    } else {
      createDestination.mutate(values);
    }
  };

  const handleEdit = (destination: Destination) => {
    setEditingDestination(destination);
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
      setEditingDestination(null);
    }
  };

  // Filter destinations based on search and filters
  const filteredDestinations = destinations?.filter((destination: Destination) => {
    const matchesSearch = search === "" || 
      destination.name.toLowerCase().includes(search.toLowerCase()) ||
      destination.country.toLowerCase().includes(search.toLowerCase());
    
    const matchesRegion = regionFilter === "all" || destination.region === regionFilter;
    const matchesStatus = statusFilter === "all" || destination.status === statusFilter;
    
    return matchesSearch && matchesRegion && matchesStatus;
  });

  // Count activities and accommodations for each destination
  const getActivityCount = (destinationId: number) => {
    if (!activities) return 0;
    return activities.filter((activity: any) => activity.destinationId === destinationId).length;
  };

  const getAccommodationCount = (destinationId: number) => {
    if (!accommodations) return 0;
    return accommodations.filter((accommodation: any) => accommodation.destinationId === destinationId).length;
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
        onButtonClick={() => setFormOpen(true)}
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
              onEdit={handleEdit}
              onDelete={handleDelete}
              onView={() => {}} // This would navigate to destination details
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <p className="text-gray-500">No destinations found</p>
          <Button
            className="mt-4 bg-primary hover:bg-primary-800"
            onClick={() => setFormOpen(true)}
          >
            Add Your First Destination
          </Button>
        </div>
      )}

      {/* Create/Edit Destination Form */}
      <DestinationForm
        open={formOpen || !!editingDestination}
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
