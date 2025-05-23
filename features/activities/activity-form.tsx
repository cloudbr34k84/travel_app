/**
 * @file ActivityForm.tsx
 * 
 * This file defines the `ActivityForm` component, a reusable form for creating
 * and editing activities within the travel application. It utilizes `react-hook-form`
 * for form management and `zod` for schema validation.
 * 
 * The form schema (`activityFormSchema`) is declared locally within this file
 * rather than being imported from a shared location. This is a deliberate
 * design choice to ensure compatibility with Hot Module Replacement (HMR)
 * and Fast Refresh. When schemas are imported, changes to them might not
 * always trigger a fast refresh of the components using them, leading to
 * inconsistencies during development. Declaring the schema locally mitigates
 * this issue.
 */
import { useEffect, useRef } from "react"; // Added useRef
import { useForm, Path } from "react-hook-form"; // Added Path
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Activity, Destination, insertActivitySchema } from "@shared/schema"; // ✅ runtime values
import type { TravelStatus } from "@shared/schema";     // ✅ type-only import
import { Button } from "@shared-components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@shared-components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@shared-components/ui/form";
import { Input } from "@shared-components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@shared-components/ui/select";
import { Textarea } from "@shared-components/ui/textarea";
import { useQuery } from "@tanstack/react-query";
import { parseServerFieldErrors } from "@shared/lib/utils"; // Added parseServerFieldErrors

/**
 * Extended schema for activity form with additional fields and validations
 */
const activityFormSchema = insertActivitySchema.extend({
  image: z.string().url("Please enter a valid image URL").optional().or(z.literal("")),
  statusId: z.number().int().positive(),
});

/**
 * Type definition for activity form values based on the schema
 */
export type ActivityFormValues = z.infer<typeof activityFormSchema>;

/**
 * Props interface for the ActivityForm component
 */
export interface ActivityFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: ActivityFormValues) => void;
  defaultValues?: Activity & { statusId?: number } | undefined;
  isEditing: boolean;
  serverError?: unknown; // Added serverError prop
}

/**
 * Default empty values for the activity form.
 * Used to initialize the form when no defaultValues are provided or when resetting.
 */
const defaultEmptyValues: ActivityFormValues = {
  name: "",
  description: "",
  category: "",
  destinationId: 0,
  image: "",
  statusId: 0,
};

export function ActivityForm({
  open,
  onOpenChange,
  onSubmit,
  defaultValues,
  isEditing,
  serverError, // Destructure serverError
}: ActivityFormProps) {
  /**
   * Initialize the form with typesafe validation using Zod schema
   */
  const form = useForm<ActivityFormValues>({
    resolver: zodResolver(activityFormSchema),
    defaultValues: defaultEmptyValues,
    mode: "onChange",
  });

  /**
   * Effect to reset the form when `defaultValues` change and `isEditing` is true.
   */
  useEffect(() => {
    if (isEditing && defaultValues) {
      const transformedValues: ActivityFormValues = {
        name: defaultValues.name || "",
        description: defaultValues.description || "",
        category: defaultValues.category || "",
        destinationId: Number(defaultValues.destinationId) || 0,
        image: defaultValues.image === null ? "" : defaultValues.image || "",
        statusId: defaultValues.statusId || 0,
      };
      form.reset(transformedValues);
    } else if (!isEditing) {
      form.reset(defaultEmptyValues);
    }
  }, [isEditing, defaultValues, form]);

  // Effect to set server-side errors on the form
  const prevServerErrorRef = useRef<unknown>(null);
  useEffect(() => {
    if (serverError && serverError !== prevServerErrorRef.current) {
      const fieldErrors = parseServerFieldErrors(serverError);
      if (fieldErrors) {
        Object.entries(fieldErrors).forEach(([fieldName, message]) => {
          // Check if fieldName is a valid Path<ActivityFormValues> or a general error key
          if (fieldName in defaultEmptyValues || fieldName === 'general' || fieldName === 'root.serverError') {
            form.setError(fieldName as Path<ActivityFormValues>, { type: 'server', message });
          } else {
            // Fallback for errors that don't match a specific field
            form.setError("root.serverError", { type: "server", message: message || "An unexpected server error occurred." });
          }
        });
      }
    }
    prevServerErrorRef.current = serverError;
  }, [serverError, form, prevServerErrorRef]);

  const { data: destinations, isLoading: isLoadingDestinations } = useQuery<Destination[]>({
    queryKey: ["/api/destinations"],
  });

  const { data: travelStatuses, isLoading: isLoadingTravelStatuses } = useQuery<TravelStatus[]>({
    queryKey: ["/api/travel-statuses"],
  });

  const categories = [
    { value: "Sightseeing", label: "Sightseeing" },
    { value: "Adventure", label: "Adventure" },
    { value: "Culture", label: "Culture" },
    { value: "Relaxation", label: "Relaxation" },
    { value: "Food", label: "Food" },
    { value: "Shopping", label: "Shopping" },
    { value: "Nature", label: "Nature" },
    { value: "History", label: "History" },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Activity" : "Add New Activity"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit((values: ActivityFormValues) => {
            onSubmit(values);
          })} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Activity Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Eiffel Tower Visit" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Visit the iconic Eiffel Tower..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value?.toString() ?? ""}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="destinationId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Destination</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(parseInt(value))}
                    value={field.value?.toString() ?? ""}
                    disabled={isLoadingDestinations}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a destination" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {destinations && destinations.length > 0 ? (
                        destinations.map((destination: Destination) => (
                          <SelectItem key={destination.id} value={destination.id.toString()}>
                            {destination.name}, {destination.country}
                          </SelectItem>
                        ))
                      ) : (
                        <div className="px-2 py-4 text-center">
                          <p className="text-sm text-muted-foreground mb-2">No destinations—add one</p>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="w-full"
                            onClick={(e) => {
                              e.preventDefault();
                              onOpenChange(false);
                              window.dispatchEvent(new CustomEvent('openDestinationForm'));
                            }}
                          >
                            Add Destination
                          </Button>
                        </div>
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="statusId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(parseInt(value))}
                    value={field.value?.toString() ?? ""}
                    disabled={isLoadingTravelStatuses}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {travelStatuses && travelStatuses.length > 0 ? (
                          travelStatuses.map((status: TravelStatus) => (
                      <SelectItem key={status.id} value={status.id.toString()}>
                        {status.label}
                      </SelectItem>
                        ))
                      ) : (
                        <div className="px-2 py-4 text-center">
                          <p className="text-sm text-muted-foreground mb-2">No statuses available</p>
                        </div>
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="image"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Image URL (optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="https://example.com/image.jpg" {...field} value={field.value || ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Display general server errors not specific to a field */}
            {form.formState.errors.root?.serverError && (
                <FormItem>
                    <FormMessage>{form.formState.errors.root.serverError.message}</FormMessage>
                </FormItem>
            )}
            <DialogFooter>
              <Button type="submit" className="bg-primary hover:bg-primary-800" disabled={form.formState.isSubmitting || !form.formState.isValid}>
                {form.formState.isSubmitting ? (isEditing ? "Saving..." : "Adding...") : (isEditing ? "Save Changes" : "Add Activity")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

ActivityForm.displayName = "ActivityForm";
