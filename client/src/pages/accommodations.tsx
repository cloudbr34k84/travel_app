import { useState } from "react";
import { PageHeader } from "@/components/common/page-header";
import { SearchFilter } from "@/components/ui/search-filter";
import { AccommodationCard } from "@/components/accommodations/accommodation-card";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { Accommodation, Destination, InsertAccommodation } from "@shared/schema";
import { AccommodationForm } from "@/components/forms/accommodation-form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface FilterOption {
  value: string;
  label: string;
}

export default function Accommodations() {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [destinationFilter, setDestinationFilter] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingAccommodation, setEditingAccommodation] = useState<Accommodation | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [accommodationToDelete, setAccommodationToDelete] = useState<number | null>(null);
  const [accommodationDetailOpen, setAccommodationDetailOpen] = useState(false);
  const [selectedAccommodation, setSelectedAccommodation] = useState<Accommodation | null>(null);

  // Fetch accommodations
  const { data: accommodations, isLoading } = useQuery<Accommodation[]>({
    queryKey: ["/api/accommodations"],
  });

  // Fetch destinations
  const { data: destinations } = useQuery<Destination[]>({
    queryKey: ["/api/destinations"],
  });

  // Create accommodation mutation
  const createAccommodation = useMutation({
    mutationFn: (newAccommodation: InsertAccommodation) => apiRequest("POST", "/api/accommodations", newAccommodation),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/accommodations"] });
      toast({
        title: "Success",
        description: "Accommodation created successfully",
      });
      setFormOpen(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create accommodation",
        variant: "destructive",
      });
    },
  });

  // Update accommodation mutation
  const updateAccommodation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<InsertAccommodation> }) => apiRequest("PUT", `/api/accommodations/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/accommodations"] });
      toast({
        title: "Success",
        description: "Accommodation updated successfully",
      });
      setEditingAccommodation(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update accommodation",
        variant: "destructive",
      });
    },
  });

  // Delete accommodation mutation
  const deleteAccommodation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/accommodations/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/accommodations"] });
      toast({
        title: "Success",
        description: "Accommodation deleted successfully",
      });
      setDeleteDialogOpen(false);
      setAccommodationToDelete(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete accommodation",
        variant: "destructive",
      });
    },
  });

  const handleCreateOrUpdateAccommodation = (values: InsertAccommodation): void => {
    if (editingAccommodation) {
      updateAccommodation.mutate({ id: editingAccommodation.id, data: values });
    } else {
      createAccommodation.mutate(values);
    }
  };

  const handleEdit = (accommodation: Accommodation): void => {
    setEditingAccommodation(accommodation);
    setFormOpen(true);
  };

  const handleDelete = (id: number): void => {
    setAccommodationToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = (): void => {
    if (accommodationToDelete !== null) {
      deleteAccommodation.mutate(accommodationToDelete);
    }
  };

  const handleFormOpenChange = (open: boolean): void => {
    setFormOpen(open);
    if (!open) {
      setEditingAccommodation(null);
    }
  };

  const handleViewAccommodation = (accommodation: Accommodation): void => {
    setSelectedAccommodation(accommodation);
    setAccommodationDetailOpen(true);
  };

  // Filter accommodations based on search and filters
  const filteredAccommodations: Accommodation[] = accommodations ? accommodations.filter((accommodation: Accommodation): boolean => {
    const matchesSearch = search === "" || 
      accommodation.name.toLowerCase().includes(search.toLowerCase());
    
    const matchesType = typeFilter === "all" || accommodation.type === typeFilter;
    const matchesDestination = destinationFilter === "all" || accommodation.destinationId.toString() === destinationFilter;
    
    return matchesSearch && matchesType && matchesDestination;
  }) : [];

  // Get destination for an accommodation
  const getDestinationForAccommodation = (destinationId: number): Destination | undefined => {
    return destinations ? destinations.find((dest: Destination): boolean => dest.id === destinationId) : undefined;
  };

  const typeOptions: FilterOption[] = [
    { value: "all", label: "All Types" },
    { value: "Hotel", label: "Hotel" },
    { value: "Resort", label: "Resort" },
    { value: "Hostel", label: "Hostel" },
    { value: "Apartment", label: "Apartment" },
    { value: "Guesthouse", label: "Guesthouse" },
    { value: "Villa", label: "Villa" },
    { value: "Cabin", label: "Cabin" },
    { value: "Camping", label: "Camping" },
  ];

  const destinationOptions: FilterOption[] = [
    { value: "all", label: "All Destinations" },
    ...(destinations?.map((dest: Destination): FilterOption => ({
      value: dest.id.toString(),
      label: `${dest.name}, ${dest.country}`,
    })) || []),
  ];

  return (
    <div className="p-6">
      <PageHeader
        title="Accommodations"
        description="Manage your lodging options for your trips"
        buttonLabel="Add Accommodation"
        buttonIcon={<Plus className="h-4 w-4" />}
        onButtonClick={() => setFormOpen(true)}
      />

      <SearchFilter
        searchPlaceholder="Search accommodations..."
        onSearchChange={setSearch}
        filters={[
          {
            name: "Types",
            options: typeOptions,
            value: typeFilter,
            onChange: setTypeFilter,
          },
          {
            name: "Destinations",
            options: destinationOptions,
            value: destinationFilter,
            onChange: setDestinationFilter,
          },
        ]}
      />

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white rounded-lg shadow h-72 animate-pulse">
              <div className="h-44 bg-gray-200 rounded-t-lg"></div>
              <div className="p-4">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-full"></div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredAccommodations?.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAccommodations.map((accommodation: Accommodation) => {
            const destination = getDestinationForAccommodation(accommodation.destinationId);
            return destination ? (
              <AccommodationCard
                key={accommodation.id}
                accommodation={accommodation}
                destination={destination}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onView={handleViewAccommodation}
              />
            ) : null;
          })}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <p className="text-gray-500">No accommodations found</p>
          <Button
            className="mt-4 bg-primary hover:bg-primary-800"
            onClick={() => setFormOpen(true)}
          >
            Add Your First Accommodation
          </Button>
        </div>
      )}

      {/* Create/Edit Accommodation Form */}
      <AccommodationForm
        open={formOpen}
        onOpenChange={handleFormOpenChange}
        onSubmit={handleCreateOrUpdateAccommodation}
        defaultValues={editingAccommodation || undefined}
        isEditing={!!editingAccommodation}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Accommodation</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this accommodation? This action cannot be undone.
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

      {/* Accommodation Detail Dialog */}
      <Dialog open={accommodationDetailOpen} onOpenChange={setAccommodationDetailOpen}>
        <DialogContent className="sm:max-w-[500px]">
          {selectedAccommodation && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedAccommodation.name}</DialogTitle>
              </DialogHeader>
              
              <div className="mt-2">
                {selectedAccommodation.image && (
                  <div className="w-full h-56 mb-4 overflow-hidden rounded-md">
                    <img 
                      src={selectedAccommodation.image} 
                      alt={selectedAccommodation.name} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Type</h3>
                      <p className="mt-1">{selectedAccommodation.type}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Destination</h3>
                      {destinations && (
                        <p className="mt-1">
                          {getDestinationForAccommodation(selectedAccommodation.destinationId)?.name}, 
                          {getDestinationForAccommodation(selectedAccommodation.destinationId)?.country}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              <DialogFooter className="flex space-x-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setAccommodationDetailOpen(false);
                    setSelectedAccommodation(null);
                  }}
                >
                  Close
                </Button>
                <Button
                  onClick={() => {
                    setAccommodationDetailOpen(false);
                    handleEdit(selectedAccommodation);
                  }}
                >
                  Edit
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
