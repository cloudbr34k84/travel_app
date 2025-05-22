import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Trip, Destination } from "@shared/schema";
import { insertTripSchema } from "@shared/schema";
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
import { Popover, PopoverContent, PopoverTrigger } from "@shared-components/ui/popover";
import { Calendar } from "@shared-components/ui/calendar";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@shared/lib/utils";
import { useQuery } from "@tanstack/react-query";

/**
 * Type definition for trip form submission values to be sent to the API
 */
export type TripApiValues = {
  name: string;
  startDate: string; // Format: 'yyyy-MM-dd'
  endDate: string;   // Format: 'yyyy-MM-dd'
  statusId: number; // Changed from status to statusId
  id?: number;
};

/**
 * Props interface for the TripForm component
 */
export interface TripFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: TripApiValues) => void;
  defaultValues?: Partial<Trip>;
  isEditing?: boolean;
}

/**
 * Extended schema for trip form with additional fields and validations
 * Converts string dates from the API to Date objects for the form
 */
export const tripFormSchema = insertTripSchema.extend({
  // Override the date fields to use z.date() for form handling
  startDate: z.date({
    required_error: "Start date is required",
  }),
  endDate: z.date({
    required_error: "End date is required",
  }),
  statusId: z.number().int().positive({ message: "Status is required" }), // Changed from status to statusId
});

/**
 * Type definition for trip form values based on the schema
 */
export type TripFormValues = z.infer<typeof tripFormSchema>;

export function TripForm({
  open,
  onOpenChange,
  onSubmit,
  defaultValues,
  isEditing = false,
}: TripFormProps) {
  /**
   * Fetches travel statuses from the API.
   */
  const { data: statusesData, isLoading: isLoadingStatuses } = useQuery<Array<{ id: number; name: string }>>({
    queryKey: ['travel-statuses'],
    queryFn: async () => {
      const response = await fetch('/api/travel-statuses');
      if (!response.ok) {
        throw new Error('Failed to fetch statuses');
      }
      return response.json();
    },
  });

  /**
   * Converts form values with Date objects to API values with string dates
   * @param values Form values from React Hook Form
   * @returns Formatted values ready for API submission
   */
  const handleSubmit = (values: TripFormValues): void => {
    // Convert Date objects to strings in the format expected by the API
    const formattedValues: TripApiValues = {
      ...values,
      startDate: format(values.startDate, 'yyyy-MM-dd'),
      endDate: format(values.endDate, 'yyyy-MM-dd'),
      statusId: values.statusId, // Ensure statusId is used
      // Include id if we're editing
      ...(isEditing && defaultValues?.id ? { id: defaultValues.id } : {})
    };
    
    onSubmit(formattedValues);
  };

  /**
   * Prepares default values for the form, converting string dates to Date objects
   * @returns Form values with proper Date objects
   */
  const prepareDefaultValues = (): TripFormValues => {
    let initialStatusId = 1; // Default statusId, e.g., for "planned"
    if (defaultValues?.statusId) {
        initialStatusId = defaultValues.statusId;
    } else if (defaultValues?.status) {
        console.warn("TripForm: defaultValues.status (string) is deprecated. Use defaultValues.statusId (number).");
    }

    if (defaultValues) {
      return {
        name: defaultValues.name || "",
        startDate: defaultValues.startDate ? new Date(defaultValues.startDate) : new Date(),
        endDate: defaultValues.endDate ? new Date(defaultValues.endDate) : new Date(new Date().setDate(new Date().getDate() + 7)),
        statusId: initialStatusId,
      };
    }
    
    // Default values for new trip
    return {
      name: "",
      startDate: new Date(),
      endDate: new Date(new Date().setDate(new Date().getDate() + 7)),
      statusId: initialStatusId, // Default statusId for new trips
    };
  };

  /**
   * Initialize the form with typesafe validation using Zod schema
   */
  const form = useForm<TripFormValues>({
    resolver: zodResolver(tripFormSchema),
    defaultValues: prepareDefaultValues(),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Trip" : "Add New Trip"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Trip Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Summer Vacation" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Start Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>End Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="statusId" // Changed from status to statusId
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(parseInt(value, 10))} // Ensure value is parsed to number
                    defaultValue={field.value?.toString()} // Ensure defaultValue is a string
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {isLoadingStatuses ? (
                        <SelectItem value="loading" disabled>
                          Loading statuses...
                        </SelectItem>
                      ) : (
                        statusesData?.map((status) => (
                          <SelectItem key={status.id} value={status.id.toString()}>
                            {status.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" className="bg-primary hover:bg-primary-800">
                {isEditing ? "Save Changes" : "Add Trip"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
