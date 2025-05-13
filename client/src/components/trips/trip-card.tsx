import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { format } from "date-fns";
import { Trip } from "@shared/schema";
import { Calendar, Clock, MapPin } from "lucide-react";
import { Building, Smile } from "lucide-react";

interface TripCardProps {
  trip: Trip;
  image: string;
  destinations: string[];
  activitiesCount: number;
  accommodationsCount: number;
  daysToTrip?: number;
  onView: (id: number) => void;
}

export function TripCard({
  trip,
  image,
  destinations,
  activitiesCount,
  accommodationsCount,
  daysToTrip,
  onView,
}: TripCardProps) {
  const formattedStartDate = format(new Date(trip.startDate), "MMM d, yyyy");
  const formattedEndDate = format(new Date(trip.endDate), "MMM d, yyyy");

  // Calculate trip duration in days
  const startDate = new Date(trip.startDate);
  const endDate = new Date(trip.endDate);
  const tripDuration = Math.ceil(
    (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
  );

  return (
    <Card className="overflow-hidden">
      <div className="relative h-48 overflow-hidden">
        <img
          src={image}
          alt={trip.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-6">
          {daysToTrip !== undefined && (
            <span className="text-white text-xs font-medium bg-primary rounded-full px-2 py-1 inline-block mb-2 w-fit">
              {daysToTrip === 0
                ? "Today"
                : daysToTrip === 1
                  ? "Tomorrow"
                  : `In ${daysToTrip} days`}
            </span>
          )}
          <h3 className="text-white text-xl font-bold">{trip.name}</h3>
          <p className="text-white/80 text-sm">{destinations.join(" • ")}</p>
        </div>
      </div>
      <CardContent className="p-6">
        <div className="flex items-center mb-4">
          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mr-3">
            <Calendar className="h-4 w-4 text-gray-500" />
          </div>
          <div>
            <p className="text-sm text-gray-500">
              {formattedStartDate} - {formattedEndDate}
            </p>
            <p className="text-sm font-medium text-gray-text">
              {tripDuration} days
            </p>
          </div>
        </div>

        <div className="flex items-center mb-4">
          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mr-3">
            <Smile className="h-4 w-4 text-gray-500" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Activities</p>
            <p className="text-sm font-medium text-gray-text">
              {activitiesCount} planned
            </p>
          </div>
        </div>

        <div className="flex items-center">
          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mr-3">
            <Building className="h-4 w-4 text-gray-500" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Accommodations</p>
            <p className="text-sm font-medium text-gray-text">
              {accommodationsCount} booked
            </p>
          </div>
        </div>

        <div className="mt-6">
          <Button
            className="w-full bg-primary hover:bg-primary-800"
            onClick={() => onView(trip.id)}
          >
            View Trip Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}