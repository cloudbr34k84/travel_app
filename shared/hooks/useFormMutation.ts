import { useMutation, useQueryClient, QueryKey, UseMutationOptions, UseMutationResult } from '@tanstack/react-query';
import { useToast } from './use-toast'; // Assuming use-toast.ts is in the same directory

/**
 * Props for the `useFormMutation` hook.
 *
 * @template TInput - The type of the input data for the mutation function.
 * @template TResult - The type of the result from the mutation function.
 * @template TError - The type of the error from the mutation function, defaults to `Error`.
 * @template TContext - The type of the context used by react-query, defaults to `unknown`.
 */
interface UseFormMutationProps<TInput, TResult, TError = Error, TContext = unknown> {
  /**
   * The asynchronous function that performs the mutation.
   * It receives the input data and should return a Promise resolving to the result.
   */
  mutationFn: (data: TInput) => Promise<TResult>;
  /**
   * The query key (or an array of query keys) to invalidate upon successful mutation.
   * This helps in keeping related data fresh.
   */
  queryKey: QueryKey;
  /**
   * Message to display in a toast notification upon successful mutation.
   */
  successMessage: string;
  /**
   * Message to display in a toast notification if the mutation fails.
   */
  errorMessage: string;
  /**
   * Optional callback function to execute upon successful mutation.
   * Receives the mutation result, input variables, and context.
   */
  onSuccess?: (data: TResult, variables: TInput, context: TContext | undefined) => void | Promise<unknown>;
  /**
   * Optional callback function to execute if the mutation fails.
   * Receives the error, input variables, and context.
   */
  onError?: (error: TError, variables: TInput, context: TContext | undefined) => void | Promise<unknown>;
  /**
   * Optional additional react-query mutation options.
   */
  options?: Omit<UseMutationOptions<TResult, TError, TInput, TContext>, 'mutationFn' | 'onSuccess' | 'onError'>;
}

/**
 * A custom hook that wraps React Query's `useMutation` to provide standardized
 * form mutation handling, including automatic toast notifications for success/error
 * and query invalidation on success.
 *
 * @template TInput - The type of the input data for the mutation function.
 * @template TResult - The type of the result from the mutation function.
 * @template TError - The type of the error from the mutation function, defaults to `Error`.
 * @template TContext - The type of the context used by react-query, defaults to `unknown`.
 *
 * @param {UseFormMutationProps<TInput, TResult, TError, TContext>} props - The configuration for the form mutation.
 * @returns {UseMutationResult<TResult, TError, TInput, TContext>} The result object from `useMutation`,
 * providing status, data, error, and the mutate function.
 *
 * @example
 * const {
 *   mutate: createUser,
 *   isLoading: isCreatingUser,
 * } = useFormMutation<
 *   CreateUserInput,
 *   User,
 * >({
 *   mutationFn: async (userData) => api.createUser(userData),
 *   queryKey: ['users'],
 *   successMessage: 'User created successfully!',
 *   errorMessage: 'Failed to create user.',
 *   onSuccess: (newUser) => {
 *     console.log('New user:', newUser);
 *   },
 * });
 *
 * // To use:
 * // createUser({ name: 'John Doe', email: 'john@example.com' });
 */
export function useFormMutation<TInput, TResult, TError = Error, TContext = unknown>(
  {
    mutationFn,
    queryKey,
    successMessage,
    errorMessage,
    onSuccess: customOnSuccess,
    onError: customOnError,
    options,
  }: UseFormMutationProps<TInput, TResult, TError, TContext>
): UseMutationResult<TResult, TError, TInput, TContext> {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<TResult, TError, TInput, TContext>({
    mutationFn,
    onSuccess: async (data, variables, context) => {
      await queryClient.invalidateQueries({ queryKey });
      toast({
        title: 'Success',
        description: successMessage,
      });
      if (customOnSuccess) {
        await customOnSuccess(data, variables, context);
      }
    },
    onError: async (error, variables, context) => {
      toast({
        title: 'Error',
        description: (error as any)?.message || errorMessage, // Attempt to get message from error object
        variant: 'destructive',
      });
      if (customOnError) {
        await customOnError(error, variables, context);
      }
    },
    ...options, // Spread any additional react-query options
  });
}
