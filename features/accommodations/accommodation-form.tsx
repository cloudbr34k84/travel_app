/**
 * @file AccommodationForm.tsx
 * @description This file contains the AccommodationForm component, used for adding or editing accommodations
 *              within dedicated pages.
 * The Zod schema (accommodationFormSchema) is declared as a local constant to avoid breaking Vite's Fast Refresh.
 */

import React, { useEffect, useRef } from "react";
import { useForm, Controller, Path, FieldError, FieldErrors, Control, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useNavigate } from 'react-router-dom';

import { Accommodation, Destination, InsertAccommodation } from "@shared/schema";
import type { TravelStatus } from "@shared/schema";
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
import { Textarea } from "@shared-components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@shared-components/ui/select";

import { useDestinations } from "../destinations/api/hooks"; // Corrected relative path
import { useTravelStatuses } from '../travel_statuses/api/hooks'; // Corrected relative path

import { parseServerFieldErrors } from "@shared/lib/utils";

/**
 * Extended schema for accommodation form with additional fields and validations.
 * Ensures that numeric fields expected by the backend are correctly typed.
 * Optional string fields are made nullable to align with potential database/API structures
 * and to provide flexibility in form handling (e.g. distinguishing between empty string and not set).
 */
const accommodationFormSchema = insertAccommodationSchema.extend({
  image: z.string().url("Please enter a valid image URL").optional().or(z.literal('')).nullable(),
  statusId: z.preprocess(
    (val) => (typeof val === 'string' && val !== '' ? parseInt(val, 10) : (typeof val === 'number' ? val : 0)), // Ensure 0 if invalid
    z.number().int().positive({ message: "Status is required." })
  ),
  description: z.string().min(1, "Description is required"),
  name: z.string().min(1, "Accommodation name is required"),
  type: z.string().min(1, "Type is required"),
  destinationId: z.preprocess(
    (val) => (typeof val === 'string' && val !== '' ? parseInt(val, 10) : (typeof val === 'number' ? val : 0)), // Ensure 0 if invalid
    z.number().int().positive({ message: "Destination is required." })
  ),
  priorityLevel: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  addressStreet: z.string().optional().nullable(),
  addressLine2: z.string().optional().nullable(),
  addressCity: z.string().optional().nullable(),
  addressRegion: z.string().optional().nullable(),
  addressPostcode: z.string().optional().nullable(),
  addressCountry: z.string().optional().nullable(),
});

/**
 * Type definition for accommodation form values based on the schema.
 * This type represents the structure of the data within the form.
 */
export type AccommodationFormValues = z.infer<typeof accommodationFormSchema>;

/**
 * Props interface for the AccommodationForm component.
 *
 * @property onSubmit - Callback function invoked when the form is submitted with valid data.
 *                      It receives `AccommodationFormValues`. The parent component is responsible
 *                      for any further transformation (e.g., to `InsertAccommodation`) before API calls.
 * @property {Partial<Accommodation>} [defaultValues] - Pre-populated values for editing an existing accommodation.
 *                                                    These are mapped to `AccommodationFormValues`.
 * @property {boolean} isEditing - Flag indicating whether the form is in edit mode (e.g., "Save Changes" vs "Create").
 * @property {boolean} [isSubmitting] - Flag indicating if a submission is currently in progress, used to disable submit button.
 * @property {Record<string, string[] | string> | string | null} [serverError] - Server-side validation errors or general error messages.
 *                                                                               Can be an object mapping field names to errors, or a single string.
 * @property {string} [onCancelPath] - The URL path to navigate to when the "Cancel" button is clicked. Defaults to "/accommodations".
 */
export interface AccommodationFormProps {
  onSubmit: (values: AccommodationFormValues) => void;
  defaultValues?: Partial<Accommodation>; 
  isEditing: boolean;
  isSubmitting?: boolean;
  serverError?: Record<string, string[] | string> | string | null;
  onCancelPath?: string;
}

/**
 * Default empty values for the accommodation form.
 * Uses empty strings for text inputs and appropriate defaults for other types.
 * Nullable fields are initialized to `null` or `""` based on typical input behavior.
 */
const defaultEmptyValues: AccommodationFormValues = {
  name: "",
  type: "",
  destinationId: 0, // Will fail Zod's positive() validation, user must select.
  image: null, // Changed from "" to null
  statusId: 0, // Will fail Zod's positive() validation, user must select.
  description: "",
  priorityLevel: "medium", // Default for select, or null if no sensible default
  notes: null, // Changed from "" to null
  addressStreet: null,
  addressLine2: null,
  addressCity: null,
  addressRegion: null,
  addressPostcode: null,
  addressCountry: null,
  // startDate and endDate are not part of this form's schema directly
  // but are part of InsertAccommodation. They should be handled by the parent component
  // when preparing data for the API if needed.
};


/**
 * @component AccommodationForm
 * @description A reusable form for creating and editing accommodations, designed for use on dedicated pages.
 *              It handles its own data fetching for dropdowns (destinations, travel statuses)
 *              and manages form state using React Hook Form and Zod for validation.
 * @param {AccommodationFormProps} props - The props for the component.
 */
