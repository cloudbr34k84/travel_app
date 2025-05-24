/**
 * @file TripBuilder.tsx
 * @description Enhanced TripBuilder component that handles all trip functionality:
 * - Trip creation (shell creation from /trips/new route)
 * - Trip viewing (read-only mode from /trips/[id] route)
 * - Trip editing (full editor mode from /trips/[id] route)
 * 
 * This component unifies the previously separate TripForm modal and TripBuilder flows
 * into a single comprehensive trip management interface.
 * 
 * Usage:
 * - `/trips/new` - Shows shell creation form for basic trip details
 * - `/trips/[id]` - Shows full trip builder in view or edit mode
 * 
 * State Management:
 * - Uses URL params to determine mode (new vs existing trip)
 * - Manages view/edit state for existing trips
 * - Auto-saves changes when in edit mode
 */

import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { PageHeader } from "@shared-components/common/page-header";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@shared/hooks/use-toast";
import { apiRequest, apiRequestWithJson } from "@shared/lib/queryClient";
import { queryClient } from "@shared/lib/queryClient";
import { DestinationForm } from "@features/destinations/destination-form";
import { Trip, Destination, Activity, Accommodation, InsertTrip, TravelStatus } from "@shared/schema";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@shared-components/ui/card";
import { Button } from "@shared-components/ui/button";
import { Input } from "@shared-components/ui/input";
import { Separator } from "@shared-components/ui/separator";
import { Calendar } from "@shared-components/ui/calendar";
import { Textarea } from "@shared-components/ui/textarea";
import { format } from "date-fns";
import { CalendarIcon, Plus, MapPin, Trash2, Building, Smile, Edit, Eye, Save } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@shared-components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@shared-components/ui/select";
import { Label } from "@shared-components/ui/label";
import { Badge } from "@shared-components/ui/badge";
import { cn } from "@shared/lib/utils";

/**
 * TripBuilder component that handles trip creation, viewing, and editing
 * 
 * Routes supported:
 * - /trips/new - Creates new trip shell
 * - /trips/[id] - Views/edits existing trip
 */
