import { useState, useEffect } from "react";
import { PageHeader } from "@shared-components/common/page-header";
import { SearchFilter } from "@shared-components/ui/search-filter";
import CommonTable from "@shared/components/common/CommonTable";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter"; // Added for navigation
import { Plus } from "lucide-react";
import { Accommodation, Destination, InsertAccommodation } from "@shared/schema";
import { DestinationForm } from "@features/destinations/destination-form";
import { useToast } from "@shared/hooks/use-toast";
import { apiRequest, apiRequestWithJson } from "@shared/lib/queryClient";
import { queryClient } from "@shared/lib/queryClient";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@shared-components/ui/dialog";
import { Button } from "@shared-components/ui/button";

/**
 * Accommodations Page - Refactored to use CommonTable Component
 * 
 * This component displays accommodations in a table format using the reusable CommonTable component.
 * Features include search, filtering, and CRUD operations.
 * 
 * @component_structure
 * - Uses CommonTable for data display instead of card layout
 * - Column definitions specify table headers and data accessors
 * - resolvedAccommodations maps destinationId to readable destination names
 * 
 * @columns_configuration
 * The columns array defines table structure:
 * - ID: Displays accommodation ID
 * - Name: Accommodation name
 * - Type: Accommodation type (Hotel, Resort, etc.)
 * - Destination: Resolved destination name with country
 * 
 * @data_resolution
 * Accommodations are enriched with destination names by:
 * - Mapping through accommodations array
 * - Looking up destination by destinationId
 * - Providing fallback "Unknown" for missing destination data
 * 
 * @navigation
 * - Add Accommodation: Navigates to `/accommodations/new`
 * - Edit Accommodation: Navigates to `/accommodations/:id/edit`
 * 
 * @future_extensions
 * - Add action column with edit/delete buttons
 * - Implement sorting by clicking column headers
 * - Add pagination for large datasets
 */

interface FilterOption {
  value: string;
  label: string;
}

export default function Accommodations() {
  const { toast } = useToast();
  const [location, navigate] = useLocation(); // Added for navigation
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [destinationFilter, setDestinationFilter] = useState("all");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [accommodationToDelete, setAccommodationToDelete] = useState<number | null>(null);
  const [accommodationDetailOpen, setAccommodationDetailOpen] = useState(false);
  const [selectedAccommodation, setSelectedAccommodation] = useState<Accommodation | null>(null);
  const [destinationFormOpen, setDestinationFormOpen] = useState(false);
  
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
   * Column definitions for CommonTable component
   * - Defines table structure with headers and data accessors
   * - destinationId is resolved to destination name using destinations lookup
   * - statusLabel is displayed directly from the backend join
   */
  const columns = [
    { header: 'ID', accessor: (row: any) => row.id },
    { header: 'Name', accessor: (row: any) => row.name },
    { header: 'Type', accessor: (row: any) => row.type },
    { header: 'Status', accessor: (row: any) => row.statusLabel || 'Unknown' },
    { header: 'Destination', accessor: (row: any) => row.destinationName },
  ];

  /**
   * Prepare enriched data for table display
   * - Resolves destinationId to destination name with country
   * - Provides fallback values for missing destination data
   */
  const resolvedAccommodations = accommodations?.map(accommodation => ({
    ...accommodation,
    destinationName: destinations?.find(dest => dest.id === accommodation.destinationId)
      ? `${destinations.find(dest => dest.id === accommodation.destinationId)?.name}, ${destinations.find(dest => dest.id === accommodation.destinationId)?.country}`
      : 'Unknown',
  })) || [];

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

  const handleEdit = (accommodation: Accommodation): void => {
    navigate(`/accommodations/${accommodation.id}/edit`); // Updated to navigate
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

  const handleViewAccommodation = (accommodation: Accommodation): void => {
    setSelectedAccommodation(accommodation);
    setAccommodationDetailOpen(true);
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
        onButtonClick={() => navigate('/accommodations/new')} // Updated to navigate
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
        <div className="bg-white rounded-lg shadow p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-4 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <CommonTable 
          columns={columns} 
          data={resolvedAccommodations.filter((accommodation: Accommodation): boolean => {
            // Search matching - check if search term appears in name
            const matchesSearch: boolean = search === "" || 
              accommodation.name.toLowerCase().includes(search.toLowerCase());
            
            // Type filtering
            const matchesType: boolean = typeFilter === "all" || accommodation.type === typeFilter;
            
            // Destination filtering
            const matchesDestination: boolean = destinationFilter === "all" || 
              accommodation.destinationId.toString() === destinationFilter;
            
            return matchesSearch && matchesType && matchesDestination;
          })} 
        />
      )}

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
                            const dest = destinations?.find(dest => dest.id === selectedAccommodation.destinationId);
                            return dest ? `${dest.name}, ${dest.country}` : 'Unknown destination';
                          })()}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {/* Description Section */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Description</h3>
                    <p className="mt-1 text-sm text-gray-700">{selectedAccommodation.description || "No description available"}</p>
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
          // if (!open) {
          //   setFormOpen(true); // Removed as setFormOpen is no longer defined
          // }
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
              // setFormOpen(true); // Removed as setFormOpen is no longer defined
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
