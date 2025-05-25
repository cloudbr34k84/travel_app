/**
 * ViewAccommodationPage - Displays detailed accommodation information
 * @description Renders accommodation details with edit/delete capabilities using the shared EntityDetailsLayout
 * @returns JSX.Element - The accommodation detail page
 */
import React from 'react';
import { useParams, Link, useLocation } from 'wouter';
import { useAccommodation, useDeleteAccommodation } from '@features/accommodations/api/hooks';
import { Button } from '@shared-components/ui/button';
import { Loader2, Trash2, Edit } from 'lucide-react';
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
import { Destination, useDestination } from '@features/destinations/api/hooks';
import { EntityDetailsLayout } from '@shared/components/common/EntityDetailsLayout';

export default function ViewAccommodationPage() {
  const { id } = useParams<{ id: string }>();
  const accommodationId = id ? parseInt(id, 10) : undefined;
  const [, setLocation] = useLocation();
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
      setLocation('/accommodations');
    },
    onError: (err) => {
      toast({ title: 'Error', description: `Failed to delete accommodation: ${err.message}`, variant: 'destructive' });
      setDeleteDialogOpen(false);
    },
  });

  const handleDelete = () => {
    if (accommodation?.id) {
      deleteAccommodationMutation.mutate(accommodation.id);
    }
  };

  // Prepare custom fields for address
  const customFields = accommodation?.addressStreet ? [{
    label: 'Address',
    value: (
      <div>
        <div>{accommodation.addressStreet}</div>
        {accommodation.addressLine2 && <div>{accommodation.addressLine2}</div>}
        <div>
          {accommodation.addressCity}, {accommodation.addressRegion} {accommodation.addressPostcode}
        </div>
        <div>{accommodation.addressCountry}</div>
      </div>
    ),
    fullWidth: true
  }] : [];

  // Prepare header actions
  const headerActions = accommodation ? (
    <>
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
    </>
  ) : undefined;

  return (
    <EntityDetailsLayout
      title={accommodation?.name || 'Accommodation'}
      subtitle={accommodation?.type}
      image={accommodation?.image}
      description={accommodation?.description}
      status={accommodation?.statusId ? { 
        label: `Status ID: ${accommodation.statusId}`, 
        variant: 'secondary' 
      } : undefined}
      location={destination && !isLoadingDestination ? {
        name: destination.name,
        country: destination.country
      } : undefined}
      backButton={{
        href: '/accommodations',
        label: 'Back to Accommodations'
      }}
      headerActions={headerActions}
      customFields={customFields}
      isLoading={isLoading || (accommodation && isLoadingDestination)}
      error={isError || !accommodation ? {
        title: 'Error',
        message: error?.message || 'An unexpected error occurred, or the accommodation was not found.'
      } : undefined}
      variant="simple"
    />
  );
}

