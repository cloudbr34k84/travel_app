import { useState } from "react";
import { PageHeader } from "@/components/common/page-header";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, apiRequestWithJson } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { Trip, Destination, Activity, Accommodation, InsertTrip } from "@shared/schema";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { CalendarIcon, Plus, MapPin, Trash2, Building, Smile } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function TripBuilder() {
  const { toast } = useToast();
  const [tripName, setTripName] = useState("");
  const [startDate, setStartDate] = useState<Date | undefined>(new Date());
  const [endDate, setEndDate] = useState<Date | undefined>(new Date(new Date().setDate(new Date().getDate() + 7)));
  const [selectedDestinations, setSelectedDestinations] = useState<number[]>([]);
  const [selectedActivities, setSelectedActivities] = useState<number[]>([]);
  const [selectedAccommodations, setSelectedAccommodations] = useState<number[]>([]);

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
   * Create trip mutation
   * Handles creation of a new trip and adding selected destinations
   */
  const createTrip = useMutation<Trip, Error, InsertTrip>({
    mutationFn: (newTrip: InsertTrip): Promise<Trip> => apiRequestWithJson<InsertTrip, Trip>("POST", "/api/trips", newTrip),
    onSuccess: async (data: Trip): Promise<void> => {
      const tripId: number = data.id;
      
      // Add destinations to trip
      for (const destinationId of selectedDestinations) {
        await apiRequest<{ destinationId: number }, unknown>(
          "POST", 
          `/api/trips/${tripId}/destinations`, 
          { destinationId }
        );
      }
      
      queryClient.invalidateQueries({ queryKey: ["/api/trips"] });
      toast({
        title: "Success",
        description: "Trip created successfully",
      });
      
      // Reset form
      setTripName("");
      setStartDate(new Date());
      setEndDate(new Date(new Date().setDate(new Date().getDate() + 7)));
      setSelectedDestinations([]);
      setSelectedActivities([]);
      setSelectedAccommodations([]);
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
   * Validates form data and creates a new trip
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

    // Prepare trip data with proper formatting
    const newTrip: InsertTrip = {
      name: tripName,
      startDate: startDate ? format(startDate, 'yyyy-MM-dd') : '',
      endDate: endDate ? format(endDate, 'yyyy-MM-dd') : '',
      status: "planned",
    };

    // Submit trip creation request
    createTrip.mutate(newTrip);
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

  return (
    <div className="p-6">
      <PageHeader
        title="Trip Builder"
        description="Create a new trip by selecting destinations, activities, and accommodations"
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
                  {(destinations || []).map((destination: Destination): JSX.Element => (
                    <SelectItem 
                      key={destination.id} 
                      value={destination.id.toString()}
                      disabled={selectedDestinations.includes(destination.id)}
                    >
                      {destination.name}, {destination.country}
                    </SelectItem>
                  ))}
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
    </div>
  );
}
