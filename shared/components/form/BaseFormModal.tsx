import React from 'react';
import { useForm, SubmitHandler, FieldValues, UseFormReturn, DefaultValues } from 'react-hook-form'; // Import DefaultValues
import { zodResolver } from '@hookform/resolvers/zod';
import { ZodSchema, ZodTypeDef } from 'zod';

// Assuming paths to UI components and hooks based on the workspace structure
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { useToast } from '../../hooks/use-toast';

interface BaseFormModalProps<
  TOutput extends FieldValues, // Type of data after Zod parsing (and potential transformation)
  TDef extends ZodTypeDef,    // Zod definition type (usually inferred)
  TInput extends FieldValues, // Type of data for form fields (before Zod parsing)
> {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  schema: ZodSchema<TOutput, TDef, TInput>; // Zod schema
  defaultValues?: DefaultValues<TInput>; // Use DefaultValues<TInput> here
  onSubmit: SubmitHandler<TOutput>; // Receives parsed and validated data (TOutput)
  transformValues?: (values: TOutput) => TOutput | Promise<TOutput>; // Optional further transformation on TOutput
  children: (form: UseFormReturn<TInput, any, TOutput>) => React.ReactNode; // Update form type for children
}

export function BaseFormModal<
  TOutput extends FieldValues,
  TDef extends ZodTypeDef,
  TInput extends FieldValues = TOutput, // TInput defaults to TOutput if schema input/output types are the same
>({
  open,
  onOpenChange,
  title,
  schema,
  defaultValues,
  onSubmit,
  transformValues,
  children,
}: BaseFormModalProps<TOutput, TDef, TInput>) {
  const { toast } = useToast();

  const form = useForm<TInput, any, TOutput>({ // Specify TInput, context as any, and TOutput as transformed values
    resolver: zodResolver(schema),
    defaultValues: defaultValues,
  });

  // This handler receives TOutput because zodResolver provides the parsed/transformed data
  const internalOnSubmit: SubmitHandler<TOutput> = async (parsedData) => {
    try {
      let dataToSubmit = parsedData;
      if (transformValues) {
        dataToSubmit = await transformValues(parsedData);
      }
      await onSubmit(dataToSubmit);
      form.reset(defaultValues); // Reset to default values (or empty if none) after successful submission
      onOpenChange(false);
      toast({
        title: "Success",
        description: "Your changes have been saved.",
      });
    } catch (error: any) {
      console.error("Form submission error:", error);
      toast({
        title: "Error",
        description: error?.message || "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    }
  };

  React.useEffect(() => {
    if (open) {
      form.reset(defaultValues as DefaultValues<TInput> | undefined); // Ensure type compatibility for reset
    }
  }, [open, defaultValues, form.reset]); // form.reset is stable, but good to include if its identity could change

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      // If modal is closed (e.g., by 'x' button, ESC, or overlay click),
      // reset form to its last provided defaultValues state.
      form.reset(defaultValues as DefaultValues<TInput> | undefined); // Ensure type compatibility for reset
    }
    onOpenChange(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]"> {/* Adjust styling as needed */}
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(internalOnSubmit)} className="space-y-4">
          {children(form)}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)} // Triggers reset via handleOpenChange
            >
              Cancel
            </Button>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
