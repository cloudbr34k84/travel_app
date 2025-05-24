/**
 * @file ViewDestinationPage - Page for viewing destination details
 * @description This page displays comprehensive destination information in a read-only view.
 * It includes all destination details, related activities and accommodations count,
 * and provides navigation options to edit or return to the destinations list.
 */

import { useRoute, useNavigate } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@shared-components/common/page-header";
import { Button } from "@shared-components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@shared-components/ui/card";
import { StatusBadge } from "@shared-components/ui/status-badge";
import { ArrowLeft, Edit, MapPin, Building, Smile } from "lucide-react";
import { Destination, Activity, Accommodation } from "@shared/schema";

interface DestinationWithStatus extends Destination {
  status?: {
    id: number;
    label: string;
  };
}

export default function ViewDestinationPage() {
  const [, params] = useRoute("/destinations/:id");
  const navigate = useNavigate();
  const destinationId = params?.id ? parseInt(params.id) : null;

  const { data: destination, isLoading, error } = useQuery<DestinationWithStatus>({
    queryKey: ['/api/destinations', destinationId],
    enabled: !!destinationId,
  });

  const { data: activities } = useQuery<Activity[]>({
    queryKey: ['/api/activities'],
  });

  const { data: accommodations } = useQuery<Accommodation[]>({
    queryKey: ['/api/accommodations'],
  });

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

  return (
    <div className="p-6">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate('/destinations')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Destinations
        </Button>
        <PageHeader
          title={destination.name}
          description="Destination details"
          buttonLabel="Edit Destination"
          buttonIcon={<Edit className="h-4 w-4" />}
          onButtonClick={() => navigate(`/destinations/${destination.id}/edit`)}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Destination Image */}
          {destination.image && (
            <Card>
              <CardContent className="p-0">
                <div className="relative h-64 md:h-80">
                  <img
                    src={destination.image}
                    alt={`${destination.name}, ${destination.country}`}
                    className="w-full h-full object-cover rounded-lg"
                  />
                  <div className="absolute top-4 right-4">
                    {destination.status?.label && (
                      <StatusBadge statusLabel={destination.status.label} />
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Description */}
          {destination.description && (
            <Card>
              <CardHeader>
                <CardTitle>About this destination</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">
                  {destination.description}
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
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
              <div>
                <label className="text-sm font-medium text-gray-500">Status</label>
                <div className="mt-1">
                  {destination.status?.label ? (
                    <StatusBadge statusLabel={destination.status.label} />
                  ) : (
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                      No status
                    </span>
                  )}
                </div>
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
              <Button 
                className="w-full"
                onClick={() => navigate(`/destinations/${destination.id}/edit`)}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Destination
              </Button>
              <Button 
                variant="outline"
                className="w-full"
                onClick={() => navigate('/destinations')}
              >
                Back to List
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}