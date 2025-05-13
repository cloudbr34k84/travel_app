import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, MapPin } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Activity, Destination } from "@shared/schema";

interface ActivityCardProps {
  activity: Activity;
  destination: Destination;
  onEdit: (activity: Activity) => void;
  onDelete: (id: number) => void;
  onView: (activity: Activity) => void;
}

export function ActivityCard({
  activity,
  destination,
  onEdit,
  onDelete,
  onView,
}: ActivityCardProps) {
  return (
    <Card className="overflow-hidden">
      <div className="relative h-44">
        <img
          src={activity.image || "https://images.unsplash.com/photo-1454942901704-3c44c11b2ad1"}
          alt={activity.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-3 right-3">
          <span className="text-xs font-medium bg-primary-800 text-white rounded-full px-2 py-1">
            {activity.category}
          </span>
        </div>
      </div>
      <CardContent className="p-4">
        <h3 className="text-lg font-semibold text-gray-text mb-1">{activity.name}</h3>
        <div className="flex items-center text-xs text-gray-500 mb-2">
          <MapPin className="h-3 w-3 mr-1" />
          {destination.name}, {destination.country}
        </div>
        <p className="text-sm text-gray-600 line-clamp-2">{activity.description}</p>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex justify-between">
        <Button 
          variant="outline" 
          size="sm" 
          className="text-primary border-primary hover:bg-primary/10"
          onClick={() => onView(activity)}
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
            <DropdownMenuItem onClick={() => onEdit(activity)}>
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem 
              className="text-destructive focus:text-destructive"
              onClick={() => onDelete(activity.id)}
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardFooter>
    </Card>
  );
}