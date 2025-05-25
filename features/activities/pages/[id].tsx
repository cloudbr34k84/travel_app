
/**
 * ViewActivityPage - Displays detailed activity information
 * @description Renders activity details with edit capabilities using the shared EntityDetailsLayout.
 * Includes a consistent inline action button block with Edit functionality.
 * 
 * Action Button Configuration:
 * - editPath: Navigation path for editing the activity
 * - showDelete: Boolean flag to display delete button (false for activities)
 * - onDelete: Not used for activities since delete is disabled
 * 
 * To maintain this inline pattern:
 * - Keep button structure consistent with other entity pages
 * - Use same styling (Edit: default variant, Delete: destructive variant)
 * - Maintain flex gap-2 layout for proper spacing
 * 
 * @route /activities/:id - Corresponds to this route in the application
 * @returns JSX.Element - The activity detail page
 */
import React from 'react';
import { useParams, Link } from 'wouter';
import { useActivity } from '@features/activities/api/hooks';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@shared-components/ui/button';
import { Edit } from 'lucide-react';
import { EntityDetailsLayout } from '@shared/components/common/EntityDetailsLayout';
import { Destination, TravelStatus } from '@shared/schema';

export default function ViewActivityPage() {
  const params = useParams<{ id: string }>();
  const activityId = params.id ? parseInt(params.id, 10) : undefined;

  const { data: activity, isLoading, isError, error } = useActivity(activityId, {
    enabled: !!activityId && !isNaN(activityId),
  });

  // Fetch destinations for activity location info
  const { data: destinations } = useQuery<Destination[]>({
    queryKey: ["/api/destinations"],
  });

  // Fetch travel statuses for status display
  const { data: travelStatuses } = useQuery<TravelStatus[]>({
    queryKey: ["/api/travel-statuses"],
  });

  const destination = destinations?.find(d => d.id === activity?.destinationId);
  const status = travelStatuses?.find(s => s.id === activity?.statusId);

  // Prepare custom fields for category
  const customFields = activity?.category ? [{
    label: 'Category',
    value: activity.category,
    fullWidth: false
  }] : [];

  // Unified inline action button block configuration
  const editPath = activity ? `/activities/${activity.id}/edit` : '';
  const showDelete = false; // Disable delete functionality for activities
  
  // Prepare header actions with unified button structure
  const headerActions = activity ? (
    <div className="flex gap-2">
      <Button asChild>
        <Link href={editPath}>
          <Edit className="mr-2 h-4 w-4" /> Edit
        </Link>
      </Button>
      {showDelete && (
        <Button variant="destructive">
          Delete
        </Button>
      )}
    </div>
  ) : undefined;

  // Prepare additional sections for status information
  const additionalSections = status?.description ? (
    <div className="space-y-6">
      <div className="bg-muted/50 p-6 rounded-lg">
        <h3 className="font-semibold text-lg mb-2">Status Information</h3>
        <p className="text-sm text-muted-foreground">{status.description}</p>
      </div>
    </div>
  ) : undefined;

  return (
    <EntityDetailsLayout
      title={activity?.name || 'Activity'}
      subtitle="Activity details and information"
      image={activity?.image}
      description={activity?.description}
      status={status ? {
        label: status.label,
        variant: status.label === 'completed' ? 'default' : 'outline'
      } : undefined}
      location={destination ? {
        name: destination.name,
        country: destination.country
      } : undefined}
      backButton={{
        href: '/activities',
        label: 'Back to Activities'
      }}
      headerActions={headerActions}
      customFields={customFields}
      additionalSections={additionalSections}
      isLoading={isLoading}
      error={isError || !activity ? {
        title: 'Error',
        message: error?.message || 'Activity not found or an unexpected error occurred.'
      } : undefined}
      variant="simple"
    />
  );
}
