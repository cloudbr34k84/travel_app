/**
 * @file features/activities/EditActivityPage.tsx
 * @description Page for editing an existing activity.
 * Corresponds to the /activities/:id/edit route.
 */
import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom'; // Changed from wouter
import { ActivityForm, ActivityFormValues } from '@features/activities/activity-form';
import { useActivity, useUpdateActivity } from '@features/activities/api/hooks'; // Assuming these hooks exist
import { PageHeader } from '@shared-components/common/page-header';
import { useToast } from '@shared/hooks/use-toast';
// import { parseServerFieldErrors } from '@shared/lib/utils'; // Already in activity-form
import { Card, CardContent, CardHeader, CardTitle } from '@shared-components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@shared-components/ui/alert';
import { Loader2, AlertTriangle, ArrowLeft } from 'lucide-react';

export default function EditActivityPage() {
  const { id } = useParams<{ id: string }>(); // useParams from react-router-dom
  const activityId = id ? parseInt(id, 10) : undefined;
  const navigate = useNavigate(); // Changed from wouter's useLocation
  const { toast } = useToast();
  const [serverError, setServerError] = React.useState<unknown | null>(null);

  const { data: activity, isLoading, isError, error: queryError } = useActivity(activityId, {
    enabled: !!activityId && !isNaN(activityId),
  });

  const updateActivityMutation = useUpdateActivity({
    onSuccess: (data) => {
      toast({ title: 'Success', description: 'Activity updated successfully.' });
      navigate(data?.id ? `/activities/${data.id}` : '/activities'); // Navigate to view or list
    },
    onError: (error) => {
      setServerError(error);
      toast({ title: 'Error', description: 'Failed to update activity. Please check the form.', variant: 'destructive' });
    },
  });

  const handleSubmit = (values: ActivityFormValues) => {
    if (!activityId) return;
    setServerError(null);
    const submissionValues = {
      ...values,
      statusId: Number(values.statusId),
      destinationId: Number(values.destinationId),
      image: values.image || undefined, // Ensure image is undefined if empty, not null
    };
    updateActivityMutation.mutate({ id: activityId, data: submissionValues });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-lg">Loading activity data...</p>
      </div>
    );
  }

  if (isError || !activity) {
    return (
      <div className="p-6">
        <PageHeader 
          title="Error"
          description="Could not load activity data for editing."
          buttonLabel="Back to Activities"
          buttonIcon={<ArrowLeft className="h-4 w-4" />}
          buttonHref="/activities"
        />
        <Alert variant="destructive" className="mt-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Loading Failed</AlertTitle>
          <AlertDescription>
            {queryError?.message || "An unexpected error occurred, or the activity was not found."}
          </AlertDescription>
        </Alert>
      </div>
    );
  }
  
  const defaultFormValues: ActivityFormValues = {
    // Spread activity data first
    name: activity.name || '',
    description: activity.description || '',
    category: activity.category || '',
    destinationId: Number(activity.destinationId) || 0, // Ensure number
    statusId: Number(activity.statusId) || 0, // Ensure number
    image: activity.image || '', // Convert null to empty string for form, form schema handles undefined
  };

  return (
    <div className="p-6">
      <PageHeader
        title={`Edit: ${activity.name}`}
        description="Update the details of this activity."
        buttonLabel="Back to Activity"
        buttonIcon={<ArrowLeft className="h-4 w-4" />}
        buttonHref={activityId ? `/activities/${activityId}` : '/activities'}
      />
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Activity Details</CardTitle>
        </CardHeader>
        <CardContent>
          <ActivityForm
            onSubmit={handleSubmit}
            mode="edit"
            defaultValues={defaultFormValues} // No cast needed now
            isLoading={updateActivityMutation.isPending}
            serverError={serverError}
          />
        </CardContent>
      </Card>
    </div>
  );
}
