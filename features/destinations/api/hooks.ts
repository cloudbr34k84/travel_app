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
 * @param destinationId The ID of the destination.
 * @param options Optional TanStack Query options.
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
 * Fetches all destinations.
 * @returns A list of all destinations.
 */
const fetchDestinations = async (): Promise<Destination[]> => {
  return apiRequestWithJson<null, Destination[]>("GET", DESTINATIONS_QUERY_KEY);
};

/**
 * Hook to fetch all destinations.
 * @param options Optional TanStack Query options.
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
