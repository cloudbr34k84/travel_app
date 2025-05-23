import React from 'react';
import { Control, FieldValues, Path, Controller } from 'react-hook-form';
import { Input, InputProps } from '../ui/input'; // Assuming path
import { Textarea } from '../ui/textarea'; // Assuming path, removed TextareaProps import
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../ui/select'; // Assuming path
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from '../ui/form'; // Assuming path

// --- TextField ---

interface TextFieldProps<T extends FieldValues> extends Omit<InputProps, 'name'> {
  /**
   * React Hook Form control object.
   */
  control: Control<T>;
  /**
   * Name of the field in the form.
   */
  name: Path<T>;
  /**
   * Label for the form field.
   */
  label: string;
  /**
   * Optional placeholder text for the input.
   */
  placeholder?: string;
  /**
   * Optional description text to provide additional context for the field.
   */
  description?: string;
}

/**
 * A reusable text input field component integrated with React Hook Form.
 * It uses the project's UI library for styling and includes label, error message display, and an optional description.
 *
 * @template T - The type of the form values, extending FieldValues.
 * @param {TextFieldProps<T>} props - The props for the TextField component.
 * @returns {JSX.Element} The rendered text input field.
 *
 * @example
 * <TextField
 *   control={form.control}
 *   name="username"
 *   label="Username"
 *   placeholder="Enter your username"
 *   description="This is your public display name."
 * />
 */
export function TextField<T extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  description,
  ...rest
}: TextFieldProps<T>): JSX.Element {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState: { error } }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input placeholder={placeholder} {...field} {...rest} />
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          {error && <FormMessage>{error.message}</FormMessage>}
        </FormItem>
      )}
    />
  );
}

// --- TextAreaField ---

interface TextAreaFieldProps<T extends FieldValues> extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'name'> {
  /**
   * React Hook Form control object.
   */
  control: Control<T>;
  /**
   * Name of the field in the form.
   */
  name: Path<T>;
  /**
   * Label for the form field.
   */
  label: string;
  /**
   * Optional placeholder text for the textarea.
   */
  placeholder?: string;
  /**
   * Optional description text to provide additional context for the field.
   */
  description?: string;
}

/**
 * A reusable textarea input field component integrated with React Hook Form.
 * It uses the project's UI library for styling and includes label, error message display, and an optional description.
 *
 * @template T - The type of the form values, extending FieldValues.
 * @param {TextAreaFieldProps<T>} props - The props for the TextAreaField component.
 * @returns {JSX.Element} The rendered textarea input field.
 *
 * @example
 * <TextAreaField
 *   control={form.control}
 *   name="bio"
 *   label="Biography"
 *   placeholder="Tell us about yourself"
 *   rows={4}
 * />
 */
export function TextAreaField<T extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  description,
  ...rest
}: TextAreaFieldProps<T>): JSX.Element {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState: { error } }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Textarea placeholder={placeholder} {...field} {...rest} />
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          {error && <FormMessage>{error.message}</FormMessage>}
        </FormItem>
      )}
    />
  );
}

// --- SelectField ---

interface SelectFieldOption {
  value: string | number;
  label: string;
}

interface SelectFieldProps<T extends FieldValues> {
  /**
   * React Hook Form control object.
   */
  control: Control<T>;
  /**
   * Name of the field in the form.
   */
  name: Path<T>;
  /**
   * Label for the form field.
   */
  label: string;
  /**
   * Placeholder text for the select input.
   */
  placeholder?: string;
  /**
   * Array of options for the select input. Each option should have a `value` and `label`.
   */
  options: SelectFieldOption[];
  /**
   * Optional description text to provide additional context for the field.
   */
  description?: string;
  /**
   * Optional props to pass to the underlying SelectTrigger component.
   */
  selectTriggerProps?: React.ComponentPropsWithoutRef<typeof SelectTrigger>;
  /**
   * Optional props to pass to the underlying SelectContent component.
   */
  selectContentProps?: React.ComponentPropsWithoutRef<typeof SelectContent>;
}

/**
 * A reusable select dropdown field component integrated with React Hook Form.
 * It uses the project's UI library for styling and includes label, error message display, and an optional description.
 *
 * @template T - The type of the form values, extending FieldValues.
 * @param {SelectFieldProps<T>} props - The props for the SelectField component.
 * @returns {JSX.Element} The rendered select dropdown field.
 *
 * @example
 * <SelectField
 *   control={form.control}
 *   name="category"
 *   label="Category"
 *   placeholder="Select a category"
 *   options={[
 *     { value: "tech", label: "Technology" },
 *     { value: "health", label: "Health" },
 *   ]}
 * />
 */
export function SelectField<T extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  options,
  description,
  selectTriggerProps,
  selectContentProps,
}: SelectFieldProps<T>): JSX.Element {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState: { error } }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <Select onValueChange={field.onChange} defaultValue={field.value as string | undefined}>
            <FormControl>
              <SelectTrigger {...selectTriggerProps}>
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
            </FormControl>
            <SelectContent {...selectContentProps}>
              {options.map((option) => (
                <SelectItem key={option.value} value={String(option.value)}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {description && <FormDescription>{description}</FormDescription>}
          {error && <FormMessage>{error.message}</FormMessage>}
        </FormItem>
      )}
    />
  );
}
