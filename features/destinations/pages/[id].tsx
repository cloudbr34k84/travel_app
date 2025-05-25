/**
 * ViewDestinationPage - Comprehensive destination hub page
 * @description Displays destination details with statistics and actions using EntityDetailsLayout hub variant
 * Features activity/accommodation counts, enhanced navigation, and dashboard-style layout
 * @returns JSX.Element - The destination hub page with statistics sidebar
 */

import { useRoute, Link } from "wouter";
import { Button } from "@shared-components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@shared-components/ui/card";
import { StatusBadge } from "@shared-components/ui/status-badge";
import { Edit, MapPin, Building, Smile } from "lucide-react";
import { EntityDetailsLayout } from "@shared/components/common/EntityDetailsLayout";
import { Destination, Activity, Accommodation } from "@shared/schema";
import { useDestination } from "@features/destinations/api/hooks";
import { useActivities } from "@features/activities/api/hooks";
import { useAccommodations } from "@features/accommodations/api/hooks";

interface DestinationWithStatus extends Destination {
  status?: {
    id: number;
    label: string;
  };
}

export default function ViewDestinationPage() {
  const [, params] = useRoute("/destinations/:id");
  const destinationId = params?.id ? parseInt(params.id) : null;

  const { data: destination, isLoading, error } = useDestination(
    destinationId || undefined
  );

  const { data: activities } = useActivities();
  
  const { data: accommodations } = useAccommodations();

  if (!destinationId) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Invalid Destination</h1>
          <p className="text-gray-600 mt-2">The destination ID is not valid.</p>
          <Button 
            onClick={() => navigate('/destinations')}
            className="mt-4"
          >
            Return to Destinations
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (error || !destination) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Destination Not Found</h1>
          <p className="text-gray-600 mt-2">The destination you're looking for doesn't exist.</p>
          <Button 
            onClick={() => navigate('/destinations')}
            className="mt-4"
          >
            Return to Destinations
          </Button>
        </div>
      </div>
    );
  }

  const activityCount = activities ? 
    activities.filter(activity => activity.destinationId === destination.id).length : 0;
  
  const accommodationCount = accommodations ? 
    accommodations.filter(accommodation => accommodation.destinationId === destination.id).length : 0;

  // Create sidebar with statistics and actions
  const sidebar = (
    <>
      {/* Location Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <MapPin className="h-5 w-5 mr-2 text-primary" />
            Location
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <label className="text-sm font-medium text-gray-500">Country</label>
            <p className="text-gray-900">{destination.country}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Region</label>
            <p className="text-gray-900">{destination.region}</p>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Statistics</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Smile className="h-4 w-4 mr-2 text-primary" />
              <span className="text-sm">Activities</span>
            </div>
            <span className="font-semibold">{activityCount}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Building className="h-4 w-4 mr-2 text-primary" />
              <span className="text-sm">Accommodations</span>
            </div>
            <span className="font-semibold">{accommodationCount}</span>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Link href={`/destinations/${destination.id}/edit`}>
            <Button className="w-full">
              <Edit className="h-4 w-4 mr-2" />
              Edit Destination
            </Button>
          </Link>
          <Link href="/destinations">
            <Button variant="outline" className="w-full">
              Back to List
            </Button>
          </Link>
        </CardContent>
      </Card>
    </>
  );

  // Prepare header actions for edit button
  const headerActions = (
    <Button asChild variant="outline">
      <Link href={`/destinations/${destination.id}/edit`}>
        <Edit className="h-4 w-4 mr-2" />
        Edit Destination
      </Link>
    </Button>
  );

  return (
    <EntityDetailsLayout
      title={destination.name}
      subtitle="Destination details"
      image={destination.image}
      description={destination.description}
      status={destination.status ? {
        label: destination.status.label,
        variant: 'secondary'
      } : undefined}
      location={{
        name: destination.country,
        country: destination.region
      }}
      backButton={{
        href: '/destinations',
        label: 'Back to Destinations'
      }}
      headerActions={headerActions}
      sidebar={sidebar}
      isLoading={isLoading}
      error={error || !destination ? {
        title: 'Destination Not Found',
        message: 'The destination you\'re looking for doesn\'t exist.'
      } : undefined}
      variant="hub"
    />
  );
}