/**
 * EntityDetailsLayout - A unified layout component for entity detail pages
 * 
 * @component
 * @description A unified layout system providing consistent structure across all entity detail pages.
 * Supports both simple single-column layouts and complex hub layouts with sidebars.
 * 
 * @param {EntityDetailsLayoutProps} props - The component props
 * @param {string} props.title - The main entity title displayed in header and card
 * @param {string} [props.subtitle] - Optional subtitle showing entity type or category
 * @param {string} [props.image] - URL for the hero image with responsive sizing
 * @param {string} [props.description] - Main descriptive text about the entity
 * @param {Object} [props.status] - Status badge configuration with label and variant
 * @param {Object} [props.location] - Geographic location information
 * @param {Object} props.backButton - Back navigation configuration with href and label
 * @param {React.ReactNode} [props.headerActions] - Action buttons rendered in page header
 * @param {React.ReactNode} [props.sidebar] - Sidebar content for hub layout variant
 * @param {React.ReactNode} [props.additionalSections] - Extra content below main card
 * @param {Array} [props.customFields] - Dynamic field data for details grid
 * @param {boolean} [props.isLoading=false] - Loading state with spinner
 * @param {Object} [props.error] - Error state configuration with title and message
 * @param {'simple'|'hub'} [props.variant='simple'] - Layout variant selection
 * 
 * @returns {JSX.Element} The rendered entity details layout
 * 
 * @example
 * // Simple layout for accommodations
 * <EntityDetailsLayout
 *   title={accommodation.name}
 *   subtitle={accommodation.type}
 *   variant="simple"
 *   headerActions={<EditDeleteButtons />}
 * />
 * 
 * @example
 * // Hub layout for destinations with sidebar
 * <EntityDetailsLayout
 *   title={destination.name}
 *   variant="hub"
 *   sidebar={<DestinationSidebar />}
 * />
 */

import React from 'react';
import { Link } from 'wouter';
import { Card, CardHeader, CardContent, CardFooter, CardTitle, CardDescription } from '@shared/components/ui/card';
import { Button } from '@shared/components/ui/button';
import { Badge } from '@shared/components/ui/badge';
import { Alert, AlertTitle, AlertDescription } from '@shared/components/ui/alert';
import { Loader2, AlertTriangle, ArrowLeft, MapPin } from 'lucide-react';
import { PageHeader } from '@shared/components/common/page-header';

export interface EntityDetailsLayoutProps {
  /** The main title of the entity */
  title: string;
  
  /** Subtitle or entity type */
  subtitle?: string;
  
  /** Hero image URL */
  image?: string;
  
  /** Main description text */
  description?: string;
  
  /** Status information with label and variant */
  status?: {
    label: string;
    variant?: 'default' | 'secondary' | 'destructive' | 'outline';
  };
  
  /** Location or destination information */
  location?: {
    name: string;
    country?: string;
  };
  
  /** Back navigation configuration */
  backButton: {
    href: string;
    label?: string;
  };
  
  /** Action buttons in the header */
  headerActions?: React.ReactNode;
  
  /** Optional sidebar content for complex layouts (destinations) */
  sidebar?: React.ReactNode;
  
  /** Additional content sections below main card */
  additionalSections?: React.ReactNode;
  
  /** Custom fields to display in the details grid */
  customFields?: Array<{
    label: string;
    value: React.ReactNode;
    fullWidth?: boolean;
  }>;
  
  /** Loading state */
  isLoading?: boolean;
  
  /** Error state */
  error?: {
    title: string;
    message: string;
  };
  
  /** Layout variant for different page types */
  variant?: 'simple' | 'hub';
}

/**
 * EntityDetailsLayout Component
 * Provides a consistent layout structure for detail pages across the application
 */
