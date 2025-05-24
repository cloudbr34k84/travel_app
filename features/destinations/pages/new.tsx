/**
 * @file NewDestinationPage - Page for creating a new destination
 * @description This page provides a form interface for adding new destinations.
 * It uses the shared DestinationForm component but renders it as a standalone page
 * instead of a modal, providing better navigation and user experience.
 */

import { Link } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { PageHeader } from "@shared-components/common/page-header";
import { Button } from "@shared-components/ui/button";
import { ArrowLeft } from "lucide-react";
import { InsertDestination } from "@shared/schema";
import { useToast } from "@shared/hooks/use-toast";
import { apiRequest, queryClient } from "@shared/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { insertDestinationSchema } from "@shared/schema";
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
import { Textarea } from "@shared-components/ui/textarea";
import { useQuery } from "@tanstack/react-query";
import { parseServerFieldErrors } from "@shared/lib/utils";

interface TravelStatus {
  id: number;
  label: string;
}

const destinationFormSchema = insertDestinationSchema.extend({
  image: z.string().url("Please enter a valid image URL").optional().or(z.literal("")),
  statusId: z.number().int().positive({ message: "Please select a status." }),
  description: z.string().optional().default(""),
});

type FormValues = z.infer<typeof destinationFormSchema>;

export default function NewDestinationPage() {
  const { toast } = useToast();

  const { data: travelStatuses, isLoading: isLoadingTravelStatuses } = useQuery<TravelStatus[]>({
    queryKey: ['/api/travel-statuses'],
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(destinationFormSchema),
    defaultValues: {
      name: "",
      country: "",
      region: "",
      description: "",
      image: "",
      statusId: 0,
    },
    mode: "onChange",
  });

  const createDestination = useMutation({
    mutationFn: async (data: InsertDestination) => {
      return apiRequest('POST', '/api/destinations', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/destinations'] });
      toast({
        title: "Success",
        description: "Destination created successfully",
      });
      window.location.href = '/destinations';
    },
    onError: (error) => {
      const fieldErrors = parseServerFieldErrors(error);
      if (fieldErrors) {
        Object.entries(fieldErrors).forEach(([fieldName, message]) => {
          form.setError(fieldName as keyof FormValues, { type: 'server', message });
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to create destination",
          variant: "destructive",
        });
      }
    },
  });

  const onSubmit = (values: FormValues) => {
    const submitData = {
      ...values,
      image: values.image || ""
    };
    createDestination.mutate(submitData);
  };

  const regions = [
    { value: "Africa", label: "Africa" },
    { value: "Asia", label: "Asia" },
    { value: "Europe", label: "Europe" },
    { value: "North America", label: "North America" },
    { value: "South America", label: "South America" },
    { value: "Oceania", label: "Oceania" },
    { value: "Antarctica", label: "Antarctica" },
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <Link href="/destinations">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Destinations
          </Button>
        </Link>
        <PageHeader
          title="Add New Destination"
          description="Create a new travel destination"
        />
      </div>

      <div className="max-w-2xl">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                  <Select onValueChange={field.onChange} value={field.value}>
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
              name="statusId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(parseInt(value))}
                    value={field.value?.toString() || ""}
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
                        travelStatuses?.map((status) => (
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

            <div className="flex gap-4">
              <Link href="/destinations">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
              <Button
                type="submit"
                className="bg-primary hover:bg-primary-800"
                disabled={createDestination.isPending}
              >
                {createDestination.isPending ? "Creating..." : "Create Destination"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}