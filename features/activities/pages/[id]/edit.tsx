
/**
 * EditActivityPage - Edit existing activity
 * @description Page for editing an existing activity
 * @route /activities/:id/edit - Corresponds to this route in the application
 * @returns JSX.Element - The activity edit page
 */
import React from 'react';
import { useParams, useLocation, Link } from 'wouter';
import { ActivityForm, ActivityFormValues } from '@features/activities/activity-form';
import { useActivity, useUpdateActivity } from '@features/activities/api/hooks';
import { PageHeader } from '@shared-components/common/page-header';
import { useToast } from '@shared/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@shared-components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@shared-components/ui/alert';
import { Loader2, AlertTriangle, ArrowLeft } from 'lucide-react';

export default function EditActivityPage() {
  const { id } = useParams<{ id: string }>();
  const activityId = id ? parseInt(id, 10) : undefined;
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [serverError, setServerError] = React.useState<unknown | null>(null);

  const { data: activity, isLoading, isError, error: queryError } = useActivity(activityId, {
    enabled: !!activityId && !isNaN(activityId),
  });

  const updateActivityMutation = useUpdateActivity({
    onSuccess: () => {
      toast({ title: 'Success', description: 'Activity updated successfully.' });
      setLocation(activityId ? `/activities/${activityId}` : '/activities');
    },
    onError: (error) => {
      setServerError(error);
      toast({ title: 'Error', description: 'Failed to update activity. Please check the form.', variant: 'destructive' });
    },
  });

  const handleSubmit = (values: ActivityFormValues) => {
    if (!activity?.id) return;
    
    setServerError(null);
    const submissionValues = {
      ...values,
      id: activity.id,
      statusId: Number(values.statusId),
      destinationId: Number(values.destinationId),
      image: values.image || undefined,
    };
    updateActivityMutation.mutate(submissionValues);
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (isError || !activity) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {queryError?.message || 'Activity not found or an unexpected error occurred.'}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Prepare form default values from activity data
  const defaultFormValues: ActivityFormValues = {
    name: activity.name,
    description: activity.description || '',
    category: activity.category || '',
    statusId: activity.statusId,
    destinationId: activity.destinationId,
    image: activity.image || '',
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
            defaultValues={defaultFormValues}
            isLoading={updateActivityMutation.isPending}
            serverError={serverError}
          />
        </CardContent>
      </Card>
    </div>
  );
}
