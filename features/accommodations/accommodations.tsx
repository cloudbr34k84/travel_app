import { useState, useRef, useEffect } from "react";
import { PageHeader } from "@shared-components/common/page-header";
import { SearchFilter } from "@shared-components/ui/search-filter";
import { AccommodationCard } from "@features/accommodations/accommodation-card";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { Accommodation, Destination, InsertAccommodation } from "@shared/schema";
import { AccommodationForm, AccommodationFormProps } from "@features/accommodations/accommodation-form";
import { DestinationForm } from "@features/destinations/destination-form";
import { useToast } from "@shared/hooks/use-toast";
import { apiRequest, apiRequestWithJson } from "@shared/lib/queryClient";
import { queryClient } from "@shared/lib/queryClient";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@shared-components/ui/dialog";
import { Button } from "@shared-components/ui/button";

/**
 * Manages the state for the accommodation form modal using `formOpen` and `editingAccommodation`.
 * - `formOpen` (boolean): Controls the visibility of the modal.
 * - `editingAccommodation` (Accommodation | null): Holds the data of the accommodation being edited.
 *   It's set when an edit action is triggered and cleared when the modal closes.
 *
 * The `setTimeout` in `handleFormOpenChange` is used to delay clearing `editingAccommodation`
 * after the modal closes. This ensures that the form fields, which might depend on
 * `editingAccommodation` for their default values, do not clear prematurely while the
 * modal's closing animation is still in progress. This prevents a flicker or an abrupt
 * change in the form's content just before it disappears.
 */

interface FilterOption {
  value: string;
  label: string;
}

