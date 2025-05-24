/**
 * @file features/accommodations/pages/[id].tsx
 * @description Page for viewing a single accommodation's details.
 * Displays accommodation information in a read-only format.
 */
import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAccommodation, useDeleteAccommodation } from '@features/accommodations/api/hooks';
import { PageHeader } from '@shared-components/common/page-header';
import { Button } from '@shared-components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@shared-components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@shared-components/ui/alert';
import { Loader2, AlertTriangle, Trash2, Edit } from 'lucide-react';
import { useToast } from '@shared/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@shared-components/ui/dialog";
import { Destination, useDestination } from '@features/destinations/api/hooks'; // Assuming this hook exists

export default function ViewAccommodationPage() {
  const { id } = useParams<{ id: string }>();
  const accommodationId = id ? parseInt(id, 10) : undefined;
  const navigate = useNavigate();
  const { toast } = useToast();
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);

  const { data: accommodation, isLoading, isError, error } = useAccommodation(accommodationId, {
    enabled: !!accommodationId && !isNaN(accommodationId),
  });

  const { data: destination, isLoading: isLoadingDestination } = useDestination(accommodation?.destinationId, {
    enabled: !!accommodation?.destinationId,
  });

  const deleteAccommodationMutation = useDeleteAccommodation({
    onSuccess: () => {
      toast({ title: 'Success', description: 'Accommodation deleted successfully.' });
      navigate('/accommodations');
    },
    onError: (err) => {
      toast({ title: 'Error', description: `Failed to delete accommodation: ${err.message}`, variant: 'destructive' });
      setDeleteDialogOpen(false);
    },
  });

  if (isLoading || (accommodation && isLoadingDestination)) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-lg">Loading accommodation details...</p>
      </div>
    );
  }

  if (isError || !accommodation) {
    return (
      <div className="p-6">
        <PageHeader title="Error" description="Could not load accommodation details." showBackButton={true} backButtonHref="/accommodations" />
        <Alert variant="destructive" className="mt-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Loading Failed</AlertTitle>
          <AlertDescription>
            {error?.message || "An unexpected error occurred, or the accommodation was not found."}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const handleDelete = () => {
    if (accommodation?.id) {
      deleteAccommodationMutation.mutate(accommodation.id);
    }
  };

  return (
    <div className="p-6">
      <PageHeader
        title={accommodation.name}
        description={`Details for ${accommodation.type}`}
        showBackButton={true}
        backButtonHref="/accommodations"
      >
        <div className="flex space-x-2">
          <Button asChild variant="outline">
            <Link to={`/accommodations/${accommodation.id}/edit`}>
              <Edit className="mr-2 h-4 w-4" /> Edit
            </Link>
          </Button>
          <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 className="mr-2 h-4 w-4" /> Delete
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Confirm Deletion</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete "{accommodation.name}"? This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
                <Button variant="destructive" onClick={handleDelete} disabled={deleteAccommodationMutation.isPending}>
                  {deleteAccommodationMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Delete
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </PageHeader>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>{accommodation.name}</CardTitle>
          <CardDescription>{accommodation.type}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {accommodation.image && (
            <div className="w-full h-64 mb-4 overflow-hidden rounded-md bg-gray-100">
              <img
                src={accommodation.image}
                alt={accommodation.name}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <div>
            <h4 className="font-semibold text-sm text-gray-600">Description</h4>
            <p className="text-gray-800">{accommodation.description || "No description provided."}</p>
          </div>
          <div>
            <h4 className="font-semibold text-sm text-gray-600">Destination</h4>
            <p className="text-gray-800">
              {isLoadingDestination ? "Loading destination..." : destination ? `${destination.name}, ${destination.country}` : "N/A"}
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-sm text-gray-600">Status</h4>
            <p className="text-gray-800">
              {/* Assuming statusLabel is part of accommodation or fetched separately */}
              {accommodation.statusId ? `Status ID: ${accommodation.statusId}` : "N/A"}
            </p>
          </div>
           {/* Add more fields as necessary, e.g., address */}
          {accommodation.addressStreet && (
            <div>
              <h4 className="font-semibold text-sm text-gray-600">Address</h4>
              <p className="text-gray-800">
                {accommodation.addressStreet}
                {accommodation.addressLine2 ? `, ${accommodation.addressLine2}` : ''}
                <br />
                {accommodation.addressCity}, {accommodation.addressRegion} {accommodation.addressPostcode}
                <br />
                {accommodation.addressCountry}
              </p>
            </div>
          )}
        </CardContent>
        <CardFooter>
          {/* Could add related info or actions here */}
        </CardFooter>
      </Card>
    </div>
  );
}

