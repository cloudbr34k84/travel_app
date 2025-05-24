/**
 * @file EditDestinationPage - Page for editing an existing destination
 * @description This page provides a form interface for editing existing destinations.
 * It loads the current destination data and pre-fills the form, providing better
 * navigation and user experience compared to modal-based editing.
 */

import { useRoute } from "wouter";
import { Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { PageHeader } from "@shared-components/common/page-header";
import { Button } from "@shared-components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Destination, InsertDestination } from "@shared/schema";
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
import { parseServerFieldErrors } from "@shared/lib/utils";
import { useEffect } from "react";

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

export default function EditDestinationPage() {
  const [, params] = useRoute("/destinations/:id/edit");
  const { toast } = useToast();
  const destinationId = params?.id ? parseInt(params.id) : null;

  const { data: destination, isLoading, error } = useQuery<Destination>({
    queryKey: ['/api/destinations', destinationId],
    enabled: !!destinationId,
  });

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

  // Pre-fill form when destination data is loaded
  useEffect(() => {
    if (destination) {
      form.reset({
        name: destination.name || "",
        country: destination.country || "",
        region: destination.region || "",
        description: destination.description || "",
        image: destination.image || "",
        statusId: destination.statusId || 0,
      });
    }
  }, [destination, form]);

  const updateDestination = useMutation({
    mutationFn: async (data: InsertDestination) => {
      return apiRequest(`/api/destinations/${destinationId}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/destinations'] });
      queryClient.invalidateQueries({ queryKey: ['/api/destinations', destinationId] });
      toast({
        title: "Success",
        description: "Destination updated successfully",
      });
      window.location.href = `/destinations/${destinationId}`;
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
          description: "Failed to update destination",
          variant: "destructive",
        });
      }
    },
  });

  const onSubmit = (values: FormValues) => {
    updateDestination.mutate(values);
  };

  if (!destinationId) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Invalid Destination</h1>
          <p className="text-gray-600 mt-2">The destination ID is not valid.</p>
          <Link href="/destinations">
            <Button className="mt-4">Return to Destinations</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-12 bg-gray-200 rounded"></div>
          <div className="h-12 bg-gray-200 rounded"></div>
          <div className="h-12 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error || !destination) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Destination Not Found</h1>
          <p className="text-gray-600 mt-2">The destination you're trying to edit doesn't exist.</p>
          <Link href="/destinations">
            <Button className="mt-4">Return to Destinations</Button>
          </Link>
        </div>
      </div>
    );
  }

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
        <Link href={`/destinations/${destinationId}`}>
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Destination
          </Button>
        </Link>
        <PageHeader
          title={`Edit ${destination.name}`}
          description="Update destination information"
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
              <Link href={`/destinations/${destinationId}`}>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
              <Button
                type="submit"
                className="bg-primary hover:bg-primary-800"
                disabled={updateDestination.isPending}
              >
                {updateDestination.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}