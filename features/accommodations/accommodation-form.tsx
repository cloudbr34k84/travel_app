/**
 * @file AccommodationForm.tsx
 * @description This file contains the AccommodationForm component, used for adding or editing accommodations.
 * The Zod schema (accommodationFormSchema) is declared as a local constant to avoid breaking Vite's Fast Refresh.
 * If needed in other parts of the codebase, move it to `@shared/schemas` instead of exporting from this file.
 */
// filepath: /root/travel_app/features/accommodations/accommodation-form.tsx

import React, { forwardRef, useEffect, useRef } from "react"; // Added useRef
import { useForm, Controller, Path } from "react-hook-form"; // Added Path
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Accommodation, Destination, InsertAccommodation } from "@shared/schema";
import type { TravelStatus } from "@shared/schema"; // ✅ type-only import
import { insertAccommodationSchema } from "@shared/schema";

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
import { Textarea } from "@shared-components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@shared-components/ui/select";

import { useToast } from "@shared/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { parseServerFieldErrors } from "@shared/lib/utils"; // Added import

/**
 * Extended schema for accommodation form with additional fields and validations
 */
const accommodationFormSchema = insertAccommodationSchema.extend({
  image: z.string().url("Please enter a valid image URL").optional().or(z.literal('')),
  statusId: z.number().int().positive(),
  description: z.string().min(1, "Description is required"),
});

/**
 * Type definition for accommodation form values based on the schema
 */
export type AccommodationFormValues = z.infer<typeof accommodationFormSchema>;

/**
 * Props interface for the AccommodationForm component
 *
 * @property open - Controls the visibility state of the accommodation form dialog
 * @property onOpenChange - Callback function that is triggered when dialog open state changes
 * @property onSubmit - Callback function that handles form submission with validated values
 * @property defaultValues - Pre-populated values for editing an existing accommodation
 * @property isEditing - Flag indicating whether the form is in edit mode
 * @property isSubmitting - Flag indicating whether a submission is in progress (optional, managed by parent)
 * @property onError - Optional callback for handling server-side validation errors
 * @property serverError - Optional server error object to populate form errors
 */
export interface AccommodationFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: AccommodationFormValues) => void;
  defaultValues?: Accommodation | undefined;
  isEditing: boolean;
  isSubmitting?: boolean;
  onError?: (error: Error) => void; // This might be removable if serverError handles all cases
  serverError?: unknown; // Added serverError prop
}

/**
 * Default empty values for the accommodation form.
 * Used to initialize the form when no defaultValues are provided or when resetting.
 */
const defaultEmptyValues: AccommodationFormValues = {
  name: "",
  type: "",
  destinationId: 0,
  image: "",
  statusId: 0,
  description: "", // Added description field with empty string default
};

// Define a type for the ref exposed by the form
// type AccommodationFormRef = {
//   parseServerValidationErrors: (error: Error) => boolean;
// };
// Removed AccommodationFormRef as parseServerValidationErrors is being removed

