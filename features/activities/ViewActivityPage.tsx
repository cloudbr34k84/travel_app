/**
 * @file features/activities/ViewActivityPage.tsx
 * @description Page for viewing a single activity's details.
 * Corresponds to the /activities/:id route.
 */
import React from 'react';
import { PageHeader } from '@shared-components/common/page-header';
import { useParams, Link } from 'wouter';
import { ArrowLeft } from 'lucide-react';

export default function ViewActivityPage() {
  const params = useParams<{ id: string }>();
  const activityId = params.id;

  return (
    <div className="p-6">
      <PageHeader
        title={`View Activity ${activityId ? `(#${activityId})` : ''}`}
        description="Details of the selected activity."
        buttonLabel="Back to Activities"
        buttonIcon={<ArrowLeft className="h-4 w-4" />}
        buttonHref="/activities"
      />
      {/* Placeholder for activity details */}
      <div className="mt-6">
        <p>View Activity Page Content for ID: {activityId}</p>
        {activityId && (
          <Link href={`/activities/${activityId}/edit`} className="text-blue-500 hover:underline mt-4 inline-block">
            Edit Activity
          </Link>
        )}
      </div>
    </div>
  );
}
