import { useState, useEffect } from "react";
import { PageHeader } from "@shared-components/common/page-header";
import { SearchFilter } from "@shared-components/ui/search-filter";
import { ActivityCard } from "@features/activities/activity-card";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { Activity, Destination } from "@shared/schema";
import { DestinationForm } from "@features/destinations/destination-form";
import { useToast } from "@shared/hooks/use-toast";
import { apiRequestWithJson } from "@shared/lib/queryClient";
import { queryClient } from "@shared/lib/queryClient";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@shared-components/ui/dialog";
import { Button } from "@shared-components/ui/button";
import { Link, useNavigate } from "react-router-dom";

interface FilterOption {
  value: string;
  label: string;
}

/**
 * This component displays a list of activities and allows users to search and filter them.
 * Add, View, and Edit operations are handled by navigating to separate pages:
 * - Add Activity: Navigates to \`/activities/new\`
 * - View Activity: Navigates to \`/activities/:id\`
 * - Edit Activity: Navigates to \`/activities/:id/edit\`
 */
export default function Activities() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [destinationFilter, setDestinationFilter] = useState("all");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [activityToDelete, setActivityToDelete] = useState<number | null>(null);
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

  // Fetch activities
  const { data: activities, isLoading } = useQuery<Activity[]>({
    queryKey: ["/api/activities"],
  });

  // Fetch destinations
  const { data: destinations } = useQuery<Destination[]>({
    queryKey: ["/api/destinations"],
  });

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
   * Filter activities based on search and filter criteria
   * @returns Array of filtered activities or empty array if no activities exist
   */
  const filteredActivities: Activity[] = activities ? activities.filter((activity: Activity): boolean => {
    // Search matching - check if search term appears in name or description
    const matchesSearch: boolean = search === "" || 
      activity.name.toLowerCase().includes(search.toLowerCase()) ||
      (activity.description && activity.description.toLowerCase().includes(search.toLowerCase())); // Added null check for description
    
    // Category filtering
    const matchesCategory: boolean = categoryFilter === "all" || activity.category === categoryFilter;
    
    // Destination filtering
    const matchesDestination: boolean = destinationFilter === "all" || 
      activity.destinationId.toString() === destinationFilter;
    
    return matchesSearch && matchesCategory && matchesDestination;
  }) : [];

  /**
   * Get destination for an activity by ID with proper null handling
   * @param destinationId The ID of the destination to find
   * @returns The destination or undefined if not found
   */
  const getDestinationForActivity = (destinationId: number): Destination | undefined => {
    if (!destinations) return undefined;
    return destinations.find((dest: Destination): boolean => dest.id === destinationId);
  };

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white rounded-lg shadow h-72 animate-pulse">
              <div className="h-44 bg-gray-200 rounded-t-lg"></div>
              <div className="p-4">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-full"></div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredActivities?.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredActivities.map((activity: Activity) => {
            const destination = getDestinationForActivity(activity.destinationId);
            return destination ? (
              <ActivityCard
                key={activity.id}
                activity={activity}
                destination={destination}
                onDelete={handleDelete}
              />
            ) : null;
          })}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <p className="text-gray-500">No activities found</p>
          <Link to="/activities/new">
            <Button className="mt-4 bg-primary hover:bg-primary-800">
              Add Your First Activity
            </Button>
          </Link>
        </div>
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
        onOpenChange={(open) => {
          setDestinationFormOpen(open);
        } }
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
