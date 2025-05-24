/**
 * @file features/activities/NewActivityPage.tsx
 * @description Page for creating a new activity.
 * Corresponds to the /activities/new route.
 */
import React from 'react';
import { useLocation, Link } from 'wouter';
import { ActivityForm, ActivityFormValues } from '@features/activities/activity-form';
import { useCreateActivity } from '@features/activities/api/hooks'; // Assuming this hook exists
import { PageHeader } from '@shared-components/common/page-header';
import { useToast } from '@shared/hooks/use-toast';
// import { parseServerFieldErrors } from '@shared/lib/utils'; // Already in activity-form
import { Card, CardContent, CardHeader, CardTitle } from '@shared-components/ui/card';
import { ArrowLeft } from 'lucide-react';

export default function NewActivityPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [serverError, setServerError] = React.useState<unknown | null>(null);

  const createActivityMutation = useCreateActivity({
    onSuccess: (data) => {
      toast({ title: 'Success', description: 'Activity created successfully.' });
      setLocation(data?.id ? `/activities/${data.id}` : '/activities'); // Navigate to view or list
    },
    onError: (error) => {
      setServerError(error);
      toast({ title: 'Error', description: 'Failed to create activity. Please check the form.', variant: 'destructive' });
    },
  });

  const handleSubmit = (values: ActivityFormValues) => {
    setServerError(null);
    // Ensure statusId and destinationId are numbers, and image is handled if empty
    const submissionValues = {
      ...values,
      statusId: Number(values.statusId),
      destinationId: Number(values.destinationId),
      image: values.image || undefined, // Set to undefined if empty string, as schema might expect optional
    };
    createActivityMutation.mutate(submissionValues);
  };

  return (
    <div className="p-6">
      <PageHeader
        title="Create New Activity"
        description="Define the details for a new activity."
        buttonLabel="Back to Activities"
        buttonIcon={<ArrowLeft className="h-4 w-4" />}
        buttonHref="/activities"
      />
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Activity Details</CardTitle>
        </CardHeader>
        <CardContent>
          <ActivityForm
            onSubmit={handleSubmit}
            mode="create"
            isLoading={createActivityMutation.isPending}
            serverError={serverError}
          />
        </CardContent>
      </Card>
    </div>
  );
}