export function EntityDetailsLayout({
  title,
  subtitle,
  image,
  description,
  status,
  location,
  backButton,
  headerActions,
  sidebar,
  additionalSections,
  customFields = [],
  isLoading = false,
  error,
  variant = 'simple'
}: EntityDetailsLayoutProps) {
  // Loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-lg">Loading details...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <Link href={backButton.href}>
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {backButton.label || 'Back'}
            </Button>
          </Link>
        </div>
        <PageHeader 
          title={error.title}
          description="Could not load details."
        />
        <Alert variant="destructive" className="mt-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Loading Failed</AlertTitle>
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      </div>
    );
  }

  // Hub layout with sidebar
  if (variant === 'hub') {
    return (
      <div className="p-6">
        <div className="mb-6">
          <Link href={backButton.href}>
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {backButton.label || 'Back'}
            </Button>
          </Link>
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-text">{title}</h1>
              <p className="text-sm text-gray-500">{subtitle || "Details and information"}</p>
            </div>
            {headerActions && (
              <div className="flex space-x-2">
                {headerActions}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Hero Image with Status Overlay */}
            {image && (
              <Card>
                <CardContent className="p-0">
                  <div className="relative h-64 md:h-80">
                    <img
                      src={image}
                      alt={title}
                      className="w-full h-full object-cover rounded-lg"
                    />
                    {status && (
                      <div className="absolute top-4 right-4">
                        <Badge variant={status.variant || 'secondary'}>
                          {status.label}
                        </Badge>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Description */}
            {description && (
              <Card>
                <CardHeader>
                  <CardTitle>About {title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 leading-relaxed">
                    {description}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Additional Sections */}
            {additionalSections}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {sidebar}
          </div>
        </div>
      </div>
    );
  }

  // Simple layout for accommodation/activity pages
  return (
    <div className="p-6">
      <div className="mb-6">
        <Link href={backButton.href}>
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            {backButton.label || 'Back'}
          </Button>
        </Link>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-text">{title}</h1>
            <p className="text-sm text-gray-500">{subtitle || "Details and information"}</p>
          </div>
          {headerActions && (
            <div className="flex space-x-2">
              {headerActions}
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 grid gap-6">
        {/* Main Details Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{title}</CardTitle>
            {subtitle && <CardDescription>{subtitle}</CardDescription>}
          </CardHeader>
          
          <CardContent className="space-y-4">
            {/* Hero Image */}
            {image && (
              <div className="aspect-video w-full rounded-lg overflow-hidden bg-gray-100">
                <img
                  src={image}
                  alt={title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            
            {/* Details Grid */}
            <div className="grid gap-4 md:grid-cols-2">
              {/* Status */}
              {status && (
                <div>
                  <h3 className="font-semibold text-sm text-muted-foreground mb-2">Status</h3>
                  <Badge variant={status.variant || 'secondary'}>
                    {status.label}
                  </Badge>
                </div>
              )}
              
              {/* Location */}
              {location && (
                <div className={!status ? "md:col-span-2" : ""}>
                  <h3 className="font-semibold text-sm text-muted-foreground mb-2">Location</h3>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {location.name}
                      {location.country && `, ${location.country}`}
                    </span>
                  </div>
                </div>
              )}
              
              {/* Custom Fields */}
              {customFields.map((field, index) => (
                <div key={index} className={field.fullWidth ? "md:col-span-2" : ""}>
                  <h3 className="font-semibold text-sm text-muted-foreground mb-2">
                    {field.label}
                  </h3>
                  <div className="text-sm">{field.value}</div>
                </div>
              ))}
            </div>
            
            {/* Description */}
            {description && (
              <div>
                <h3 className="font-semibold text-sm text-muted-foreground mb-2">Description</h3>
                <p className="text-sm leading-relaxed">
                  {description || "No description provided."}
                </p>
              </div>
            )}
          </CardContent>
          
          <CardFooter>
            {/* Footer content can be added here if needed */}
          </CardFooter>
        </Card>

        {/* Additional Sections */}
        {additionalSections}
      </div>
    </div>
  );
}