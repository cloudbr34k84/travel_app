import { useState, useEffect } from "react";
import { PageHeader } from "@shared-components/common/page-header";
import { SearchFilter } from "@shared-components/ui/search-filter";
import CommonTable from "@shared/components/common/CommonTable";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { Activity, Destination } from "@shared/schema";
import { DestinationForm } from "@features/destinations/destination-form";
import { useToast } from "@shared/hooks/use-toast";
import { apiRequestWithJson } from "@shared/lib/queryClient";
import { queryClient } from "@shared/lib/queryClient";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@shared-components/ui/dialog";
import { Button } from "@shared-components/ui/button";
import { Link, useLocation } from "wouter";

interface FilterOption {
  value: string;
  label: string;
}

/**
 * Activities Page - Refactored to use CommonTable Component
 * 
 * This component displays activities in a table format using the reusable CommonTable component.
 * Features include search, filtering, and CRUD operations.
 * 
 * @component_structure
 * - Uses CommonTable for data display instead of card layout
 * - Column definitions specify table headers and data accessors
 * - resolvedActivities maps destinationId to readable destination names
 * - getRowLink prop makes each row clickable to navigate to activity view page
 * 
 * @columns_configuration
 * The columns array defines table structure:
 * - ID: Displays activity ID
 * - Name: Activity name
 * - Description: Activity description with fallback
 * - Category: Activity category 
 * - Destination: Resolved destination name with country
 * 
 * @data_resolution
 * Activities are enriched with destination names by:
 * - Mapping through activities array
 * - Looking up destination by destinationId
 * - Providing fallback "Unknown destination" for missing data
 * 
 * @clickable_rows
 * - Each activity row navigates to /activities/{id} when clicked
 * - Interactive elements within cells should use stopPropagation to prevent row clicks
 * 
 * @future_extensions
 * - Add action column with edit/delete buttons
 * - Implement sorting by clicking column headers
 * - Add pagination for large datasets
 */