export default function Accommodations() {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [destinationFilter, setDestinationFilter] = useState("all");
  const [editingAccommodation, setEditingAccommodation] = useState<Accommodation | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [accommodationToDelete, setAccommodationToDelete] = useState<number | null>(null);
  const [accommodationDetailOpen, setAccommodationDetailOpen] = useState(false);
  const [selectedAccommodation, setSelectedAccommodation] = useState<Accommodation | null>(null);
  const [destinationFormOpen, setDestinationFormOpen] = useState(false);
  
  // Reference to the accommodation form for handling server validation errors
  const accommodationFormRef = useRef<{
    parseServerValidationErrors: (error: Error) => boolean;
  }>(null);
  
  // Listen for openDestinationForm events to handle destinations modal from dropdown empty state
  useEffect(() => {
    /**
     * Event handler for the openDestinationForm custom event
     * This allows the destination dropdown empty state to trigger opening the destination form
     */
    const handleOpenDestinationForm = () => {
      setDestinationFormOpen(true);
    };
    
    // Add event listener when component mounts
    window.addEventListener('openDestinationForm', handleOpenDestinationForm);
    
    // Remove event listener when component unmounts
    return () => {
      window.removeEventListener('openDestinationForm', handleOpenDestinationForm);
    };
  }, []);

  // Fetch accommodations
  const { data: accommodations, isLoading } = useQuery<Accommodation[]>({
    queryKey: ["/api/accommodations"],
  });

  // Fetch destinations
  const { data: destinations } = useQuery<Destination[]>({
    queryKey: ["/api/destinations"],
  });

  /**
   * Create accommodation mutation with enhanced error handling
   * 
   * @description This mutation handles the API request for creating new accommodations
   * and provides feedback to the user through toast notifications with specific error messages.
   * 
   * @behavior
   * - Tracks loading state with isPending to disable UI elements during submission
   * - Shows success toast on successful creation
   * - Shows detailed error toast on failed creation, extracting error message from the response
   * - Automatically refreshes accommodation data on success
   * 
   * @error-handling
   * - Parses API error messages from the Error object thrown by apiRequestWithJson
   * - Extracts status code and message details when available
   * - Falls back to generic message when specific error details cannot be extracted
   * - Formats validation errors in a user-friendly way
   * 
   * @maintainer-notes
   * - When server returns validation errors, the format will be extracted from error.message
   * - To maintain consistent error handling across forms:
   *   1. Always use this same error extraction pattern in onError callbacks
   *   2. Ensure backend returns error messages in a consistent format
   *   3. Consider centralizing this error handling logic if used in multiple forms
   */
  const createAccommodation = useMutation({
    mutationFn: (newAccommodation: InsertAccommodation) => 
      apiRequestWithJson<InsertAccommodation, Accommodation>("POST", "/api/accommodations", newAccommodation),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/accommodations"] });
      toast({
        title: "Success",
        description: "Accommodation created successfully",
      });
      setFormOpen(false);
    },
    onError: (error: Error) => {
      // First, try to parse and map field validation errors to the form fields
      if (accommodationFormRef.current?.parseServerValidationErrors(error)) {
        // If validation errors were successfully mapped to form fields, 
        // just show a generic error toast without field details
        toast({
          title: "Validation Error",
          description: "Please correct the highlighted fields",
          variant: "destructive",
        });
        return;
      }
      
      // If no field validation errors were mapped, fall back to generic error handling
      let errorMessage = "Failed to create accommodation";
      
      // The apiRequestWithJson function throws errors in format: "Status: Message"
      if (error.message) {
        // Check if it's a structured error with status code
        const errorMatch = error.message.match(/^(\d+): (.+)$/);
        if (errorMatch) {
          const [, statusCode, message] = errorMatch;
          
          // Format based on status code
          if (statusCode === "400") {
            errorMessage = `Validation error: ${message}`;
          } else if (statusCode === "401" || statusCode === "403") {
            errorMessage = `Authentication error: ${message}`;
          } else if (statusCode === "404") {
            errorMessage = `Not found: ${message}`;
          } else if (statusCode === "500") {
            errorMessage = `Server error: ${message}`;
          } else {
            // For other status codes, just use the message
            errorMessage = message;
          }
        } else {
          // If no status pattern found, use the raw error message
          errorMessage = error.message;
        }
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  /**
   * Update accommodation mutation with enhanced error handling
   * 
   * @description This mutation handles the API request for updating existing accommodations
   * and provides feedback to the user through toast notifications with specific error messages.
   * 
   * @behavior
   * - Tracks loading state with isPending to disable UI elements during submission
   * - Shows success toast on successful update
   * - Shows detailed error toast on failed update, extracting error message from the response
   * - Automatically refreshes accommodation data on success
   * 
   * @error-handling
   * - Parses API error messages from the Error object thrown by apiRequestWithJson
   * - Extracts status code and message details when available
   * - Falls back to generic message when specific error details cannot be extracted
   * - Formats validation errors in a user-friendly way
   * 
   * @maintainer-notes
   * - When server returns validation errors, the format will be extracted from error.message
   * - To maintain consistent error handling across forms:
   *   1. Always use this same error extraction pattern in onError callbacks
   *   2. Ensure backend returns error messages in a consistent format
   *   3. Consider centralizing this error handling logic if used in multiple forms
   */
  interface UpdateAccommodationParams {
    id: number;
    data: Partial<InsertAccommodation>;
  }
  
  const updateAccommodation = useMutation({
    mutationFn: ({ id, data }: UpdateAccommodationParams) => 
      apiRequestWithJson<Partial<InsertAccommodation>, Accommodation>("PUT", `/api/accommodations/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/accommodations"] });
      toast({
        title: "Success",
        description: "Accommodation updated successfully",
      });
      setEditingAccommodation(null);
    },
    onError: (error: Error) => {
      // First, try to parse and map field validation errors to the form fields
      if (accommodationFormRef.current?.parseServerValidationErrors(error)) {
        // If validation errors were successfully mapped to form fields, 
        // just show a generic error toast without field details
        toast({
          title: "Validation Error",
          description: "Please correct the highlighted fields",
          variant: "destructive",
        });
        return;
      }
      
      // If no field validation errors were mapped, fall back to generic error handling
      let errorMessage = "Failed to update accommodation";
      
      // The apiRequestWithJson function throws errors in format: "Status: Message"
      if (error.message) {
        // Check if it's a structured error with status code
        const errorMatch = error.message.match(/^(\d+): (.+)$/);
        if (errorMatch) {
          const [, statusCode, message] = errorMatch;
          
          // Format based on status code
          if (statusCode === "400") {
            errorMessage = `Validation error: ${message}`;
          } else if (statusCode === "401" || statusCode === "403") {
            errorMessage = `Authentication error: ${message}`;
          } else if (statusCode === "404") {
            errorMessage = `Not found: ${message}`;
          } else if (statusCode === "500") {
            errorMessage = `Server error: ${message}`;
          } else {
            // For other status codes, just use the message
            errorMessage = message;
          }
        } else {
          // If no status pattern found, use the raw error message
          errorMessage = error.message;
        }
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  /**
   * Delete accommodation mutation with enhanced error handling
   * 
   * @description This mutation handles the API request for deleting accommodations
   * and provides feedback to the user through toast notifications with specific error messages.
   * 
   * @behavior
   * - Tracks loading state with isPending to disable UI elements during submission
   * - Shows success toast on successful deletion
   * - Shows detailed error toast on failed deletion, extracting error message from the response
   * - Automatically refreshes accommodation data on success
   * - Closes the delete confirmation dialog on success
   * 
   * @error-handling
   * - Parses API error messages from the Error object thrown by apiRequestWithJson
   * - Extracts status code and message details when available
   * - Falls back to generic message when specific error details cannot be extracted
   */
  const deleteAccommodation = useMutation({
    mutationFn: (id: number) => 
      apiRequestWithJson<null, void>("DELETE", `/api/accommodations/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/accommodations"] });
      toast({
        title: "Success",
        description: "Accommodation deleted successfully",
      });
      setDeleteDialogOpen(false);
      setAccommodationToDelete(null);
    },
    onError: (error: Error) => {
      // Extract detailed error message from the error object
      let errorMessage = "Failed to delete accommodation";
      
      // The apiRequestWithJson function throws errors in format: "Status: Message"
      if (error.message) {
        // Check if it's a structured error with status code
        const errorMatch = error.message.match(/^(\d+): (.+)$/);
        if (errorMatch) {
          const [, statusCode, message] = errorMatch;
          
          // Format based on status code
          if (statusCode === "400") {
            errorMessage = `Validation error: ${message}`;
          } else if (statusCode === "401" || statusCode === "403") {
            errorMessage = `Authentication error: ${message}`;
          } else if (statusCode === "404") {
            errorMessage = `Not found: ${message}`;
          } else if (statusCode === "409") {
            errorMessage = `Conflict: ${message}`; // Often used for dependency conflicts
          } else if (statusCode === "500") {
            errorMessage = `Server error: ${message}`;
          } else {
            // For other status codes, just use the message
            errorMessage = message;
          }
        } else {
          // If no status pattern found, use the raw error message
          errorMessage = error.message;
        }
      }
      
      toast({
        title: "Error",
        description: errorMessage,
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
      setTimeout(() => setEditingAccommodation(null), 300);
    }
  };

  const handleViewAccommodation = (accommodation: Accommodation): void => {
    setSelectedAccommodation(accommodation);
    setAccommodationDetailOpen(true);
  };

  /**
   * Filter accommodations based on search and filter criteria
   * @returns Array of filtered accommodations or empty array if no accommodations exist
   */
  const filteredAccommodations: Accommodation[] = accommodations ? accommodations.filter((accommodation: Accommodation): boolean => {
    // Search matching - check if search term appears in name
    const matchesSearch: boolean = search === "" || 
      accommodation.name.toLowerCase().includes(search.toLowerCase());
    
    // Type filtering
    const matchesType: boolean = typeFilter === "all" || accommodation.type === typeFilter;
    
    // Destination filtering
    const matchesDestination: boolean = destinationFilter === "all" || 
      accommodation.destinationId.toString() === destinationFilter;
    
    return matchesSearch && matchesType && matchesDestination;
  }) : [];

  /**
   * Get destination for an accommodation by ID with proper null handling
   * @param destinationId The ID of the destination to find
   * @returns The destination or undefined if not found
   */
  const getDestinationForAccommodation = (destinationId: number): Destination | undefined => {
    if (!destinations) return undefined;
    return destinations.find((dest: Destination): boolean => dest.id === destinationId);
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

  /**
   * Create destination filter options with proper null handling
   * @returns Array of destination filter options with "All Destinations" as first option
   */
  const destinationOptions: FilterOption[] = [
    { value: "all", label: "All Destinations" },
    ...(destinations 
      ? destinations.map((dest: Destination): FilterOption => ({
          value: dest.id.toString(),
          label: `${dest.name}, ${dest.country}`,
        })) 
      : [] // Return empty array if no destinations exist
    ),
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
        ref={accommodationFormRef}
        open={formOpen}
        onOpenChange={handleFormOpenChange}
        onSubmit={handleCreateOrUpdateAccommodation}
        onError={(error) => accommodationFormRef.current?.parseServerValidationErrors(error)}
        defaultValues={editingAccommodation || undefined}
        isEditing={!!editingAccommodation}
        isSubmitting={createAccommodation.isPending || updateAccommodation.isPending}
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
              disabled={deleteAccommodation.isPending}
            >
              {deleteAccommodation.isPending ? "Deleting..." : "Delete"}
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
                          {(() => {
                            const dest = getDestinationForAccommodation(selectedAccommodation.destinationId);
                            return dest ? `${dest.name}, ${dest.country}` : 'Unknown destination';
                          })()}
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

      {/* Destination Form Modal (opened from empty destination dropdown) */}
      <DestinationForm
        open={destinationFormOpen}
        isEditing={false}
        onOpenChange={(open) => {
          setDestinationFormOpen(open);
          // If the destination form is closed, reopen the accommodation form that was likely closed
          if (!open) {
            setFormOpen(true);
          }
        }}
        onSubmit={(values) => {
          // Create a new destination
          apiRequestWithJson("POST", "/api/destinations", values)
            .then(() => {
              // Invalidate destinations query to refresh list
              queryClient.invalidateQueries({ queryKey: ["/api/destinations"] });
              
              toast({
                title: "Success",
                description: "Destination created successfully. Now you can select it for your accommodation.",
              });
              
              // Close destination form and reopen accommodation form
              setDestinationFormOpen(false);
              setFormOpen(true);
            })
            .catch(() => {
              toast({
                title: "Error",
                description: "Failed to create destination",
                variant: "destructive",
              });
            });
        }}
      />
    </div>
  );
}
