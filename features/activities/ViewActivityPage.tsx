/**
 * @file features/activities/ViewActivityPage.tsx
 * @description Page for viewing a single activity's details.
 * Corresponds to the /activities/:id route.
 */
import React from 'react';
import { PageHeader } from '@shared-components/common/page-header';
import { useParams, Link } from 'wouter';
import { useActivity } from '@features/activities/api/hooks';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@shared-components/ui/card';
import { Badge } from '@shared-components/ui/badge';
import { Button } from '@shared-components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@shared-components/ui/alert';
import { ArrowLeft, Edit, MapPin, Loader2, AlertTriangle } from 'lucide-react';
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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-lg">Loading activity details...</p>
      </div>
    );
  }

  if (isError || !activity) {
    return (
      <div className="p-6">
        <PageHeader
          title="Error"
          description="Could not load activity details."
          buttonLabel="Back to Activities"
          buttonIcon={<ArrowLeft className="h-4 w-4" />}
          buttonHref="/activities"
        />
        <Alert variant="destructive" className="mt-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Loading Failed</AlertTitle>
          <AlertDescription>
            {error?.message || "Activity not found or an unexpected error occurred."}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const destination = destinations?.find(d => d.id === activity.destinationId);
  const status = travelStatuses?.find(s => s.id === activity.statusId);

  return (
    <div className="p-6">
      <PageHeader
        title={activity.name}
        description="Activity details and information"
        buttonLabel="Back to Activities"
        buttonIcon={<ArrowLeft className="h-4 w-4" />}
        buttonHref="/activities"
      />

      <div className="mt-6 grid gap-6">
        {/* Main Activity Details Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-2xl">{activity.name}</CardTitle>
            <Link href={`/activities/${activity.id}/edit`}>
              <Button variant="outline" size="sm">
                <Edit className="h-4 w-4 mr-2" />
                Edit Activity
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-4">
            {activity.image && (
              <div className="aspect-video w-full rounded-lg overflow-hidden">
                <img
                  src={activity.image}
                  alt={activity.name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h3 className="font-semibold text-sm text-muted-foreground mb-2">Category</h3>
                <Badge variant="secondary">{activity.category}</Badge>
              </div>
              
              <div>
                <h3 className="font-semibold text-sm text-muted-foreground mb-2">Status</h3>
                <Badge variant={status?.label === 'completed' ? 'default' : 'outline'}>
                  {status?.label || 'Unknown'}
                </Badge>
              </div>
              
              {destination && (
                <div className="md:col-span-2">
                  <h3 className="font-semibold text-sm text-muted-foreground mb-2">Location</h3>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{destination.name}, {destination.country}</span>
                  </div>
                </div>
              )}
            </div>
            
            {activity.description && (
              <div>
                <h3 className="font-semibold text-sm text-muted-foreground mb-2">Description</h3>
                <p className="text-sm leading-relaxed">{activity.description}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Additional Information Card */}
        {status?.description && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Status Information</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{status.description}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