export default function Activities() {
  const { toast } = useToast();
  const [location, navigate] = useLocation();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [destinationFilter, setDestinationFilter] = useState("all");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [activityToDelete, setActivityToDelete] = useState<number | null>(null);
  const [destinationFormOpen, setDestinationFormOpen] = useState(false);

  useEffect(() => {
    const handleOpenDestinationForm = () => {
      setDestinationFormOpen(true);
    };
    window.addEventListener('openDestinationForm', handleOpenDestinationForm);
    return () => {
      window.removeEventListener('openDestinationForm', handleOpenDestinationForm);
    };
  }, []);

  // Fetch activities
  const { data: activities, isLoading } = useQuery<Activity[]>({
    queryKey: ["/api/activities"],
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
    { header: 'Description', accessor: (row: any) => row.description || 'No description' },
    { header: 'Category', accessor: (row: any) => row.category },
    { header: 'Status', accessor: (row: any) => row.statusLabel || 'Unknown' },
    { header: 'Destination', accessor: (row: any) => row.destinationName || 'Unknown' },
  ];

  /**
   * Prepare enriched data for table display
   * - Resolves destinationId to destination name with country
   * - Provides fallback values for missing destination data
   */
  const activitiesWithDestinationNames = activities?.map(activity => ({
    ...activity,
    destinationName: destinations?.find(dest => dest.id === activity.destinationId)
      ? `${destinations.find(dest => dest.id === activity.destinationId)?.name}, ${destinations.find(dest => dest.id === activity.destinationId)?.country}`
      : 'Unknown destination',
  })) || [];

  // Delete activity mutation
  const deleteActivityMutation = useMutation({
    mutationFn: (id: number) => 
      apiRequestWithJson<null, void>("DELETE", `/api/activities/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/activities"] });
      toast({
        title: "Success",
        description: "Activity deleted successfully",
      });
      setDeleteDialogOpen(false);
      setActivityToDelete(null);
    },
    onError: (error: Error) => {
      let errorMessage = "Failed to delete activity";
      if (error.message) {
        const errorMatch = error.message.match(/^(\\d+): (.+)$/);
        if (errorMatch) {
          const [, statusCode, message] = errorMatch;
          errorMessage = `Error ${statusCode}: ${message}`;
        } else {
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

  const handleDelete = (id: number): void => {
    setActivityToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = (): void => {
    if (activityToDelete !== null) {
      deleteActivityMutation.mutate(activityToDelete);
    }
  };

  /**
   * Get destination for an activity by ID with proper null handling
   * @param destinationId The ID of the destination to find
   * @returns The destination or undefined if not found
   */
  const getDestinationForActivity = (destinationId: number): Destination | undefined => {
    if (!destinations) return undefined;
    return destinations.find((dest: Destination): boolean => dest.id === destinationId);
  };

  // Apply filters to the resolved activities with destination names
  const filteredActivities = activitiesWithDestinationNames.filter((activity) => {
    const searchLower = search.toLowerCase();
    const activityDescriptionLower = activity.description ? activity.description.toLowerCase() : "";
    
    const matchesSearchCriteria: boolean = search === "" || 
      activity.name.toLowerCase().includes(searchLower) ||
      activityDescriptionLower.includes(searchLower);
    
    const matchesCategoryCriteria: boolean = categoryFilter === "all" || activity.category === categoryFilter;
    const matchesDestinationCriteria: boolean = destinationFilter === "all" || 
      activity.destinationId.toString() === destinationFilter;
    
    return matchesSearchCriteria && matchesCategoryCriteria && matchesDestinationCriteria;
  });

  const categoryOptions: FilterOption[] = [
    { value: "all", label: "All Categories" },
    { value: "Sightseeing", label: "Sightseeing" },
    { value: "Adventure", label: "Adventure" },
    { value: "Culture", label: "Culture" },
    { value: "Relaxation", label: "Relaxation" },
    { value: "Food", label: "Food" },
    { value: "Shopping", label: "Shopping" },
    { value: "Nature", label: "Nature" },
    { value: "History", label: "History" },
  ];

  /**
   * Create destination filter options with proper null handling
   * @returns Array of destination filter options with "All Destinations" as first option
   */
  const destinationOptions: FilterOption[] = [
    { value: "all", label: "All Destinations" },
    ...(destinations || []).map((dest: Destination): FilterOption => ({
        value: dest.id.toString(),
        label: `${dest.name}, ${dest.country}`,
      })
    ),
  ];

  return (
    <div className="p-6">
      <PageHeader
        title="Activities"
        description="Explore and manage activities for your trips"
        buttonLabel="Add Activity"
        buttonIcon={<Plus className="h-4 w-4" />}
        onButtonClick={() => navigate('/activities/new')} 
      />

      <SearchFilter
        searchPlaceholder="Search activities..."
        onSearchChange={setSearch}
        filters={[
          {
            name: "Categories",
            options: categoryOptions,
            value: categoryFilter,
            onChange: setCategoryFilter,
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
            <div className="h-4 bg-gray-200 rounded w-full mb-4"></div>
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-12 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <CommonTable 
          columns={columns} 
          data={filteredActivities}
          getRowLink={(row) => `/activities/${row.id}`}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Activity</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this activity? This action cannot be undone.
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
              disabled={deleteActivityMutation.isPending}
            >
              {deleteActivityMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Destination Form Modal (opened from empty destination dropdown) */}
      <DestinationForm
        open={destinationFormOpen}
        isEditing={false}
        onOpenChange={setDestinationFormOpen}
        onSubmit={(values) => {
          // Create a new destination
          apiRequestWithJson("POST", "/api/destinations", values)
            .then(() => {
              // Invalidate destinations query to refresh list
              queryClient.invalidateQueries({ queryKey: ["/api/destinations"] });

              toast({
                title: "Success",
                description: "Destination created successfully. You can now select it when creating an activity.",
              });

              // Close destination form
              setDestinationFormOpen(false);
            })
            .catch((error: Error) => {
              toast({
                title: "Error",
                description: error.message || "Failed to create destination",
                variant: "destructive",
              });
            });
        } } 
      />
    </div>
  );
}
