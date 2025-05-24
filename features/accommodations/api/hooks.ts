/**
 * @file hooks.ts
 * @description This file contains TanStack Query hooks for fetching and mutating accommodation data.
 */
import { useQuery, useMutation, UseMutationOptions, UseQueryOptions } from "@tanstack/react-query";
import { Accommodation, InsertAccommodation, insertAccommodationSchema } from "@shared/schema";
import { apiRequestWithJson, queryClient } from "@shared/lib/queryClient";
import { z } from "zod";

const ACCOMMODATIONS_QUERY_KEY = "/api/accommodations";

/**
 * Fetches a single accommodation by its ID.
 * @param id The ID of the accommodation to fetch.
 * @returns The accommodation data.
 */
const fetchAccommodation = async (id: number): Promise<Accommodation> => {
  if (isNaN(id) || id <= 0) {
    throw new Error("Invalid accommodation ID provided.");
  }
  return apiRequestWithJson<null, Accommodation>("GET", `${ACCOMMODATIONS_QUERY_KEY}/${id}`);
};

/**
 * Hook to fetch a single accommodation.
 * @param accommodationId The ID of the accommodation.
 * @param options Optional TanStack Query options.
 */
export const useAccommodation = (
  accommodationId: number | undefined,
  options?: Partial<UseQueryOptions<Accommodation, Error, Accommodation, (string | number | undefined)[]>>
) => {
  return useQuery<Accommodation, Error, Accommodation, (string | number | undefined)[]>({
    queryKey: [ACCOMMODATIONS_QUERY_KEY, accommodationId],
    queryFn: () => {
      if (typeof accommodationId !== 'number' || isNaN(accommodationId)) {
        throw new Error("Accommodation ID must be a valid number to fetch data.");
      }
      return fetchAccommodation(accommodationId);
    },
    enabled: typeof accommodationId === 'number' && !isNaN(accommodationId) && accommodationId > 0, // Only run query if id is a valid number
    ...options,
  });
};

/**
 * Fetches all accommodations.
 * @returns A list of all accommodations.
 */
const fetchAccommodations = async (): Promise<Accommodation[]> => {
  return apiRequestWithJson<null, Accommodation[]>("GET", ACCOMMODATIONS_QUERY_KEY);
};

/**
 * Hook to fetch all accommodations.
 * @param options Optional TanStack Query options.
 */
export const useAccommodations = (
  options?: Partial<UseQueryOptions<Accommodation[], Error, Accommodation[], string[]>>
) => {
  return useQuery<Accommodation[], Error, Accommodation[], string[]>({
    queryKey: [ACCOMMODATIONS_QUERY_KEY],
    queryFn: fetchAccommodations,
    ...options,
  });
};


/**
 * Creates a new accommodation.
 * @param accommodationData The data for the new accommodation.
 * @returns The created accommodation.
 */
const createAccommodation = async (accommodationData: InsertAccommodation): Promise<Accommodation> => {
  // Validate with Zod before sending
  const validatedData = insertAccommodationSchema.parse(accommodationData);
  return apiRequestWithJson<InsertAccommodation, Accommodation>("POST", ACCOMMODATIONS_QUERY_KEY, validatedData);
};

/**
 * Hook to create a new accommodation.
 * @param options Optional TanStack Query mutation options.
 */
export const useCreateAccommodation = (
  options?: Partial<UseMutationOptions<Accommodation, Error, InsertAccommodation, unknown>>
) => {
  return useMutation<Accommodation, Error, InsertAccommodation, unknown>({
    mutationFn: createAccommodation,
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: [ACCOMMODATIONS_QUERY_KEY] });
      if (options?.onSuccess) {
        options.onSuccess(data, variables, context);
      }
    },
    ...options,
  });
};

interface UpdateAccommodationParams {
  id: number;
  data: Partial<InsertAccommodation>;
}

/**
 * Updates an existing accommodation.
 * @param id The ID of the accommodation to update.
 * @param accommodationData The data to update the accommodation with.
 * @returns The updated accommodation.
 */
const updateAccommodation = async ({ id, data }: UpdateAccommodationParams): Promise<Accommodation> => {
  // Partial validation for updates
  const validatedData = insertAccommodationSchema.partial().parse(data);
  return apiRequestWithJson<Partial<InsertAccommodation>, Accommodation>("PUT", `${ACCOMMODATIONS_QUERY_KEY}/${id}`, validatedData);
};

/**
 * Hook to update an existing accommodation.
 * @param options Optional TanStack Query mutation options.
 */
export const useUpdateAccommodation = (
  options?: Partial<UseMutationOptions<Accommodation, Error, UpdateAccommodationParams, unknown>>
) => {
  return useMutation<Accommodation, Error, UpdateAccommodationParams, unknown>({
    mutationFn: updateAccommodation,
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: [ACCOMMODATIONS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [ACCOMMODATIONS_QUERY_KEY, variables.id] }); // Invalidate specific accommodation
      if (options?.onSuccess) {
        options.onSuccess(data, variables, context);
      }
    },
    ...options,
  });
};

/**
 * Deletes an accommodation by its ID.
 * @param id The ID of the accommodation to delete.
 */
const deleteAccommodation = async (id: number): Promise<void> => {
  return apiRequestWithJson<null, void>("DELETE", `${ACCOMMODATIONS_QUERY_KEY}/${id}`);
};

/**
 * Hook to delete an accommodation.
 * @param options Optional TanStack Query mutation options.
 */
export const useDeleteAccommodation = (
  options?: Partial<UseMutationOptions<void, Error, number, unknown>>
) => {
  return useMutation<void, Error, number, unknown>({
    mutationFn: deleteAccommodation,
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: [ACCOMMODATIONS_QUERY_KEY] });
      if (options?.onSuccess) {
        options.onSuccess(data, variables, context);
      }
    },
    ...options,
  });
};
