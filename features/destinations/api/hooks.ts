/**
 * @file features/destinations/api/hooks.ts
 * @description This file contains TanStack Query hooks for fetching destination data.
 */
import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { Destination } from "@shared/schema";
import { apiRequestWithJson } from "@shared/lib/queryClient";

const DESTINATIONS_QUERY_KEY = "/api/destinations";

/**
 * Fetches a single destination by its ID.
 * @param id The ID of the destination to fetch.
 * @returns The destination data.
 */
const fetchDestination = async (id: number): Promise<Destination> => {
  if (isNaN(id) || id <= 0) {
    throw new Error("Invalid destination ID provided.");
  }
  return apiRequestWithJson<null, Destination>("GET", `${DESTINATIONS_QUERY_KEY}/${id}`);
};

/**
 * Hook to fetch a single destination.
 * @description This hook fetches a destination by its ID and returns the query result.
 * It's enabled only when a valid destination ID is provided.
 * 
 * @param destinationId The ID of the destination to fetch.
 * @param options Optional TanStack Query options to customize the query behavior.
 * @returns A query result object containing data, loading state, and error information.
 * 
 * @example
 * // Fetch a destination with ID 1
 * const { data: destination, isLoading, error } = useDestination(1);
 * 
 * // Access the destination data when loaded
 * if (isLoading) {
 *   return <Loading />;
 * }
 * 
 * if (error || !destination) {
 *   return <ErrorDisplay error={error} />;
 * }
 * 
 * return <DestinationDetails destination={destination} />;
 */
export const useDestination = (
  destinationId: number | undefined,
  options?: Partial<UseQueryOptions<Destination, Error, Destination, (string | number | undefined)[]>>
) => {
  return useQuery<Destination, Error, Destination, (string | number | undefined)[]>({
    queryKey: [DESTINATIONS_QUERY_KEY, destinationId],
    queryFn: () => {
      if (typeof destinationId !== 'number' || isNaN(destinationId)) {
        throw new Error("Destination ID must be a valid number to fetch data.");
      }
      return fetchDestination(destinationId);
    },
    enabled: typeof destinationId === 'number' && !isNaN(destinationId) && destinationId > 0,
    ...options,
  });
};

/**
 * Hook to fetch all destinations.
 * @description This hook fetches all destinations and returns the query result.
 * 
 * @param options Optional TanStack Query options to customize the query behavior.
 * @returns A query result object containing data, loading state, and error information.
 * 
 * @example
 * // Fetch all destinations
 * const { data: destinations, isLoading, error } = useDestinations();
 * 
 * // Render a list of destinations when loaded
 * if (isLoading) {
 *   return <Loading />;
 * }
 * 
 * if (error || !destinations) {
 *   return <ErrorDisplay error={error} />;
 * }
 * 
 * return (
 *   <ul>
 *     {destinations.map(destination => (
 *       <li key={destination.id}>{destination.name}</li>
 *     ))}
 *   </ul>
 * );
 */
export const useDestinations = (
  options?: Partial<UseQueryOptions<Destination[], Error, Destination[], string[]>>
) => {
  return useQuery<Destination[], Error, Destination[], string[]>({
    queryKey: [DESTINATIONS_QUERY_KEY],
    queryFn: fetchDestinations,
    ...options,
  });
};