// Use a named function for the forwardRef to improve debugging
export const AccommodationForm = forwardRef<HTMLFormElement, AccommodationFormProps>( // Changed ref type as useImperativeHandle is removed
  function AccommodationForm(props, ref) {
    const {
      open,
      onOpenChange,
      onSubmit,
      defaultValues,
      isEditing,
      isSubmitting = false,
      serverError, // Destructured serverError
    } = props;

    const form = useForm<AccommodationFormValues>({
      resolver: zodResolver(accommodationFormSchema),
      defaultValues: defaultEmptyValues,
      mode: "onChange",
    });

    const { setError, formState } = form;

    useEffect(() => {
      if (isEditing && defaultValues) {
        const transformedValues: AccommodationFormValues = {
          ...defaultValues,
          image: defaultValues.image === null ? "" : defaultValues.image,
          destinationId: Number(defaultValues.destinationId) || 0,
          statusId: defaultValues.statusId || 0,
        };
        form.reset(transformedValues);
      } else if (!isEditing) {
        form.reset(defaultEmptyValues);
      }
    }, [isEditing, defaultValues, form]);

    const { toast } = useToast();

    // Effect to set server-side errors on the form
    const prevServerErrorRef = useRef<unknown>(null);
    useEffect(() => {
      if (serverError && serverError !== prevServerErrorRef.current) {
        const fieldErrors = parseServerFieldErrors(serverError);
        if (fieldErrors) {
          Object.entries(fieldErrors).forEach(([fieldName, message]) => {
            // Ensure fieldName is a valid key of AccommodationFormValues
            // This check might need to be more robust depending on how server errors are structured
            if (fieldName in defaultEmptyValues || fieldName === 'general' || fieldName === 'root.serverError') {
              form.setError(fieldName as Path<AccommodationFormValues>, { type: 'server', message });
            } else {
              // Optionally handle or log unexpected field names
              console.warn(`Unknown field error: ${fieldName}`);
               // Fallback to a general error if the field is not directly on the form
              form.setError("root.serverError" as Path<AccommodationFormValues>, { type: 'server', message: `Error for ${fieldName}: ${message}` });
            }
          });
        }
        prevServerErrorRef.current = serverError;
      }
    }, [serverError, form, setError]); // Added setError to dependencies

    const { data: destinations, isLoading: isLoadingDestinations } = useQuery<Destination[]>({
      queryKey: ["/api/destinations"],
    });

    const { data: travelStatuses, isLoading: isLoadingTravelStatuses } = useQuery<TravelStatus[]>({
      queryKey: ["/api/travel-statuses"],
    });

    const accommodationTypes = [
      { value: "Hotel", label: "Hotel" },
      { value: "Resort", label: "Resort" },
      { value: "Hostel", label: "Hostel" },
      { value: "Apartment", label: "Apartment" },
      { value: "Guesthouse", label: "Guesthouse" },
      { value: "Villa", label: "Villa" },
      { value: "Cabin", label: "Cabin" },
      { value: "Camping", label: "Camping" },
    ];

    const handleFormSubmit = (values: AccommodationFormValues) => {
      onSubmit(values);
    };

    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{isEditing ? "Edit Accommodation" : "Add New Accommodation"}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4" ref={ref}>
              {/* Added ref to the form element if still needed, otherwise can be removed if forwardRef is not for the form itself */}
              {form.formState.errors.root?.serverError && (
                <FormItem>
                  <FormMessage>{form.formState.errors.root.serverError.message}</FormMessage>
                </FormItem>
              )}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Accommodation Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Grand Hotel Paris" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select accommodation type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {accommodationTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
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
                      onValueChange={(value) => field.onChange(Number(value))} 
                      value={field.value?.toString()}
                      disabled={isLoadingDestinations}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select destination" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {isLoadingDestinations ? (
                          <SelectItem value="loading" disabled>Loading destinations...</SelectItem>
                        ) : destinations && destinations.length > 0 ? (
                          destinations.map((dest) => (
                            <SelectItem key={dest.id} value={dest.id.toString()}>
                              {dest.name}, {dest.country}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="no-destinations" disabled>
                            No destinations available. Add one first.
                          </SelectItem>
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
                      onValueChange={(value) => field.onChange(parseInt(value))} // Changed Number to parseInt
                      value={field.value?.toString() ?? ""} // Ensured ?? ""
                      disabled={isLoadingTravelStatuses}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {isLoadingTravelStatuses ? (
                          <SelectItem value="loading" disabled>Loading statuses...</SelectItem>
                        ) : travelStatuses && travelStatuses.length > 0 ? (
                          travelStatuses.map((status: TravelStatus) => (
                            <SelectItem key={status.id} value={status.id.toString()}>
                              {status.label}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="no-statuses" disabled>
                            No statuses available.
                          </SelectItem>
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
                    <FormLabel>Image URL (Optional)</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="https://example.com/image.jpg" 
                        {...field} 
                      />
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
                        placeholder="Enter a description of the accommodation..." 
                        className="min-h-[120px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={!formState.isValid || isSubmitting || formState.isSubmitting}>
                  {isSubmitting || formState.isSubmitting ? (isEditing ? "Saving..." : "Adding...") : (isEditing ? "Save Changes" : "Add Accommodation")}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    );
  }
);

AccommodationForm.displayName = "AccommodationForm";