export const AccommodationForm: React.FC<AccommodationFormProps> = ({
  onSubmit,
  defaultValues: propsDefaultValues, // Renamed to avoid confusion in scope
  isEditing,
  isSubmitting = false,
  serverError,
  onCancelPath = "/accommodations",
}) => {
  const navigate = useNavigate();
  
  // Function to map Partial<Accommodation> to Partial<AccommodationFormValues>
  // Handles potential nulls and type conversions for form initialization.
  const mapPropsToFormValues = (apiDefaults?: Partial<Accommodation>): Partial<AccommodationFormValues> => {
    if (!apiDefaults) return defaultEmptyValues;
    return {
      ...defaultEmptyValues, // Start with base defaults
      ...apiDefaults,       // Spread API values (fields like name, description will overwrite)
      destinationId: apiDefaults.destinationId ? Number(apiDefaults.destinationId) : 0,
      statusId: apiDefaults.statusId ? Number(apiDefaults.statusId) : 0,
      image: apiDefaults.image === undefined ? null : apiDefaults.image, // Preserve null, convert undefined to null
      priorityLevel: apiDefaults.priorityLevel === undefined ? "medium" : apiDefaults.priorityLevel,
      notes: apiDefaults.notes === undefined ? null : apiDefaults.notes,
      addressStreet: apiDefaults.addressStreet === undefined ? null : apiDefaults.addressStreet,
      addressLine2: apiDefaults.addressLine2 === undefined ? null : apiDefaults.addressLine2,
      addressCity: apiDefaults.addressCity === undefined ? null : apiDefaults.addressCity,
      addressRegion: apiDefaults.addressRegion === undefined ? null : apiDefaults.addressRegion,
      addressPostcode: apiDefaults.addressPostcode === undefined ? null : apiDefaults.addressPostcode,
      addressCountry: apiDefaults.addressCountry === undefined ? null : apiDefaults.addressCountry,
    };
  };

  const form = useForm<AccommodationFormValues>({
    resolver: zodResolver(accommodationFormSchema),
    defaultValues: mapPropsToFormValues(propsDefaultValues),
    mode: "onChange", 
  });

  const { setError, reset, control, handleSubmit, formState: { errors, isDirty } } = form;

  useEffect(() => {
    // Reset form when defaultValues from props change (e.g., when editing a different item)
    reset(mapPropsToFormValues(propsDefaultValues));
  }, [propsDefaultValues, reset]);

  const prevServerErrorRef = useRef<unknown>(null);

  useEffect(() => {
    if (serverError && serverError !== prevServerErrorRef.current) {
      const fieldErrors = parseServerFieldErrors(serverError);
      if (fieldErrors) {
        Object.entries(fieldErrors).forEach(([fieldName, message]) => {
          // Ensure fieldName is a valid path for AccommodationFormValues
          // or a general error key like 'root' or 'root.serverError'.
          const fieldPath = fieldName as Path<AccommodationFormValues> | "root.serverError" | "root";
          setError(fieldPath, { 
            type: 'server', 
            message: Array.isArray(message) ? message.join(', ') : message 
          });
        });
      } else if (typeof serverError === 'string') {
        setError("root.serverError" as Path<AccommodationFormValues>, { type: 'server', message: serverError });
      } else if (serverError) { // Catch any other truthy serverError
         setError("root.serverError" as Path<AccommodationFormValues>, { type: 'server', message: "An unknown server error occurred." });
      }
      prevServerErrorRef.current = serverError;
    } else if (!serverError && prevServerErrorRef.current) {
      // Optionally clear root.serverError if it was previously set and now there's no serverError
      // form.clearErrors("root.serverError"); // Be cautious with clearing errors automatically
      prevServerErrorRef.current = null;
    }
  }, [serverError, setError]);

  const { data: destinations, isLoading: isLoadingDestinations, error: destinationsError } = useDestinations();
  const { data: travelStatuses, isLoading: isLoadingTravelStatuses, error: travelStatusesError } = useTravelStatuses();

  const accommodationTypes = [
    { value: "Hotel", label: "Hotel" },
    { value: "Resort", label: "Resort" },
    { value: "Hostel", label: "Hostel" },
    { value: "Apartment", label: "Apartment" },
    { value: "Guesthouse", label: "Guesthouse" },
    { value: "Villa", label: "Villa" },
    { value: "Cabin", label: "Cabin" },
    { value: "Camping", label: "Camping" },
    { value: "Other", label: "Other" },
  ];

  /**
   * Internal submit handler passed to react-hook-form's handleSubmit.
   * It receives validated form data (AccommodationFormValues) and passes it to the onSubmit prop.
   */
  const handleFormSubmitInternal: SubmitHandler<AccommodationFormValues> = (values) => {
    // `values` are already of type AccommodationFormValues, shaped by the Zod schema (including preprocessing).
    // The parent component's onSubmit function (e.g., handleCreateAccommodation in new.tsx)
    // is responsible for any further transformation (e.g., to InsertAccommodation for an API call).
    onSubmit(values);
  };
  
  const handleCancel = () => {
    navigate(onCancelPath);
  };
  
  /**
   * Retrieves a general server error message to display at the top of the form.
   */
  const getGeneralErrorMessage = (): string | null => {
    const serverErrorField = errors.root?.serverError as FieldError | undefined;
    if (serverErrorField && serverErrorField.message) {
      return serverErrorField.message;
    }
    // Removed check for errors.general as it's not a standard RHF key.
    // If other root-level errors are possible, they can be checked here.
    // e.g. errors.root?.message
    return null;
  };

  const generalErrorMessage = getGeneralErrorMessage();

  // UI for loading or error states for dropdown data
  if (destinationsError) {
    return <p className="text-red-500">Error loading destinations: {destinationsError.message}. Please try refreshing.</p>;
  }
  if (travelStatusesError) {
    return <p className="text-red-500">Error loading travel statuses: {travelStatusesError.message}. Please try refreshing.</p>;
  }
  // A simple loading indicator for dropdown data can also be added here if desired,
  // though individual selects handle their own loading states.

  return (
    <Form {...form}> {/* Spread form methods and state to the Form provider */}
      <form onSubmit={handleSubmit(handleFormSubmitInternal)} className="space-y-6">
        {generalErrorMessage && (
          <FormItem> {/* Using FormItem and FormMessage for consistent styling of general errors */}
            <FormMessage>{generalErrorMessage}</FormMessage>
          </FormItem>
        )}
        <FormField
          control={control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Accommodation Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., The Grand Budapest Hotel" {...field} />
              </FormControl>
              <FormMessage /> {/* Displays validation errors for this field */}
            </FormItem>
          )}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Type</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  value={field.value || ""} // Ensure value is a string for Select
                  defaultValue={field.value || ""}
                >
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
            control={control}
            name="destinationId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Destination</FormLabel>
                <Select
                  onValueChange={(value) => field.onChange(value ? parseInt(value, 10) : 0)} // Ensure number or 0
                  value={field.value?.toString() || ""} // Ensure value is a string for Select
                  defaultValue={field.value?.toString() || ""}
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
                      destinations.map((dest: Destination) => (
                        <SelectItem key={dest.id} value={dest.id.toString()}>
                          {dest.name}, {dest.country} 
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-destinations" disabled>
                        No destinations found. Consider adding one.
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={control}
            name="statusId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select
                  onValueChange={(value) => field.onChange(value ? parseInt(value, 10) : 0)} // Ensure number or 0
                  value={field.value?.toString() || ""} // Ensure value is a string for Select
                  defaultValue={field.value?.toString() || ""}
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
                      travelStatuses.map((status: TravelStatus) => ( // Type TravelStatus from schema
                        <SelectItem key={status.id} value={status.id.toString()}>
                          {status.label} {/* Use .label based on TravelStatus schema */}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-statuses" disabled>
                        No statuses found.
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="priorityLevel"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Priority Level</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  // Ensure value is a string for Select, handle null from form state
                  value={field.value || "medium"} 
                  defaultValue={field.value || "medium"}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority level" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe the accommodation, its amenities, and any relevant details."
                  className="resize-none"
                  {...field}
                  // Ensure value is a string for Textarea, handle null from form state
                  value={field.value || ""} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="image"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Image URL (Optional)</FormLabel>
              <FormControl>
                <Input type="url" placeholder="https://example.com/image.jpg" {...field} value={field.value || ""} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <h3 className="text-lg font-medium pt-4">Address (Optional)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={control} name="addressStreet"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Street</FormLabel>
                <FormControl><Input placeholder="123 Main St" {...field} value={field.value || ""} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control} name="addressLine2"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Address Line 2</FormLabel>
                <FormControl><Input placeholder="Apt, Suite, etc." {...field} value={field.value || ""} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <FormField
            control={control} name="addressCity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>City</FormLabel>
                <FormControl><Input placeholder="New York" {...field} value={field.value || ""} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control} name="addressRegion"
            render={({ field }) => (
              <FormItem>
                <FormLabel>State/Region</FormLabel>
                <FormControl><Input placeholder="NY" {...field} value={field.value || ""} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control} name="addressPostcode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Postcode</FormLabel>
                <FormControl><Input placeholder="10001" {...field} value={field.value || ""} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control} name="addressCountry"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Country</FormLabel>
                <FormControl><Input placeholder="USA" {...field} value={field.value || ""} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Any additional notes or reminders about this accommodation."
                  className="resize-none"
                  {...field}
                  value={field.value || ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={handleCancel} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting || (!isDirty && isEditing) }> {/* Corrected: only disable if !isDirty AND isEditing */}
            {isSubmitting ? "Submitting..." : isEditing ? "Save Changes" : "Create Accommodation"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default AccommodationForm;
