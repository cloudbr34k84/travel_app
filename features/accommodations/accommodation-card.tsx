import { Card, CardContent, CardFooter } from "@shared-components/ui/card";
import { Button } from "@shared-components/ui/button";
import { MoreHorizontal, MapPin, Building } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@shared-components/ui/dropdown-menu";
import { Accommodation, Destination } from "@shared/schema";
import { StatusBadge } from "@shared-components/ui/status-badge";

interface AccommodationCardProps {
  accommodation: Accommodation & { statusLabel?: string };
  destination: Destination;
  onEdit: (accommodation: Accommodation) => void;
  onDelete: (id: number) => void;
  onView: (accommodation: Accommodation) => void;
}

export function AccommodationCard({
  accommodation,
  destination,
  onEdit,
  onDelete,
  onView,
}: AccommodationCardProps) {
  return (
    <Card className="overflow-hidden">
      <div className="relative h-44">
        <img
          src={accommodation.image || "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa"}
          alt={accommodation.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-3 right-3 flex items-center space-x-2">
          {accommodation.statusLabel && <StatusBadge statusLabel={accommodation.statusLabel} />}
          <span className="text-xs font-medium bg-amber-100 text-amber-800 rounded-full px-2 py-1">
            {accommodation.type}
          </span>
        </div>
      </div>
      <CardContent className="p-4">
        <h3 className="text-lg font-semibold text-gray-text mb-1">{accommodation.name}</h3>
        <div className="flex items-center text-xs text-gray-500 mb-2">
          <MapPin className="h-3 w-3 mr-1" />
          {destination.name}, {destination.country}
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex justify-between">
        <Button 
          variant="outline" 
          size="sm" 
          className="text-primary border-primary hover:bg-primary/10"
          onClick={() => onView(accommodation)}
        >
          View Details
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(accommodation)}>
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem 
              className="text-destructive focus:text-destructive"
              onClick={() => onDelete(accommodation.id)}
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardFooter>
    </Card>
  );
}