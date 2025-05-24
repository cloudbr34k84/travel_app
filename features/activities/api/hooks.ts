/**
 * @file hooks.ts
 * @description TanStack Query hooks for fetching and mutating activity data.
 * Provides standardized API operations for activities with proper error handling and caching.
 */
import { useQuery, useMutation, UseMutationOptions, UseQueryOptions } from "@tanstack/react-query";
import { Activity, InsertActivity, insertActivitySchema } from "@shared/schema";
import { apiRequestWithJson, queryClient } from "@shared/lib/queryClient";
import { z } from "zod";

const ACTIVITIES_QUERY_KEY = "/api/activities";

/**
 * Fetches a single activity by its ID.
 * @param id The ID of the activity to fetch.
 * @returns The activity data.
 */
const fetchActivity = async (id: number): Promise<Activity> => {
  if (isNaN(id) || id <= 0) {
    throw new Error("Invalid activity ID provided.");
  }
  return apiRequestWithJson<null, Activity>("GET", `${ACTIVITIES_QUERY_KEY}/${id}`);
};

/**
 * Hook to fetch a single activity.
 * @param activityId The ID of the activity.
 * @param options Optional TanStack Query options.
 */
export const useActivity = (
  activityId: number | undefined,
  options?: Partial<UseQueryOptions<Activity, Error, Activity, (string | number | undefined)[]>>
) => {
  return useQuery<Activity, Error, Activity, (string | number | undefined)[]>({
    queryKey: [ACTIVITIES_QUERY_KEY, activityId],
    queryFn: () => {
      if (typeof activityId !== 'number' || isNaN(activityId)) {
        throw new Error("Activity ID must be a valid number to fetch data.");
      }
      return fetchActivity(activityId);
    },
    enabled: typeof activityId === 'number' && !isNaN(activityId) && activityId > 0,
    ...options,
  });
};

/**
 * Fetches all activities.
 * @returns A list of all activities.
 */
const fetchActivities = async (): Promise<Activity[]> => {
  return apiRequestWithJson<null, Activity[]>("GET", ACTIVITIES_QUERY_KEY);
};

/**
 * Hook to fetch all activities.
 * @param options Optional TanStack Query options.
 */
export const useActivities = (
  options?: Partial<UseQueryOptions<Activity[], Error, Activity[], string[]>>
) => {
  return useQuery<Activity[], Error, Activity[], string[]>({
    queryKey: [ACTIVITIES_QUERY_KEY],
    queryFn: fetchActivities,
    ...options,
  });
};

/**
 * Creates a new activity.
 * @param activityData The data for the new activity.
 * @returns The created activity.
 */
const createActivity = async (activityData: InsertActivity): Promise<Activity> => {
  // Validate with Zod before sending
  const validatedData = insertActivitySchema.parse(activityData);
  return apiRequestWithJson<InsertActivity, Activity>("POST", ACTIVITIES_QUERY_KEY, validatedData);
};

/**
 * Hook to create a new activity.
 * @param options Optional TanStack Query mutation options.
 */
export const useCreateActivity = (
  options?: Partial<UseMutationOptions<Activity, Error, InsertActivity, unknown>>
) => {
  return useMutation<Activity, Error, InsertActivity, unknown>({
    mutationFn: createActivity,
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: [ACTIVITIES_QUERY_KEY] });
      if (options?.onSuccess) {
        options.onSuccess(data, variables, context);
      }
    },
    ...options,
  });
};

interface UpdateActivityParams {
  id: number;
  data: Partial<InsertActivity>;
}

/**
 * Updates an existing activity.
 * @param params Object containing the activity ID and update data.
 * @returns The updated activity.
 */
const updateActivity = async ({ id, data }: UpdateActivityParams): Promise<Activity> => {
  if (isNaN(id) || id <= 0) {
    throw new Error("Invalid activity ID provided for update.");
  }
  return apiRequestWithJson<Partial<InsertActivity>, Activity>("PUT", `${ACTIVITIES_QUERY_KEY}/${id}`, data);
};

/**
 * Hook to update an existing activity.
 * @param options Optional TanStack Query mutation options.
 */
export const useUpdateActivity = (
  options?: Partial<UseMutationOptions<Activity, Error, UpdateActivityParams, unknown>>
) => {
  return useMutation<Activity, Error, UpdateActivityParams, unknown>({
    mutationFn: updateActivity,
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: [ACTIVITIES_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [ACTIVITIES_QUERY_KEY, variables.id] });
      if (options?.onSuccess) {
        options.onSuccess(data, variables, context);
      }
    },
    ...options,
  });
};

/**
 * Deletes an activity.
 * @param id The ID of the activity to delete.
 */
const deleteActivity = async (id: number): Promise<void> => {
  if (isNaN(id) || id <= 0) {
    throw new Error("Invalid activity ID provided for deletion.");
  }
  return apiRequestWithJson<null, void>("DELETE", `${ACTIVITIES_QUERY_KEY}/${id}`);
};

/**
 * Hook to delete an activity.
 * @param options Optional TanStack Query mutation options.
 */
export const useDeleteActivity = (
  options?: Partial<UseMutationOptions<void, Error, number, unknown>>
) => {
  return useMutation<void, Error, number, unknown>({
    mutationFn: deleteActivity,
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: [ACTIVITIES_QUERY_KEY] });
      if (options?.onSuccess) {
        options.onSuccess(data, variables, context);
      }
    },
    ...options,
  });
};
