
/**
 * NewActivityPage - Create new activity
 * @description Page for creating a new activity
 * @route /activities/new - Corresponds to this route in the application
 * @returns JSX.Element - The activity creation page
 */
import React from 'react';
import { useLocation, Link } from 'wouter';
import { ActivityForm, ActivityFormValues } from '@features/activities/activity-form';
import { useCreateActivity } from '@features/activities/api/hooks';
import { PageHeader } from '@shared-components/common/page-header';
import { useToast } from '@shared/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@shared-components/ui/card';
import { ArrowLeft } from 'lucide-react';

export default function NewActivityPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [serverError, setServerError] = React.useState<unknown | null>(null);

  const createActivityMutation = useCreateActivity({
    onSuccess: (data) => {
      toast({ title: 'Success', description: 'Activity created successfully.' });
      setLocation(data?.id ? `/activities/${data.id}` : '/activities');
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
