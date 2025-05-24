/**
 * @file hooks.ts
 * @description This file contains TanStack Query hooks for fetching travel status data.
 */
import { useQuery } from '@tanstack/react-query';
import type { TravelStatus } from '@shared/schema'; // Assuming TravelStatus is exported from shared schema

// Placeholder for API fetching function - replace with your actual API call
const fetchTravelStatuses = async (): Promise<TravelStatus[]> => {
  // This is a placeholder. In a real application, you would fetch this from your API.
  // For now, returning a mock list based on common travel statuses.
  // The actual TravelStatus type from schema seems to be: { id: number; description: string | null; label: string; }
  console.log('Fetching travel statuses...');
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  // Mock data based on the type { id: number; description: string | null; label: string; }
  return [
    { id: 1, label: 'Planned', description: 'Activity or travel is planned but not yet booked.' },
    { id: 2, label: 'Booked', description: 'Booking confirmed for the activity or travel.' },
    { id: 3, label: 'In Progress', description: 'Currently undertaking this activity or travel.' },
    { id: 4, label: 'Completed', description: 'Successfully completed the activity or travel.' },
    { id: 5, label: 'Cancelled', description: 'The activity or travel has been cancelled.' },
    { id: 6, label: 'Pending', description: 'Awaiting confirmation or further action.' },
    // Add other statuses as defined in your application
  ];
};

/**
 * @hook useTravelStatuses
 * @description Custom hook to fetch all travel statuses.
 * Utilizes TanStack Query for data fetching, caching, and synchronization.
 *
 * @returns {object} The result of the useQuery hook, including data, isLoading, error, etc.
 *                   The data is an array of TravelStatus objects.
 *
 * @example
 * const { data: statuses, isLoading, error } = useTravelStatuses();
 * if (isLoading) return <p>Loading statuses...</p>;
 * if (error) return <p>Error fetching statuses: {error.message}</p>;
 * // Use statuses in your component
 */
export const useTravelStatuses = () => {
  return useQuery<TravelStatus[], Error>({
    queryKey: ['travelStatuses'], // Unique key for this query
    queryFn: fetchTravelStatuses, // Function that fetches the data
    // Optional: Configure staleTime, cacheTime, refetchOnWindowFocus, etc.
    // staleTime: 5 * 60 * 1000, // 5 minutes
    // cacheTime: 30 * 60 * 1000, // 30 minutes
  });
};
