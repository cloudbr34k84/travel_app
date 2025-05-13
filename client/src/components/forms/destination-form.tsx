import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Destination } from "@shared/schema";
import { insertDestinationSchema } from "@shared/schema";
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

/**
 * Extended schema for destination form with additional fields and validations
 */
export const destinationFormSchema = insertDestinationSchema.extend({
  image: z.string().url("Please enter a valid image URL").default(""),
  status: z.enum(["visited", "planned", "wishlist"]).default("wishlist"),
});

/**
 * Type definition for destination form values based on the schema
 */
export type DestinationFormValues = z.infer<typeof destinationFormSchema>;

/**
 * Type definition for destination form submission values
 */
export type DestinationApiValues = {
  name: string;
  country: string;
  region: string;
  image: string;
  status: "visited" | "planned" | "wishlist";
  id?: number;
};

/**
 * Props interface for the DestinationForm component
 */
export interface DestinationFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: DestinationApiValues) => void;
  defaultValues?: Partial<Destination>;
  isEditing?: boolean;
}

export function DestinationForm({
  open,
  onOpenChange,
  onSubmit,
  defaultValues,
  isEditing = false,
}: DestinationFormProps) {
  /**
   * Prepares default values for the form with proper type conversion
   * @returns Properly typed form values
   */
  const prepareDefaultValues = (): DestinationFormValues => {
    if (defaultValues) {
      return {
        name: defaultValues.name || "",
        country: defaultValues.country || "",
        region: defaultValues.region || "",
        image: defaultValues.image || "",
        // Convert the string status to our enum type
        status: (defaultValues.status as "wishlist" | "planned" | "visited") || "wishlist",
      };
    }
    
    // Default values for new destination
    return {
      name: "",
      country: "",
      region: "",
      image: "",
      status: "wishlist",
    };
  };

  /**
   * Initialize the form with typesafe validation using Zod schema
   */
  const form = useForm<DestinationFormValues>({
    resolver: zodResolver(destinationFormSchema),
    defaultValues: prepareDefaultValues(),
  });

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
          <form onSubmit={form.handleSubmit((values: DestinationFormValues) => {
            // Convert form values to API values
            const apiValues: DestinationApiValues = {
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
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
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
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
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