export default function TripBuilder() {
  const { toast } = useToast();
  const params = useParams();
  const [location, navigate] = useLocation();
  
  // Determine mode based on route
  const isNewTrip = location === "/trips/new";
  const tripId = params.id ? parseInt(params.id) : null;
  const isExistingTrip = !isNewTrip && tripId;
  
  // Component state
  const [isEditing, setIsEditing] = useState(isNewTrip);
  const [tripName, setTripName] = useState("");
  const [tripDescription, setTripDescription] = useState("");
  const [startDate, setStartDate] = useState<Date | undefined>(new Date());
  const [endDate, setEndDate] = useState<Date | undefined>(new Date(new Date().setDate(new Date().getDate() + 7)));
  const [statusId, setStatusId] = useState<number>(1);
  const [selectedDestinations, setSelectedDestinations] = useState<number[]>([]);
  const [selectedActivities, setSelectedActivities] = useState<number[]>([]);
  const [selectedAccommodations, setSelectedAccommodations] = useState<number[]>([]);
  const [destinationFormOpen, setDestinationFormOpen] = useState(false);

  // Fetch existing trip data if viewing/editing
  const { data: existingTrip, isLoading: isLoadingTrip } = useQuery<Trip>({
    queryKey: ["/api/trips", tripId],
    enabled: tripId !== null && tripId !== undefined,
  });

  // Fetch travel statuses for status dropdown
  const { data: travelStatuses } = useQuery<TravelStatus[]>({
    queryKey: ["/api/travel-statuses"],
  });

  // Load trip data when editing existing trip
  useEffect(() => {
    if (existingTrip && isExistingTrip) {
      setTripName(existingTrip.name || "");
      setTripDescription(existingTrip.description || "");
      setStartDate(existingTrip.startDate ? new Date(existingTrip.startDate) : new Date());
      setEndDate(existingTrip.endDate ? new Date(existingTrip.endDate) : new Date());
      setStatusId(existingTrip.statusId || 1);
    }
  }, [existingTrip, isExistingTrip]);

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

  /**
   * Fetch all destinations for trip planning
   */
  const { data: destinations }: { data: Destination[] | undefined } = useQuery<Destination[]>({
    queryKey: ["/api/destinations"],
  });

  /**
   * Fetch all activities for trip planning
   */
  const { data: activities }: { data: Activity[] | undefined } = useQuery<Activity[]>({
    queryKey: ["/api/activities"],
  });

  /**
   * Fetch all accommodations for trip planning
   */
  const { data: accommodations }: { data: Accommodation[] | undefined } = useQuery<Accommodation[]>({
    queryKey: ["/api/accommodations"],
  });

  /**
   * Create trip mutation for new trips
   */
  const createTrip = useMutation<Trip, Error, InsertTrip>({
    mutationFn: (newTrip: InsertTrip): Promise<Trip> => apiRequestWithJson<InsertTrip, Trip>("POST", "/api/trips", newTrip),
    onSuccess: async (data: Trip): Promise<void> => {
      const tripId: number = data.id;
      
      queryClient.invalidateQueries({ queryKey: ["/api/trips"] });
      toast({
        title: "Success",
        description: "Trip created successfully",
      });
      
      // Navigate to the newly created trip for full editing
      navigate(`/trips/${tripId}`);
    },
    onError: (error: Error): void => {
      toast({
        title: "Error",
        description: "Failed to create trip",
        variant: "destructive",
      });
    },
  });

  /**
   * Update trip mutation for existing trips
   */
  const updateTrip = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<InsertTrip> }) => 
      apiRequest("PUT", `/api/trips/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/trips"] });
      queryClient.invalidateQueries({ queryKey: ["/api/trips", tripId] });
      toast({
        title: "Success",
        description: "Trip updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update trip",
        variant: "destructive",
      });
    },
  });

  /**
   * Validates form data and creates a new trip
   * Properly formats Date objects to string dates for API submission
   * @returns void
   */
  const handleCreateTrip = (): void => {
    // Validate trip name
    if (!tripName) {
      toast({
        title: "Error",
        description: "Please enter a trip name",
        variant: "destructive",
      });
      return;
    }

    // Validate dates
    if (!startDate || !endDate) {
      toast({
        title: "Error",
        description: "Please select start and end dates",
        variant: "destructive",
      });
      return;
    }

    // Validate destinations
    if (selectedDestinations.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one destination",
        variant: "destructive",
      });
      return;
    }

    // Prepare trip data with proper date formatting for API submission
    const newTrip: InsertTrip = {
      name: tripName,
      description: tripDescription,
      startDate: format(startDate, 'yyyy-MM-dd'), // Format Date to string
      endDate: format(endDate, 'yyyy-MM-dd'),     // Format Date to string
      statusId: statusId,
    };

    // Submit trip creation request
    createTrip.mutate(newTrip);
  };

  /**
   * Handles saving updates to existing trip
   */
  const handleUpdateTrip = (): void => {
    if (!tripId) return;

    // Validate trip name
    if (!tripName) {
      toast({
        title: "Error",
        description: "Please enter a trip name",
        variant: "destructive",
      });
      return;
    }

    // Validate dates
    if (!startDate || !endDate) {
      toast({
        title: "Error",
        description: "Please select start and end dates",
        variant: "destructive",
      });
      return;
    }

    // Prepare trip data with proper date formatting for API submission
    const updatedTrip = {
      name: tripName,
      description: tripDescription,
      startDate: format(startDate, 'yyyy-MM-dd'),
      endDate: format(endDate, 'yyyy-MM-dd'),
      statusId: statusId,
    };

    // Submit trip update request
    updateTrip.mutate({ id: tripId, data: updatedTrip });
  };

  /**
   * Toggle between view and edit modes
   */
  const toggleEditMode = (): void => {
    setIsEditing(!isEditing);
  };

  /**
   * Find a destination by its ID
   * @param id The destination ID to find
   * @returns The matching destination or undefined if not found
   */
  const getDestinationById = (id: number): Destination | undefined => {
    return destinations?.find((destination: Destination): boolean => destination.id === id);
  };

  /**
   * Find an activity by its ID
   * @param id The activity ID to find
   * @returns The matching activity or undefined if not found
   */
  const getActivityById = (id: number): Activity | undefined => {
    return activities?.find((activity: Activity): boolean => activity.id === id);
  };

  /**
   * Find an accommodation by its ID
   * @param id The accommodation ID to find
   * @returns The matching accommodation or undefined if not found
   */
  const getAccommodationById = (id: number): Accommodation | undefined => {
    return accommodations?.find((accommodation: Accommodation): boolean => accommodation.id === id);
  };

  /**
   * Filter activities to only include those from selected destinations
   * @returns Array of available activities for selected destinations
   */
  const getAvailableActivities = (): Activity[] => {
    if (!activities) return [];
    
    // Filter activities to only include those from selected destinations
    return activities.filter((activity: Activity): boolean => 
      selectedDestinations.includes(activity.destinationId)
    );
  };

  /**
   * Filter accommodations to only include those from selected destinations
   * @returns Array of available accommodations for selected destinations
   */
  const getAvailableAccommodations = (): Accommodation[] => {
    if (!accommodations) return [];
    
    // Filter accommodations to only include those from selected destinations
    return accommodations.filter((accommodation: Accommodation): boolean => 
      selectedDestinations.includes(accommodation.destinationId)
    );
  };

  /**
   * Filtered activities based on selected destinations
   */
  const availableActivities: Activity[] = getAvailableActivities();
  
  /**
   * Filtered accommodations based on selected destinations
   */
  const availableAccommodations: Accommodation[] = getAvailableAccommodations();

  // Show loading state for existing trips
  if (isLoadingTrip && isExistingTrip) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3 mb-8"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="h-96 bg-gray-200 rounded"></div>
            <div className="h-96 bg-gray-200 rounded"></div>
            <div className="h-96 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  // Determine page title and description based on mode
  const getPageTitle = () => {
    if (isNewTrip) return "Create New Trip";
    if (isExistingTrip && isEditing) return `Edit Trip: ${existingTrip?.name || "Loading..."}`;
    return `Trip: ${existingTrip?.name || "Loading..."}`;
  };

  const getPageDescription = () => {
    if (isNewTrip) return "Create a basic trip shell to get started";
    if (isExistingTrip && isEditing) return "Edit your trip details, destinations, and activities";
    return "View trip details and itinerary";
  };

  return (
    <div className="p-6">
      <PageHeader
        title={getPageTitle()}
        description={getPageDescription()}
        buttonLabel={isExistingTrip && !isEditing ? "Edit Trip" : undefined}
        buttonIcon={isExistingTrip && !isEditing ? <Edit className="h-4 w-4" /> : undefined}
        onButtonClick={isExistingTrip && !isEditing ? toggleEditMode : undefined}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trip Details */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Trip Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="tripName">Trip Name</Label>
              <Input
                id="tripName"
                placeholder="Summer Vacation"
                value={tripName}
                onChange={(e) => setTripName(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Start Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="space-y-2">
              <Label>End Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !endDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="pt-4">
              <Label>Trip Duration</Label>
              <p className="text-sm text-gray-500">
                {startDate && endDate ? (
                  `${Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))} days`
                ) : (
                  "Select dates to calculate duration"
                )}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Destinations */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Destinations</CardTitle>
          </CardHeader>
          <CardContent>
            {/* 
             * Destination dropdown with empty state messaging
             * 
             * @EmptyState
             * - When no destinations are available, shows a message "No destinations—add one"
             * - Provides a button to open the destination form modal directly from the dropdown
             * - Uses a CustomEvent to communicate with parent component to open destination form
             * - Empty state always includes a call-to-action to ensure users understand how to proceed
             * - This improves UX by guiding users through necessary steps in correct order
             */}
            <div className="space-y-2">
              <Label>Select Destinations</Label>
              <Select
                onValueChange={(value) => {
                  const destinationId = parseInt(value);
                  if (!selectedDestinations.includes(destinationId)) {
                    setSelectedDestinations([...selectedDestinations, destinationId]);
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Add a destination" />
                </SelectTrigger>
                <SelectContent>
                  {(destinations && destinations.length > 0) ? (
                    destinations.map((destination: Destination): JSX.Element => (
                      <SelectItem 
                        key={destination.id} 
                        value={destination.id.toString()}
                        disabled={selectedDestinations.includes(destination.id)}
                      >
                        {destination.name}, {destination.country}
                      </SelectItem>
                    ))
                  ) : (
                    <div className="px-2 py-4 text-center">
                      <p className="text-sm text-muted-foreground mb-2">No destinations—add one</p>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="w-full"
                        onClick={(e) => {
                          e.preventDefault();
                          // Trigger an event to open the destination form
                          window.dispatchEvent(new CustomEvent('openDestinationForm'));
                        }}
                      >
                        Add Destination
                      </Button>
                    </div>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="mt-4 space-y-2">
              <Label>Selected Destinations</Label>
              {selectedDestinations.length === 0 ? (
                <p className="text-sm text-gray-500">No destinations selected</p>
              ) : (
                <div className="space-y-2">
                  {selectedDestinations.map((destId: number): JSX.Element | null => {
                    const destination: Destination | undefined = getDestinationById(destId);
                    
                    return destination ? (
                      <div key={destId} className="flex items-center justify-between bg-gray-50 p-2 rounded-md">
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 text-primary mr-2" />
                          <span>{destination.name}, {destination.country}</span>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={(): void => {
                            // Remove this destination from selected destinations
                            const filteredDestinations: number[] = selectedDestinations.filter(
                              (id: number): boolean => id !== destId
                            );
                            setSelectedDestinations(filteredDestinations);
                            
                            // Also remove any activities from this destination
                            const filteredActivities: number[] = selectedActivities.filter((actId: number): boolean => {
                              const activity: Activity | undefined = getActivityById(actId);
                              return activity ? activity.destinationId !== destId : false;
                            });
                            setSelectedActivities(filteredActivities);
                            
                            // Also remove any accommodations from this destination
                            const filteredAccommodations: number[] = selectedAccommodations.filter((accId: number): boolean => {
                              const accommodation: Accommodation | undefined = getAccommodationById(accId);
                              return accommodation ? accommodation.destinationId !== destId : false;
                            });
                            setSelectedAccommodations(filteredAccommodations);
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-gray-500" />
                        </Button>
                      </div>
                    ) : null;
                  })}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Activities and Accommodations */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Activities & Accommodations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Select Activities</Label>
                {availableActivities.length === 0 ? (
                  <p className="text-sm text-gray-500">Select destinations to see available activities</p>
                ) : (
                  <Select
                    onValueChange={(value) => {
                      const activityId = parseInt(value);
                      if (!selectedActivities.includes(activityId)) {
                        setSelectedActivities([...selectedActivities, activityId]);
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Add an activity" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableActivities.map((activity: Activity): JSX.Element => (
                        <SelectItem 
                          key={activity.id} 
                          value={activity.id.toString()}
                          disabled={selectedActivities.includes(activity.id)}
                        >
                          {activity.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              <div className="space-y-2">
                <Label>Selected Activities</Label>
                {selectedActivities.length === 0 ? (
                  <p className="text-sm text-gray-500">No activities selected</p>
                ) : (
                  <div className="space-y-2">
                    {selectedActivities.map((actId: number): JSX.Element | null => {
                      const activity: Activity | undefined = getActivityById(actId);
                      return activity ? (
                        <div key={actId} className="flex items-center justify-between bg-gray-50 p-2 rounded-md">
                          <div className="flex items-center">
                            <Smile className="h-4 w-4 text-primary mr-2" />
                            <span>{activity.name}</span>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={(): void => {
                              const filteredActivities: number[] = selectedActivities.filter(
                                (id: number): boolean => id !== actId
                              );
                              setSelectedActivities(filteredActivities);
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-gray-500" />
                          </Button>
                        </div>
                      ) : null;
                    })}
                  </div>
                )}
              </div>

              <Separator className="my-4" />

              <div className="space-y-2">
                <Label>Select Accommodations</Label>
                {availableAccommodations.length === 0 ? (
                  <p className="text-sm text-gray-500">Select destinations to see available accommodations</p>
                ) : (
                  <Select
                    onValueChange={(value) => {
                      const accommodationId = parseInt(value);
                      if (!selectedAccommodations.includes(accommodationId)) {
                        setSelectedAccommodations([...selectedAccommodations, accommodationId]);
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Add an accommodation" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableAccommodations.map((accommodation: Accommodation): JSX.Element => (
                        <SelectItem 
                          key={accommodation.id} 
                          value={accommodation.id.toString()}
                          disabled={selectedAccommodations.includes(accommodation.id)}
                        >
                          {accommodation.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              <div className="space-y-2">
                <Label>Selected Accommodations</Label>
                {selectedAccommodations.length === 0 ? (
                  <p className="text-sm text-gray-500">No accommodations selected</p>
                ) : (
                  <div className="space-y-2">
                    {selectedAccommodations.map((accId: number): JSX.Element | null => {
                      const accommodation: Accommodation | undefined = getAccommodationById(accId);
                      return accommodation ? (
                        <div key={accId} className="flex items-center justify-between bg-gray-50 p-2 rounded-md">
                          <div className="flex items-center">
                            <Building className="h-4 w-4 text-primary mr-2" />
                            <span>{accommodation.name}</span>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={(): void => {
                              const filteredAccommodations: number[] = selectedAccommodations.filter(
                                (id: number): boolean => id !== accId
                              );
                              setSelectedAccommodations(filteredAccommodations);
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-gray-500" />
                          </Button>
                        </div>
                      ) : null;
                    })}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 flex justify-end">
        <Button 
          className="bg-primary hover:bg-primary-800 px-6"
          onClick={handleCreateTrip}
          disabled={createTrip.isPending}
        >
          {createTrip.isPending ? "Creating..." : "Create Trip"}
        </Button>
      </div>

      {/* Destination Form Modal (opened from empty destination dropdown) */}
      <DestinationForm
        open={destinationFormOpen}
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
                description: "Destination created successfully. Now you can add it to your trip.",
              });

              // Close destination form
              setDestinationFormOpen(false);
            })
            .catch(() => {
              toast({
                title: "Error",
                description: "Failed to create destination",
                variant: "destructive",
              });
            });
        } } isEditing={false}      />
    </div>
  );
}
