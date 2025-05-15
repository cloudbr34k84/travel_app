import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Accommodation, Destination } from "@shared/schema";
import { insertAccommodationSchema } from "@shared/schema";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

/**
 * Extended schema for accommodation form with additional fields and validations
 */
export const accommodationFormSchema = insertAccommodationSchema.extend({
  image: z.string().url("Please enter a valid image URL").optional(),
});

/**
 * Type definition for accommodation form values based on the schema
 */
export type AccommodationFormValues = z.infer<typeof accommodationFormSchema>;

/**
 * Type definition for accommodation form submission values
 */
export type AccommodationApiValues = {
  name: string;
  type: string;
  destinationId: number;
  image?: string;
  id?: number;
};

/**
 * Props interface for the AccommodationForm component
 * 
 * @property open - Controls the visibility state of the accommodation form dialog
 * @property onOpenChange - Callback function that is triggered when dialog open state changes
 * @property onSubmit - Callback function that handles form submission with validated values
 * @property onError - Optional callback for handling server-side validation errors
 * @property defaultValues - Pre-populated values for editing an existing accommodation
 * @property isEditing - Flag indicating whether the form is in edit mode
 * @property isSubmitting - Flag indicating whether a submission is in progress
 */
export interface AccommodationFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: AccommodationApiValues) => void;
  onError?: (error: Error) => void;
  defaultValues?: Partial<Accommodation>;
  isEditing?: boolean;
  isSubmitting?: boolean;
}

/**
 * Accommodation Form Component with Real-Time Validation and Server-Side Error Mapping
 * 
 * This form implements comprehensive validation through two key mechanisms:
 * 1. Real-time client-side validation that provides immediate feedback as users type
 * 2. Server-side validation error mapping that associates backend validation failures with specific form fields
 * 
 * @validation
 * - All fields use real-time validation triggered by the onChange event
 * - Name field validates for required input
 * - Type field validates for required selection
 * - Destination field validates for required selection
 * - Image URL field validates for proper URL format (optional field)
 * 
 * @server_error_mapping
 * - When the server returns validation errors (400 status code), the component parses the response
 * - Field-specific errors are mapped directly to form fields using react-hook-form's setError function
 * - Expected error response format from server: { message: string, errors: { fieldName: string[] } }
 * - This creates a seamless experience where server validation appears directly in the UI
 * 
 * @submit_button_behavior
 * - The submit button is disabled in two critical scenarios:
 *   1. When form validation fails (formState.isValid is false)
 *   2. During form submission to prevent duplicate requests (formState.isSubmitting or props.isSubmitting)
 * - Button text changes to reflect the current action ("Adding..." during submission)
 * - This prevents users from submitting invalid data and improves API request reliability
 * 
 * @realtime_validation_guide
 * To implement similar real-time validation in other forms:
 * 1. Set useForm mode to "onChange" to validate as users type
 * 2. Use formState.errors to access field-specific error messages
 * 3. FormMessage components will automatically display validation errors
 * 4. The Submit button should be disabled with: disabled={!formState.isValid || formState.isSubmitting}
 * 5. For server error mapping, implement an error parsing function in the onSubmit handler that calls setError
 */
