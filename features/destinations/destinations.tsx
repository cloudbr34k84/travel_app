/**
 * Destinations page component
 * 
 * Manages the display and interaction with destination data:
 * - Lists all destinations with filtering options using CommonTable component
 * - Allows creating, editing, and deleting destinations
 * 
 * Table Integration:
 * - Uses CommonTable component for consistent data display
 * - Column definitions include ID, Name, Country, Region, Status, Activity Count, Accommodation Count
 * - Data is enriched with foreign key lookups (status names) and aggregated counts
 * - Provides fallback values ('Unknown') for missing foreign key relationships
 * 
 * Data Resolution:
 * - resolvedDestinations maps over fetched destinations to add enriched data
 * - statusId is resolved to status name using travelStatuses lookup
 * - Activity and accommodation counts are calculated for each destination
 */
import { useState } from "react";
import { Link } from "wouter";
import { PageHeader } from "@shared-components/common/page-header";
import { SearchFilter } from "@shared-components/ui/search-filter";
import { DestinationCard } from "@features/destinations/destination-card";
import CommonTable from "@/components/common/CommonTable";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { Destination, Activity, Accommodation } from "@shared/schema";
import { useToast } from "@shared/hooks/use-toast";
import { apiRequest, queryClient } from "@shared/lib/queryClient";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@shared-components/ui/dialog";
import { Button } from "@shared-components/ui/button";

interface FilterOption {
  value: string;
  label: string;
}

export default function Destinations() {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [regionFilter, setRegionFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [destinationToDelete, setDestinationToDelete] = useState<number | null>(null);

  // Fetch destinations
  const { data: destinations, isLoading } = useQuery<Destination[]>({
    queryKey: ["/api/destinations"],
  });

  // Fetch activities
  const { data: activities } = useQuery<Activity[]>({
    queryKey: ["/api/activities"],
  });

  // Fetch accommodations
  const { data: accommodations } = useQuery<Accommodation[]>({
    queryKey: ["/api/accommodations"],
  });

  // Fetch travel statuses for status resolution
  const { data: travelStatuses } = useQuery({
    queryKey: ["/api/travel-statuses"],
  });

  /**
   * Column definitions for CommonTable component
   * - Defines table structure with headers and data accessors
   * - Resolves foreign keys to human-readable values
   * - statusId is resolved to status name using travelStatuses lookup
   */
  const columns = [
    { header: 'ID', accessor: (row: any) => row.id },
    { header: 'Name', accessor: (row: any) => row.name },
    { header: 'Country', accessor: (row: any) => row.country },
    { header: 'Region', accessor: (row: any) => row.region },
    { header: 'Status', accessor: (row: any) => row.statusName || 'Unknown' },
    { header: 'Activities', accessor: (row: any) => row.activityCount || 0 },
    { header: 'Accommodations', accessor: (row: any) => row.accommodationCount || 0 },
  ];



  // Delete destination mutation
  const deleteDestination = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/destinations/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/destinations"] });
      toast({
        title: "Success",
        description: "Destination deleted successfully",
      });
      setDeleteDialogOpen(false);
      setDestinationToDelete(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete destination",
        variant: "destructive",
      });
    },
  });



  const handleDelete = (id: number) => {
    setDestinationToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (destinationToDelete !== null) {
      deleteDestination.mutate(destinationToDelete);
    }
  };



  // Filter destinations based on search and filters
  const filteredDestinations: Destination[] = destinations?.filter((destination: Destination) => {
    const matchesSearch = search === "" || 
      destination.name.toLowerCase().includes(search.toLowerCase()) ||
      destination.country.toLowerCase().includes(search.toLowerCase());
    
    const matchesRegion = regionFilter === "all" || destination.region === regionFilter;
    const matchesStatus = statusFilter === "all" || destination.statusId.toString() === statusFilter;
    
    return matchesSearch && matchesRegion && matchesStatus;
  }) || [];

  /**
   * Prepare enriched data for table display
   * - Resolves statusId to status name
   * - Adds activity and accommodation counts
   * - Provides fallback values for missing data
   */
  const resolvedDestinations = filteredDestinations?.map(destination => ({
    ...destination,
    statusName: (travelStatuses as any)?.find((status: any) => status.id === destination.statusId)?.label || 'Unknown',
    activityCount: getActivityCount(destination.id),
    accommodationCount: getAccommodationCount(destination.id),
  })) || [];

  // Count activities and accommodations for each destination
  const getActivityCount = (destinationId: number): number => {
    if (!activities) return 0;
    return activities.filter((activity: Activity) => activity.destinationId === destinationId).length;
  };

  const getAccommodationCount = (destinationId: number): number => {
    if (!accommodations) return 0;
    return accommodations.filter((accommodation: Accommodation) => accommodation.destinationId === destinationId).length;
  };

  const regionOptions = [
    { value: "all", label: "All Regions" },
    { value: "Africa", label: "Africa" },
    { value: "Asia", label: "Asia" },
    { value: "Europe", label: "Europe" },
    { value: "North America", label: "North America" },
    { value: "South America", label: "South America" },
    { value: "Oceania", label: "Oceania" },
    { value: "Antarctica", label: "Antarctica" },
  ];

  const statusOptions = [
    { value: "all", label: "All Status" },
    { value: "visited", label: "Visited" },
    { value: "planned", label: "Planned" },
    { value: "wishlist", label: "Wishlist" },
  ];

  return (
    <div className="p-6">
      <PageHeader
        title="Destinations"
        description="Manage your travel destinations"
        buttonLabel="Add Destination"
        buttonIcon={<Plus className="h-4 w-4" />}
        onButtonClick={() => window.location.href = '/destinations/new'}
      />

      <SearchFilter
        searchPlaceholder="Search destinations..."
        onSearchChange={setSearch}
        filters={[
          {
            name: "Regions",
            options: regionOptions,
            value: regionFilter,
            onChange: setRegionFilter,
          },
          {
            name: "Status",
            options: statusOptions,
            value: statusFilter,
            onChange: setStatusFilter,
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
        <CommonTable columns={columns} data={resolvedDestinations} />
      )}



      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Destination</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this destination? This action cannot be undone.
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
    </div>
  );
}
