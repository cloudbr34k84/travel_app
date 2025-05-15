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
 * @property defaultValues - Pre-populated values for editing an existing accommodation
 * @property isEditing - Flag indicating whether the form is in edit mode
 * @property isSubmitting - Flag indicating whether a submission is in progress
 */
export interface AccommodationFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: AccommodationApiValues) => void;
  defaultValues?: Partial<Accommodation>;
  isEditing?: boolean;
  isSubmitting?: boolean;
}

export function AccommodationForm({
  open,
  onOpenChange,
  onSubmit,
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
   */
  const form = useForm<AccommodationFormValues>({
    resolver: zodResolver(accommodationFormSchema),
    defaultValues: prepareDefaultValues(),
  });

  // Use explicit typing for the destinations query
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Accommodation" : "Add New Accommodation"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit((values: AccommodationFormValues) => {
            // Convert form values to API values
            const apiValues: AccommodationApiValues = {
              ...values,
              // Include id if we're editing
              ...(isEditing && defaultValues?.id ? { id: defaultValues.id } : {})
            };
            onSubmit(apiValues);
          })} className="space-y-4">
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
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
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
            <FormField
              control={form.control}
              name="destinationId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Destination</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(parseInt(value))}
                    defaultValue={field.value?.toString()}
                    disabled={isLoadingDestinations}
                  >
                    <FormControl>
                      <SelectTrigger>
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
            <DialogFooter>
              {/* 
               * Submit Button with loading state
               * 
               * This button is disabled during form submission to prevent duplicate requests.
               * It shows different text based on the current operation (adding vs editing)
               * and submission state, improving user feedback during API operations.
               * 
               * @behavior
               * - Shows "Add Accommodation" or "Save Changes" when idle
               * - Shows "Adding..." or "Saving..." when submitting
               * - Disabled when submission is in progress to prevent duplicate requests
               */}
              <Button 
                type="submit" 
                className="bg-primary hover:bg-primary-800"
                disabled={isSubmitting}
              >
                {isSubmitting 
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
