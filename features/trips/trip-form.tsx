/**
 * @file TripForm.tsx
 * @description This file contains the TripForm component, used for adding or editing trips.
 * The Zod schema (tripFormSchema) is defined locally to ensure compatibility with Vite's Fast Refresh.
 * If the schema needs to be reused elsewhere, move it to `@shared/schemas` and import it here.
 */
// filepath: /root/travel_app/features/trips/trip-form.tsx

import { useEffect } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Trip } from "@shared/schema";
import type { TravelStatus } from "@shared/schema";
import { insertTripSchema } from "@shared/schema";

import { Button } from "@shared-components/ui/button";
import { Calendar } from "@shared-components/ui/calendar";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@shared-components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@shared-components/ui/form";
import { Input } from "@shared-components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@shared-components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@shared-components/ui/select";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";

import { cn } from "@shared/lib/utils";
import { useQuery } from "@tanstack/react-query";

/**
 * Type definition for trip form submission values to be sent to the API
 */
export type TripApiValues = {
  name: string;
  startDate: string; // Format: 'yyyy-MM-dd'
  endDate: string;   // Format: 'yyyy-MM-dd'
  statusId: number;
  id?: number;
  userId?: number | null;
};

/**
 * Extended schema for trip form with additional fields and validations.
 * Converts string dates from the API to Date objects for the form.
 */
const tripFormSchema = insertTripSchema.extend({
  startDate: z.date({
    required_error: "Start date is required",
  }),
  endDate: z.date({
    required_error: "End date is required",
  }),
  statusId: z.number().int().positive({ message: "Status is required" }),
});

/**
 * Type definition for trip form values based on the schema
 */
export type TripFormValues = z.infer<typeof tripFormSchema>;

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
 * Default empty values for the trip form.
 */
const defaultEmptyValues: TripFormValues = {
  name: "",
  startDate: new Date(),
  endDate: new Date(new Date().setDate(new Date().getDate() + 7)),
  statusId: 0,
  userId: null,
};

export function TripForm({
  open,
  onOpenChange,
  onSubmit,
  defaultValues,
  isEditing = false,
}: TripFormProps) {
  const form = useForm<TripFormValues>({
    resolver: zodResolver(tripFormSchema),
    defaultValues: defaultEmptyValues,
    mode: "onChange",
  });

  /**
   * Effect to reset the form when `defaultValues` change or `isEditing` status changes.
   */
  useEffect(() => {
    if (isEditing && defaultValues) {
      const startDate = defaultValues.startDate ? new Date(defaultValues.startDate) : defaultEmptyValues.startDate;
      const endDate = defaultValues.endDate ? new Date(defaultValues.endDate) : defaultEmptyValues.endDate;
      
      form.reset({
        name: defaultValues.name || defaultEmptyValues.name,
        startDate: startDate,
        endDate: endDate,
        statusId: defaultValues.statusId || defaultEmptyValues.statusId,
        userId: defaultValues.userId !== undefined ? defaultValues.userId : defaultEmptyValues.userId,
      });
    } else if (!isEditing) {
      form.reset(defaultEmptyValues);
    }
  }, [isEditing, defaultValues, form]);

  const { data: statusesData, isLoading: isLoadingTravelStatuses } = useQuery<TravelStatus[]>({
    queryKey: ['/api/travel-statuses'],
    queryFn: async (): Promise<TravelStatus[]> => {
      const response = await fetch('/api/travel-statuses');
      if (!response.ok) {
        throw new Error('Failed to fetch statuses');
      }
      return response.json();
    },
  });

  const handleFormSubmit: SubmitHandler<TripFormValues> = (values) => {
    const formattedValues: TripApiValues = {
      ...values,
      startDate: format(values.startDate, 'yyyy-MM-dd'),
      endDate: format(values.endDate, 'yyyy-MM-dd'),
      statusId: values.statusId,
      userId: values.userId,
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
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
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
                    onValueChange={(value) => field.onChange(parseInt(value))}
                    value={field.value?.toString() ?? ""}
                    disabled={isLoadingTravelStatuses}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {isLoadingTravelStatuses ? (
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
              <Button 
                type="submit" 
                className="bg-primary hover:bg-primary-800"
                disabled={form.formState.isSubmitting || !form.formState.isValid}
              >
                {form.formState.isSubmitting
                  ? isEditing ? "Saving..." : "Adding..."
                  : isEditing ? "Save Changes" : "Add Trip"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

TripForm.displayName = "TripForm";
