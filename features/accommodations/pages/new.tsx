/**
 * @file features/accommodations/pages/new.tsx
 * @description Page for creating a new accommodation.
 * Renders the AccommodationForm in 'create' mode.
 */
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AccommodationForm, AccommodationFormValues } from '@features/accommodations/accommodation-form';
import { useCreateAccommodation } from '@features/accommodations/api/hooks';
import { PageHeader } from '@shared-components/common/page-header';
import { useToast } from '@shared/hooks/use-toast';
import { parseServerFieldErrors } from '@shared/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@shared-components/ui/card';

export default function NewAccommodationPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [serverError, setServerError] = React.useState<unknown | null>(null);

  const createAccommodationMutation = useCreateAccommodation({
    onSuccess: () => {
      toast({ title: 'Success', description: 'Accommodation created successfully.' });
      navigate('/accommodations');
    },
    onError: (error) => {
      setServerError(error);
      toast({ title: 'Error', description: 'Failed to create accommodation. Please check the form for errors.', variant: 'destructive' });
    },
  });

  const handleSubmit = (values: AccommodationFormValues) => {
    setServerError(null); // Clear previous server errors
    // Ensure statusId and destinationId are numbers
    const submissionValues = {
      ...values,
      statusId: Number(values.statusId),
      destinationId: Number(values.destinationId),
    };
    createAccommodationMutation.mutate(submissionValues);
  };

  return (
    <div className="p-6">
      <PageHeader
        title="Add New Accommodation"
        description="Fill in the details to add a new accommodation to your list."
        showBackButton={true}
        backButtonHref="/accommodations"
      />
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Accommodation Details</CardTitle>
        </CardHeader>
        <CardContent>
          <AccommodationForm
            onSubmit={handleSubmit}
            isEditing={false}
            isSubmitting={createAccommodationMutation.isPending}
            serverError={serverError}
            // Removed modal-specific props: open, onOpenChange
            // The form will now be controlled by its presence on the page
          />
        </CardContent>
      </Card>
    </div>
  );
}
