/**
 * @file features/accommodations/pages/[id]/edit.tsx
 * @description Page for editing an existing accommodation.
 * Renders the AccommodationForm pre-filled with accommodation data.
 */
import React from 'react';
import { useParams, useLocation } from 'wouter';
import { AccommodationForm, AccommodationFormValues } from '@features/accommodations/accommodation-form';
import { useAccommodation, useUpdateAccommodation } from '@features/accommodations/api/hooks';
import { PageHeader } from '@shared-components/common/page-header';
import { useToast } from '@shared/hooks/use-toast';
import { parseServerFieldErrors } from '@shared/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@shared-components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@shared-components/ui/alert';
import { Loader2, AlertTriangle } from 'lucide-react';
import { Accommodation } from '@shared/schema';

export default function EditAccommodationPage() {
  const { id } = useParams<{ id: string }>();
  const accommodationId = id ? parseInt(id, 10) : undefined;
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [serverError, setServerError] = React.useState<unknown | null>(null);

  const { data: accommodation, isLoading, isError, error: queryError } = useAccommodation(accommodationId, {
    enabled: !!accommodationId && !isNaN(accommodationId),
  });

  const updateAccommodationMutation = useUpdateAccommodation({
    onSuccess: () => {
      toast({ title: 'Success', description: 'Accommodation updated successfully.' });
      setLocation(`/accommodations/${accommodationId}`); // Navigate to view page after edit
    },
    onError: (error) => {
      setServerError(error);
      toast({ title: 'Error', description: 'Failed to update accommodation. Please check the form for errors.', variant: 'destructive' });
    },
  });

  const handleSubmit = (values: AccommodationFormValues) => {
    if (!accommodationId) return;
    setServerError(null); // Clear previous server errors
     const submissionValues = {
      ...values,
      statusId: Number(values.statusId),
      destinationId: Number(values.destinationId),
    };
    updateAccommodationMutation.mutate({ id: accommodationId, data: submissionValues });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-lg">Loading accommodation data...</p>
      </div>
    );
  }

  if (isError || !accommodation) {
    return (
      <div className="p-6">
        <PageHeader title="Error" description="Could not load accommodation data for editing." showBackButton={true} backButtonHref="/accommodations" />
        <Alert variant="destructive" className="mt-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Loading Failed</AlertTitle>
          <AlertDescription>
            {queryError?.message || "An unexpected error occurred, or the accommodation was not found."}
          </AlertDescription>
        </Alert>
      </div>
    );
  }
  
  // Transform accommodation data to match form values, especially for optional fields or type differences
  const defaultFormValues: AccommodationFormValues = {
    ...accommodation,
    name: accommodation.name || '',
    type: accommodation.type || '',
    destinationId: Number(accommodation.destinationId) || 0,
    statusId: Number(accommodation.statusId) || 0,
    image: accommodation.image || '',
    description: accommodation.description || '',
    // Ensure all fields in AccommodationFormValues are covered
    priorityLevel: accommodation.priorityLevel || 'medium',
    notes: accommodation.notes || '',
    addressStreet: accommodation.addressStreet || '',
    addressLine2: accommodation.addressLine2 || '',
    addressCity: accommodation.addressCity || '',
    addressRegion: accommodation.addressRegion || '',
    addressPostcode: accommodation.addressPostcode || '',
    addressCountry: accommodation.addressCountry || '',
  };


  return (
    <div className="p-6">
      <PageHeader
        title={`Edit: ${accommodation.name}`}
        description="Update the details of this accommodation."
        showBackButton={true}
        backButtonHref={`/accommodations/${accommodationId}`}
      />
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Accommodation Details</CardTitle>
        </CardHeader>
        <CardContent>
          <AccommodationForm
            onSubmit={handleSubmit}
            isEditing={true}
            defaultValues={defaultFormValues as Accommodation} // Cast needed due to schema differences potentially
            isSubmitting={updateAccommodationMutation.isPending}
            serverError={serverError}
            // Removed modal-specific props: open, onOpenChange
          />
        </CardContent>
      </Card>
    </div>
  );
}
