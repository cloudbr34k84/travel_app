import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { MoreHorizontal, MapPin, Smile, Building } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Destination } from "@shared/schema";

export interface DestinationCardProps {
  destination: Destination;
  activityCount: number;
  accommodationCount: number;
  onEdit: (destination: Destination) => void;
  onDelete: (id: number) => void;
  onView: (destination: Destination) => void;
}

export function DestinationCard({
  destination,
  activityCount,
  accommodationCount,
  onEdit,
  onDelete,
  onView,
}: DestinationCardProps) {
  return (
    <Card className="overflow-hidden">
      <div className="relative h-48">
        <img
          src={destination.image}
          alt={`${destination.name}, ${destination.country}`}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-3 right-3">
          <StatusBadge status={destination.status as "visited" | "planned" | "wishlist"} />
        </div>
      </div>
      <div className="p-5">
        <h3 className="text-xl font-semibold text-gray-text mb-1">{destination.name}</h3>
        <p className="text-gray-500 text-sm mb-3">
          {destination.country}, {destination.region}
        </p>
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-gray-500 flex items-center">
            <Smile className="h-4 w-4 mr-1 text-primary" />
            {activityCount} Activities
          </span>
          <span className="text-sm text-gray-500 flex items-center">
            <Building className="h-4 w-4 mr-1 text-primary" />
            {accommodationCount} Accommodations
          </span>
        </div>
        <div className="flex space-x-2">
          <Button 
            className="flex-1 bg-primary hover:bg-primary-800" 
            onClick={() => onView(destination)}
          >
            View Details
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="p-2">
                <MoreHorizontal className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(destination)}>
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="text-destructive focus:text-destructive"
                onClick={() => onDelete(destination.id)}
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </Card>
  );
}
