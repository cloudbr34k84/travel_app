import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Destination } from "@shared/schema";
import { insertDestinationSchema } from "@shared/schema";
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
import { useEffect } from "react";
import { Textarea } from "@shared-components/ui/textarea";

/**
 * DestinationForm component.
 *
 * This form is used for both creating and editing destinations.
 * It remains mounted in the DOM even when not visible (controlled by the `open` prop).
 * Because it stays mounted, `react-hook-form`'s `useForm` hook initializes with
 * `defaultValues` only once when the component first mounts.
 *
 * To ensure the form correctly pre-fills with data when editing an *existing*
 * destination (i.e., when the `defaultValues` prop changes after initial mount),
 * a `useEffect` hook is necessary. This effect calls `form.reset()` with the new
 * `defaultValues` (for editing) or with empty defaults (for creating a new entry),
 * effectively re-initializing the form state based on the current props.
 */
export const destinationFormSchema = insertDestinationSchema.extend({
  image: z.string().url("Please enter a valid image URL").default(""),
  status: z.enum(["visited", "planned", "wishlist"]).default("wishlist"),
  description: z.string().optional().default(""),
});

/**
 * Type definition for destination form values based on the schema
 */
export type DestinationFormValues = z.infer<typeof destinationFormSchema>;

/**
 * Props interface for the DestinationForm component
 */
export type DestinationFormProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultValues?: Destination | undefined;
  isEditing: boolean;
  onSubmit: (values: DestinationFormValues) => void;
};

const defaultEmptyValues: DestinationFormValues = {
  name: "",
  country: "",
  region: "",
  description: "",
  image: "",
  status: "wishlist",
};

export function DestinationForm({
  open,
  onOpenChange,
  onSubmit,
  defaultValues,
  isEditing,
}: DestinationFormProps) {
  /**
   * Prepares default values for the form when editing.
   * This function is called by the useEffect hook.
   * @returns Properly typed form values for editing.
   */
  const prepareDefaultValuesForEdit = (): DestinationFormValues => {
    if (!defaultValues) {
      return defaultEmptyValues;
    }
    // Ensure status is correctly typed for the form
    const currentStatus = defaultValues.status as DestinationFormValues['status'];
    const validStatuses: Array<DestinationFormValues['status']> = ["visited", "planned", "wishlist"];

    return {
      name: defaultValues.name,
      country: defaultValues.country,
      region: defaultValues.region,
      description: defaultValues.description || "", // Removed 'as any' assertion
      image: defaultValues.image || "",
      status: validStatuses.includes(currentStatus) ? currentStatus : "wishlist", // Fallback to wishlist if status is invalid
    };
  };

  /**
   * Initialize the form with typesafe validation using Zod schema
   */
  const form = useForm<DestinationFormValues>({
    resolver: zodResolver(destinationFormSchema),
    defaultValues: defaultEmptyValues,
  });

  // Effect to reset form when defaultValues or editing mode changes
  useEffect(() => {
    if (isEditing && defaultValues) {
      form.reset(prepareDefaultValuesForEdit());
    } else {
      form.reset(defaultEmptyValues);
    }
  }, [isEditing, defaultValues, form.reset]);

  const regions = [
    { value: "Africa", label: "Africa" },
    { value: "Asia", label: "Asia" },
    { value: "Europe", label: "Europe" },
    { value: "North America", label: "North America" },
    { value: "South America", label: "South America" },
    { value: "Oceania", label: "Oceania" },
    { value: "Antarctica", label: "Antarctica" },
  ];

  const statuses = [
    { value: "wishlist", label: "Wishlist" },
    { value: "planned", label: "Planned" },
    { value: "visited", label: "Visited" },
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
                    <Textarea placeholder="Describe the destination..." {...field} />
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
                    <Input placeholder="https://example.com/image.jpg" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {statuses.map((status) => (
                        <SelectItem key={status.value} value={status.value}>
                          {status.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" className="bg-primary hover:bg-primary-800">
                {isEditing ? "Save Changes" : "Add Destination"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