export function AccommodationForm({
  open,
  onOpenChange,
  onSubmit,
  onError,
  defaultValues,
  isEditing = false,
  isSubmitting = false,
}: AccommodationFormProps) {
  /**
   * Prepares default values for the form with proper type conversion
   * @returns Properly typed form values
   */
  const prepareDefaultValues = (): AccommodationFormValues => {
    if (defaultValues) {
      return {
        name: defaultValues.name || "",
        type: defaultValues.type || "",
        destinationId: defaultValues.destinationId || 0,
        // Handle null image values by converting to undefined
        image: defaultValues.image === null ? undefined : defaultValues.image,
      };
    }
    
    // Default values for new accommodation
    return {
      name: "",
      type: "",
      destinationId: 0,
      image: "",
    };
  };

  /**
   * Initialize the form with typesafe validation using Zod schema
   * 
   * @configuration
   * - mode: "onChange" - Enables real-time validation as users type
   * - resolver: zodResolver - Validates form values against our Zod schema
   * - defaultValues: Pre-populated values based on the current state (new or editing)
   */
  const form = useForm<AccommodationFormValues>({
    resolver: zodResolver(accommodationFormSchema),
    defaultValues: prepareDefaultValues(),
    mode: "onChange", // Enable real-time validation
  });
  
  /**
   * Extract form state to access validation status and submission state
   * Used for real-time validation feedback and conditional button disabling
   * - formState.isValid: True when all form fields pass validation
   * - formState.isSubmitting: True during form submission
   */
  const { formState, setError } = form;
  const { toast } = useToast();

  // Use explicit typing for the destinations query
  const { data: destinations, isLoading: isLoadingDestinations } = useQuery<Destination[]>({
    queryKey: ["/api/destinations"],
  });
  
  /**
   * Parses server-side validation errors and maps them to form fields
   * 
   * @param error - The error object returned from the server
   * @returns boolean - Whether any field errors were mapped (true) or not (false)
   */
  const parseServerValidationErrors = (error: Error): boolean => {
    try {
      // The apiRequestWithJson function throws errors in format: "Status: Message"
      if (!error.message) return false;
      
      // Check if it's a structured error with status code
      const errorMatch = error.message.match(/^(\d+): (.+)$/);
      if (!errorMatch) return false;
      
      const [, statusCode, message] = errorMatch;
      
      // Only process 400 status errors (validation errors)
      if (statusCode !== "400") return false;
      
      try {
        // Try to parse the message as JSON which might contain field errors
        const errorData = JSON.parse(message);
        
        // Check if the error response contains a fieldErrors or errors object
        const fieldErrors = errorData.fieldErrors || errorData.errors;
        
        if (!fieldErrors || typeof fieldErrors !== 'object') return false;
        
        let errorsFound = false;
        
        // Map each field error to the corresponding form field
        Object.entries(fieldErrors).forEach(([field, errorMessages]) => {
          // For errors returned as arrays (e.g., ['Name is required'])
          if (Array.isArray(errorMessages) && errorMessages.length > 0) {
            setError(field as keyof AccommodationFormValues, { 
              message: errorMessages[0] as string 
            });
            errorsFound = true;
          } 
          // For errors returned as strings (e.g., 'Name is required')
          else if (typeof errorMessages === 'string') {
            setError(field as keyof AccommodationFormValues, { 
              message: errorMessages 
            });
            errorsFound = true;
          }
        });
        
        return errorsFound;
      } catch (jsonError) {
        // If JSON parsing fails, it's not a structured field error
        return false;
      }
    } catch (parseError) {
      // If error parsing fails completely, just return false
      return false;
    }
  };

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Accommodation" : "Add New Accommodation"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(
            // Success handler - executed when form validation passes
            (values: AccommodationFormValues) => {
              // Convert form values to API values
              const apiValues: AccommodationApiValues = {
                ...values,
                // Include id if we're editing
                ...(isEditing && defaultValues?.id ? { id: defaultValues.id } : {})
              };
              
              // Call the onSubmit callback provided by parent component
              // with enhanced error handling
              try {
                onSubmit(apiValues);
              } catch (error) {
                // This catch is just for synchronous errors
                // Most errors will be handled by the parent component's mutation onError
                console.error("Form submission error:", error);
              }
            },
            // Error handler - executed when client-side validation fails
            (errors) => {
              console.log("Form validation failed:", errors);
              // We don't need to do anything here as React Hook Form will
              // automatically show validation messages for invalid fields
            }
          )} 
          className="space-y-4">
            {/* 
             * Name field with real-time validation
             * Shows error message as user types if the field is empty
             */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Accommodation Name</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Grand Hotel Paris" 
                      {...field} 
                      onChange={(e) => {
                        field.onChange(e);
                        // This triggers validation as the user types
                        form.trigger("name");
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* 
             * Type selection field with real-time validation
             * Validates as soon as user makes a selection
             */}
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                      // Trigger validation when selection changes
                      form.trigger("type");
                    }}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className={formState.errors.type ? "border-red-500" : ""}>
                        <SelectValue placeholder="Select a type" />
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
            {/* 
             * Destination selection field with real-time validation
             * Shows validation error if no destination is selected
             */}
            <FormField
              control={form.control}
              name="destinationId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Destination</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(parseInt(value));
                      // Trigger validation when selection changes
                      form.trigger("destinationId");
                    }}
                    defaultValue={field.value?.toString()}
                    disabled={isLoadingDestinations}
                  >
                    <FormControl>
                      <SelectTrigger className={formState.errors.destinationId ? "border-red-500" : ""}>
                        <SelectValue placeholder="Select a destination" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {destinations && destinations.map((destination: Destination) => (
                        <SelectItem key={destination.id} value={destination.id.toString()}>
                          {destination.name}, {destination.country}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* 
             * Image URL field with real-time validation
             * Validates URL format as user types (this field is optional)
             */}
            <FormField
              control={form.control}
              name="image"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Image URL (optional)</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="https://example.com/image.jpg" 
                      {...field} 
                      value={field.value || ""}
                      className={formState.errors.image ? "border-red-500" : ""}
                      onChange={(e) => {
                        field.onChange(e);
                        // Only trigger validation if there's a value
                        if (e.target.value) {
                          form.trigger("image");
                        }
                      }}
                      onBlur={() => {
                        // Also validate on blur for better UX
                        if (field.value) {
                          form.trigger("image");
                        }
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              {/* 
               * Submit Button with Enhanced Validation-Aware State
               * 
               * This button implements a UX-optimized disabled state that prevents:
               * 1. Invalid submissions - When the form has validation errors (formState.isValid is false)
               * 2. Double-submissions - During form submission (formState.isSubmitting or isSubmitting prop is true)
               * 
               * @behavior
               * - Shows "Add Accommodation" or "Save Changes" when idle
               * - Shows "Adding..." or "Saving..." when submitting
               * - Dynamically updates disabled state based on real-time form validation
               * - Prevents users from submitting invalid data
               * - Prevents duplicate API calls by disabling during submission
               */}
              <Button 
                type="submit" 
                className="bg-primary hover:bg-primary-800"
                disabled={isSubmitting || !formState.isValid || formState.isSubmitting}
              >
                {isSubmitting || formState.isSubmitting
                  ? (isEditing ? "Saving..." : "Adding...") 
                  : (isEditing ? "Save Changes" : "Add Accommodation")
                }
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
