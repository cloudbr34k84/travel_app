import { useState } from "react";
import { PageHeader } from "@/components/common/page-header";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
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

  // Fetch destinations
  const { data: destinations } = useQuery({
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

  // Create trip mutation
  const createTrip = useMutation({
    mutationFn: (newTrip: InsertTrip) => apiRequest("POST", "/api/trips", newTrip),
    onSuccess: async (data) => {
      const tripId = data.id;
      
      // Add destinations to trip
      for (const destinationId of selectedDestinations) {
        await apiRequest("POST", `/api/trips/${tripId}/destinations`, { destinationId });
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
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create trip",
        variant: "destructive",
      });
    },
  });

  const handleCreateTrip = () => {
    if (!tripName) {
      toast({
        title: "Error",
        description: "Please enter a trip name",
        variant: "destructive",
      });
      return;
    }

    if (!startDate || !endDate) {
      toast({
        title: "Error",
        description: "Please select start and end dates",
        variant: "destructive",
      });
      return;
    }

    if (selectedDestinations.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one destination",
        variant: "destructive",
      });
      return;
    }

    const newTrip = {
      name: tripName,
      startDate,
      endDate,
      status: "planned",
    };

    createTrip.mutate(newTrip);
  };

  const getDestinationById = (id: number) => {
    return destinations?.find((destination: Destination) => destination.id === id);
  };

  const getActivityById = (id: number) => {
    return activities?.find((activity: Activity) => activity.id === id);
  };

  const getAccommodationById = (id: number) => {
    return accommodations?.find((accommodation: Accommodation) => accommodation.id === id);
  };

  const getAvailableActivities = () => {
    if (!activities) return [];
    
    // Filter activities to only include those from selected destinations
    return activities.filter((activity: Activity) => 
      selectedDestinations.includes(activity.destinationId)
    );
  };

  const getAvailableAccommodations = () => {
    if (!accommodations) return [];
    
    // Filter accommodations to only include those from selected destinations
    return accommodations.filter((accommodation: Accommodation) => 
      selectedDestinations.includes(accommodation.destinationId)
    );
  };

  const availableActivities = getAvailableActivities();
  const availableAccommodations = getAvailableAccommodations();

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
                  {destinations?.map((destination: Destination) => (
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
                  {selectedDestinations.map((destId) => {
                    const destination = getDestinationById(destId);
                    return destination ? (
                      <div key={destId} className="flex items-center justify-between bg-gray-50 p-2 rounded-md">
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 text-primary mr-2" />
                          <span>{destination.name}, {destination.country}</span>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => {
                            setSelectedDestinations(selectedDestinations.filter(id => id !== destId));
                            // Also remove any activities or accommodations from this destination
                            setSelectedActivities(selectedActivities.filter(actId => {
                              const activity = getActivityById(actId);
                              return activity && activity.destinationId !== destId;
                            }));
                            setSelectedAccommodations(selectedAccommodations.filter(accId => {
                              const accommodation = getAccommodationById(accId);
                              return accommodation && accommodation.destinationId !== destId;
                            }));
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
                      {availableActivities.map((activity: Activity) => (
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
                    {selectedActivities.map((actId) => {
                      const activity = getActivityById(actId);
                      return activity ? (
                        <div key={actId} className="flex items-center justify-between bg-gray-50 p-2 rounded-md">
                          <div className="flex items-center">
                            <Smile className="h-4 w-4 text-primary mr-2" />
                            <span>{activity.name}</span>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => {
                              setSelectedActivities(selectedActivities.filter(id => id !== actId));
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
                      {availableAccommodations.map((accommodation: Accommodation) => (
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
                    {selectedAccommodations.map((accId) => {
                      const accommodation = getAccommodationById(accId);
                      return accommodation ? (
                        <div key={accId} className="flex items-center justify-between bg-gray-50 p-2 rounded-md">
                          <div className="flex items-center">
                            <Building className="h-4 w-4 text-primary mr-2" />
                            <span>{accommodation.name}</span>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => {
                              setSelectedAccommodations(selectedAccommodations.filter(id => id !== accId));
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
