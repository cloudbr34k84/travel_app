import { useForm, SubmitHandler } from "react-hook-form"; // Added SubmitHandler
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
 * Type definition for travel status data fetched from the API.
 */
interface TravelStatus {
  id: number;
  label: string;
}

/**
 * Type definition for trip form submission values to be sent to the API
 */
export type TripApiValues = {
  name: string;
  startDate: string; // Format: 'yyyy-MM-dd'
  endDate: string;   // Format: 'yyyy-MM-dd'
  statusId: number; 
  id?: number;
  userId?: number | null; // Added userId to match TripFormValues
};

/**
 * Props interface for the TripForm component
 */
export interface TripFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: TripApiValues) => void;
  defaultValues?: Partial<Trip & { status?: string }>; // Allow legacy status for a moment
  isEditing?: boolean;
}

/**
 * Extended schema for trip form with additional fields and validations
 * Converts string dates from the API to Date objects for the form
 */
export const tripFormSchema = insertTripSchema.extend({
  startDate: z.date({
    required_error: "Start date is required",
  }),
  endDate: z.date({
    required_error: "End date is required",
  }),
  statusId: z.number().int().positive({ message: "Status is required" }),
  // userId is already in insertTripSchema, ensure it's optional or handled
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
  const prepareDefaultValues = (): TripFormValues => {
    let initialStatusId = 1; // Default statusId, e.g., for "planned"
    if (defaultValues?.statusId) {
      initialStatusId = defaultValues.statusId;
    } else if (defaultValues && 'status' in defaultValues && typeof defaultValues.status === 'string') {
      console.warn("TripForm: defaultValues.status (string) is deprecated. Use defaultValues.statusId (number).");
      const legacyStatus = defaultValues.status.toLowerCase();
      if (legacyStatus === 'planned') initialStatusId = 1;
      else if (legacyStatus === 'completed') initialStatusId = 2; // Assuming 2 for completed
      else if (legacyStatus === 'cancelled') initialStatusId = 3; // Assuming 3 for cancelled
    }

    return {
      name: defaultValues?.name || "",
      startDate: defaultValues?.startDate ? new Date(defaultValues.startDate) : new Date(),
      endDate: defaultValues?.endDate ? new Date(defaultValues.endDate) : new Date(new Date().setDate(new Date().getDate() + 7)),
      statusId: initialStatusId,
      userId: defaultValues?.userId || null, // Ensure userId is part of the form values
    };
  };

  const form = useForm<TripFormValues>({
    resolver: zodResolver(tripFormSchema),
    defaultValues: prepareDefaultValues(),
  });

  const { data: statusesData, isLoading: isLoadingStatuses } = useQuery<TravelStatus[]>({ 
    queryKey: ['travel-statuses'],
    queryFn: async () => {
      const response = await fetch('/api/travel-statuses');
      if (!response.ok) {
        throw new Error('Failed to fetch statuses');
      }
      return response.json();
    },
  });

  const handleSubmit: SubmitHandler<TripFormValues> = (values) => {
    const formattedValues: TripApiValues = {
      ...values,
      startDate: format(values.startDate, 'yyyy-MM-dd'),
      endDate: format(values.endDate, 'yyyy-MM-dd'),
      statusId: values.statusId,
      userId: values.userId, // Pass userId
      ...(isEditing && defaultValues?.id ? { id: defaultValues.id } : {})
    };
    onSubmit(formattedValues);
  };

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
              name="statusId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(parseInt(value, 10))}
                    defaultValue={field.value?.toString()} 
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
