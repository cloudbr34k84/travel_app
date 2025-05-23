/**
 * @file DestinationForm.tsx
 * @description This file contains the DestinationForm component, which is used for adding or editing destinations.
 * The Zod schema (destinationFormSchema) for form validation is defined locally within this file
 * to ensure compatibility with Vite's Fast Refresh. If this schema needs to be reused
 * elsewhere (e.g., for server-side validation or in tests), it should be moved to
 * `@shared/schemas` and imported here, rather than being exported from this component file.
 *
 * This form includes dropdown components (Select) that rely on proper positioning.
 * If dropdowns appear to open in an unintended direction (e.g., upwards instead of downwards),
 * ensure that the `SelectContent` component has appropriate props like `side="bottom"`
 * and that parent containers do not impose restrictive `overflow` or height styles
 * that could mislead the positioning logic. The dropdowns typically use a portal
 * to render outside the immediate DOM tree, minimizing issues with local stacking contexts,
 * but viewport proximity can still influence their placement.
 */
// filepath: /root/travel_app/features/destinations/destination-form.tsx
import { useForm, Path } from "react-hook-form"; // Added Path
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Destination, insertDestinationSchema } from "@shared/schema";
import { Button } from "@shared-components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@shared-components/ui/form";
import { Input } from "@shared-components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@shared-components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@shared-components/ui/dialog";
import { useEffect, useRef } from "react"; // Added useRef
import { Textarea } from "@shared-components/ui/textarea";
import { useQuery } from "@tanstack/react-query";
import { parseServerFieldErrors } from "@shared/lib/utils"; // Added parseServerFieldErrors

interface TravelStatus {
  id: number;
  label: string;
}

const destinationFormSchema = insertDestinationSchema.extend({
  image: z.string().url("Please enter a valid image URL").optional().or(z.literal("")),
  statusId: z.number().int().positive({ message: "Please select a status." }),
  description: z.string().optional().default(""),
});

export type DestinationFormValues = z.infer<typeof destinationFormSchema>;

export type DestinationFormProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultValues?: Destination;
  isEditing: boolean;
  onSubmit: (values: DestinationFormValues) => void;
  serverError?: unknown; // Added serverError prop
};

const defaultEmptyValues: DestinationFormValues = {
  name: "",
  country: "",
  region: "",
  description: "",
  image: "",
  statusId: 0,
};

export function DestinationForm({
  open,
  onOpenChange,
  onSubmit,
  defaultValues,
  isEditing,
  serverError, // Destructure serverError
}: DestinationFormProps) {
  const { data: travelStatuses, isLoading: isLoadingTravelStatuses } = useQuery<TravelStatus[]>({
    queryKey: ['/api/travel-statuses'],
    queryFn: async () => {
      const response = await fetch('/api/travel-statuses');
      if (!response.ok) {
        throw new Error('Failed to fetch travel statuses');
      }
      return response.json();
    },
  });

  const form = useForm<DestinationFormValues>({
    resolver: zodResolver(destinationFormSchema),
    defaultValues: defaultEmptyValues,
    mode: "onChange",
  });

  useEffect(() => {
    if (isEditing && defaultValues) {
      form.reset({
        name: defaultValues.name || "",
        country: defaultValues.country || "",
        region: defaultValues.region || "",
        description: defaultValues.description || "",
        image: defaultValues.image === null ? "" : defaultValues.image || "",
        statusId: defaultValues.statusId || 0,
      });
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
          // Check if fieldName is a valid Path<DestinationFormValues> or a general error key
          if (fieldName in defaultEmptyValues || fieldName === 'general' || fieldName === 'root.serverError') {
            form.setError(fieldName as Path<DestinationFormValues>, { type: 'server', message });
          } else {
            // Fallback for errors that don't match a specific field
            form.setError("root.serverError", { type: "server", message: message || "An unexpected server error occurred." });
          }
        });
      }
    }
    prevServerErrorRef.current = serverError;
  }, [serverError, form, prevServerErrorRef]);

  const regions = [
    { value: "Africa", label: "Africa" },
    { value: "Asia", label: "Asia" },
    { value: "Europe", label: "Europe" },
    { value: "North America", label: "North America" },
    { value: "South America", label: "South America" },
    { value: "Oceania", label: "Oceania" },
    { value: "Antarctica", label: "Antarctica" },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Destination" : "Add New Destination"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((values: DestinationFormValues) => {
              onSubmit(values);
            })}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Paris" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="country"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Country</FormLabel>
                  <FormControl>
                    <Input placeholder="France" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="region"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Region</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a region" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {regions.map((region) => (
                        <SelectItem key={region.value} value={region.value}>
                          {region.label}
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
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Describe the destination..." {...field} value={field.value ?? ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="image"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Image URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://example.com/image.jpg" {...field} value={field.value ?? ""} />
                  </FormControl>
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
                    <SelectContent side="bottom"> {/* Added side="bottom" */}
                      {isLoadingTravelStatuses ? (
                        <SelectItem value="loading" disabled>
                          Loading statuses...
                        </SelectItem>
                      ) : (
                        travelStatuses?.map((status) => (
                          <SelectItem key={status.id} value={status.id.toString()}>
                            {status.label}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
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
              <Button type="submit" className="bg-primary hover:bg-primary-800" disabled={form.formState.isSubmitting}>
                {isEditing ? "Save Changes" : "Add Destination"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

DestinationForm.displayName = "DestinationForm";
