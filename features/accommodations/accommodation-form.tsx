import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import React, { forwardRef, useImperativeHandle, useEffect } from "react";
import { Accommodation, Destination, InsertAccommodation } from "@shared/schema";
import { insertAccommodationSchema } from "@shared/schema";
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
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@shared/hooks/use-toast";

/**
 * Extended schema for accommodation form with additional fields and validations
 */
export const accommodationFormSchema = insertAccommodationSchema.extend({
  image: z.string().url("Please enter a valid image URL").optional().or(z.literal('')),
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
 */
export interface AccommodationFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: AccommodationFormValues) => void;
  defaultValues?: Accommodation | undefined;
  isEditing: boolean;
  isSubmitting?: boolean;
  onError?: (error: Error) => void;
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
};

// Define a type for the ref exposed by the form
type AccommodationFormRef = {
  parseServerValidationErrors: (error: Error) => boolean;
};

// Use a named function for the forwardRef to improve debugging
export const AccommodationForm = forwardRef<AccommodationFormRef, AccommodationFormProps>(
  function AccommodationForm(props, ref) {
    const {
      open,
      onOpenChange,
      onSubmit,
      defaultValues,
      isEditing,
      isSubmitting = false,
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
        };
        form.reset(transformedValues);
      } else if (!isEditing) {
        form.reset(defaultEmptyValues);
      }
    }, [isEditing, defaultValues, form.reset]);

    const { toast } = useToast();

    const parseServerValidationErrors = (error: Error): boolean => {
      try {
        if (!error.message) return false;
        const errorMatch = error.message.match(/^(\d+): (.+)$/);
        if (!errorMatch) return false;
        const [, statusCode, message] = errorMatch;
        if (statusCode !== "400") return false;

        try {
          const errorData = JSON.parse(message);
          const fieldErrors = errorData.fieldErrors || errorData.errors;
          if (!fieldErrors || typeof fieldErrors !== 'object') return false;

          let errorsFound = false;
          Object.entries(fieldErrors).forEach(([field, errorMessages]) => {
            if (Array.isArray(errorMessages) && errorMessages.length > 0) {
              setError(field as keyof AccommodationFormValues, {
                message: errorMessages[0] as string,
              });
              errorsFound = true;
            } else if (typeof errorMessages === 'string') {
              setError(field as keyof AccommodationFormValues, {
                message: errorMessages,
              });
              errorsFound = true;
            }
          });
          return errorsFound;
        } catch (jsonError) {
          return false;
        }
      } catch (parseError) {
        return false;
      }
    };

    useImperativeHandle(ref, () => ({
      parseServerValidationErrors,
    }));

    const { data: destinations, isLoading: isLoadingDestinations } = useQuery<Destination[]>({
      queryKey: ["/api/destinations"],
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
            <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
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
