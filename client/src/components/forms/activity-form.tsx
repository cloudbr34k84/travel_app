import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Activity, Destination } from "@shared/schema";
import { insertActivitySchema } from "@shared/schema";
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
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useQuery } from "@tanstack/react-query";

/**
 * Extended schema for activity form with additional fields and validations
 */
export const activityFormSchema = insertActivitySchema.extend({
  image: z.string().url("Please enter a valid image URL").optional(),
});

/**
 * Type definition for activity form values based on the schema
 */
export type ActivityFormValues = z.infer<typeof activityFormSchema>;

/**
 * Type definition for activity form submission values
 */
export type ActivityApiValues = {
  name: string;
  description: string;
  category: string;
  destinationId: number;
  image?: string;
  id?: number;
};

/**
 * Props interface for the ActivityForm component
 */
export interface ActivityFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: ActivityApiValues) => void;
  defaultValues?: Partial<Activity>;
  isEditing?: boolean;
}

export function ActivityForm({
  open,
  onOpenChange,
  onSubmit,
  defaultValues,
  isEditing = false,
}: ActivityFormProps) {
  /**
   * Prepares default values for the form with proper type conversion
   * @returns Properly typed form values 
   */
  const prepareDefaultValues = (): ActivityFormValues => {
    if (defaultValues) {
      return {
        name: defaultValues.name || "",
        description: defaultValues.description || "",
        category: defaultValues.category || "",
        destinationId: defaultValues.destinationId || 0,
        // Handle null image values by converting to undefined
        image: defaultValues.image === null ? undefined : defaultValues.image,
      };
    }
    
    // Default values for new activity
    return {
      name: "",
      description: "",
      category: "",
      destinationId: 0,
      image: "",
    };
  };

  /**
   * Initialize the form with typesafe validation using Zod schema
   */
  const form = useForm<ActivityFormValues>({
    resolver: zodResolver(activityFormSchema),
    defaultValues: prepareDefaultValues(),
  });

  // Use explicit typing for the destinations query
  const { data: destinations, isLoading: isLoadingDestinations } = useQuery<Destination[]>({
    queryKey: ["/api/destinations"],
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
            // Convert form values to API values
            const apiValues: ActivityApiValues = {
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
                    defaultValue={field.value}
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
              <Button type="submit" className="bg-primary hover:bg-primary-800">
                {isEditing ? "Save Changes" : "Add Activity"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
