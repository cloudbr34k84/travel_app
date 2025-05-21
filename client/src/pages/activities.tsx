import { useState, useEffect } from "react";
import { PageHeader } from "@/components/common/page-header";
import { SearchFilter } from "@/components/ui/search-filter";
import { ActivityCard } from "@/components/activities/activity-card";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { Activity, Destination, InsertActivity } from "@shared/schema";
import { ActivityForm } from "@/components/forms/activity-form";
import { DestinationForm } from "@/components/forms/destination-form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, apiRequestWithJson } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface FilterOption {
  value: string;
  label: string;
}

export default function Activities() {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [destinationFilter, setDestinationFilter] = useState("all");

  /**
   * Manages the "Edit Activity" modal state.
   * `formOpen` controls the visibility of the modal.
   * `editingActivity` stores the activity data to be edited.
   * These states are synchronized:
   * - When an activity's edit button is clicked, `editingActivity` is set to that activity's data, and `formOpen` is set to true, opening the modal with the correct data.
   * - When the modal is closed (`formOpen` becomes false), `editingActivity` is set to null after a short delay (`setTimeout`). This delay ensures that the modal's closing animation completes smoothly before the form data is cleared, preventing any visual flicker or display of stale data during the transition.
   */
  const [formOpen, setFormOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [activityToDelete, setActivityToDelete] = useState<number | null>(null);
  const [activityDetailOpen, setActivityDetailOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
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

  // Create activity mutation with proper response type
  const createActivity = useMutation({
    mutationFn: (newActivity: InsertActivity) => 
      apiRequestWithJson<InsertActivity, Activity>("POST", "/api/activities", newActivity),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/activities"] });
      toast({
        title: "Success",
        description: "Activity created successfully",
      });
      setFormOpen(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create activity",
        variant: "destructive",
      });
    },
  });

  // Update activity mutation with proper type for payload
  interface UpdateActivityParams {
    id: number;
    data: Partial<InsertActivity>;
  }
  
  const updateActivity = useMutation({
    mutationFn: ({ id, data }: UpdateActivityParams) => 
      apiRequestWithJson<Partial<InsertActivity>, Activity>("PUT", `/api/activities/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/activities"] });
      toast({
        title: "Success",
        description: "Activity updated successfully",
      });
      setEditingActivity(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update activity",
        variant: "destructive",
      });
    },
  });

  // Delete activity mutation
  const deleteActivity = useMutation({
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
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete activity",
        variant: "destructive",
      });
    },
  });

  const handleCreateOrUpdateActivity = (values: InsertActivity): void => {
    if (editingActivity) {
      updateActivity.mutate({ id: editingActivity.id, data: values });
    } else {
      createActivity.mutate(values);
    }
  };

  const handleEdit = (activity: Activity): void => {
    setEditingActivity(activity);
    setFormOpen(true);
  };

  const handleDelete = (id: number): void => {
    setActivityToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = (): void => {
    if (activityToDelete !== null) {
      deleteActivity.mutate(activityToDelete);
    }
  };

  const handleFormOpenChange = (open: boolean): void => {
    setFormOpen(open);
    if (!open) {
      setTimeout(() => setEditingActivity(null), 300);
    }
  };

  const handleViewActivity = (activity: Activity): void => {
    setSelectedActivity(activity);
    setActivityDetailOpen(true);
  };

  /**
   * Filter activities based on search and filter criteria
   * @returns Array of filtered activities or empty array if no activities exist
   */
  const filteredActivities: Activity[] = activities ? activities.filter((activity: Activity): boolean => {
    // Search matching - check if search term appears in name or description
    const matchesSearch: boolean = search === "" || 
      activity.name.toLowerCase().includes(search.toLowerCase()) ||
      activity.description.toLowerCase().includes(search.toLowerCase());
    
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
        onButtonClick={() => setFormOpen(true)}
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
                onEdit={handleEdit}
                onDelete={handleDelete}
                onView={handleViewActivity}
              />
            ) : null;
          })}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <p className="text-gray-500">No activities found</p>
          <Button
            className="mt-4 bg-primary hover:bg-primary-800"
            onClick={() => setFormOpen(true)}
          >
            Add Your First Activity
          </Button>
        </div>
      )}

      {/* Create/Edit Activity Form */}
      <ActivityForm
        open={formOpen}
        onOpenChange={handleFormOpenChange}
        onSubmit={handleCreateOrUpdateActivity}
        defaultValues={editingActivity || undefined}
        isEditing={!!editingActivity}
      />

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
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Activity Detail Dialog */}
      <Dialog open={activityDetailOpen} onOpenChange={setActivityDetailOpen}>
        <DialogContent className="sm:max-w-[500px]">
          {selectedActivity && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedActivity.name}</DialogTitle>
              </DialogHeader>
              
              <div className="mt-2">
                {selectedActivity.image && (
                  <div className="w-full h-56 mb-4 overflow-hidden rounded-md">
                    <img 
                      src={selectedActivity.image} 
                      alt={selectedActivity.name} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Description</h3>
                    <p className="mt-1">{selectedActivity.description}</p>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Category</h3>
                      <p className="mt-1">{selectedActivity.category}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Destination</h3>
                      {destinations && (
                        <p className="mt-1">
                          {(() => {
                            const dest = getDestinationForActivity(selectedActivity.destinationId);
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
                    setActivityDetailOpen(false);
                    setSelectedActivity(null);
                  }}
                >
                  Close
                </Button>
                <Button
                  onClick={() => {
                    setActivityDetailOpen(false);
                    handleEdit(selectedActivity);
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
        onOpenChange={(open) => {
          setDestinationFormOpen(open);
          // If the destination form is closed, reopen the activity form that was likely closed
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
                description: "Destination created successfully. Now you can select it for your activity.",
              });
              
              // Close destination form and reopen activity form
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
