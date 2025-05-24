/**
 * @file PasswordToggleField.tsx
 * @description A reusable password input field component with a visibility toggle.
 * It allows users to show or hide their password input.
 * This component is built using shadcn/ui components and Tailwind CSS.
 *
 * @component PasswordToggleField
 *
 * @props {string} [label] - Optional label for the password field.
 * @props {string} [id] - Optional id for the input field. If not provided, one is generated using the `name` prop (e.g., `password-field-${name}`).
 * @props {string} name - Name attribute for the input field. Used for form submission and generating a default id.
 * @props {string | number | readonly string[]} [value] - Value for controlled input.
 * @props {(event: React.ChangeEvent<HTMLInputElement>) => void} [onChange] - onChange handler for controlled input.
 * @props {string | number | readonly string[]} [defaultValue] - Default value for uncontrolled input.
 * @props {string} [placeholder] - Placeholder text for the input field.
 * @props {boolean} [required] - Whether the input field is required.
 * @props {string} [error] - Optional error message to display below the input.
 * @props {string} [className] - Optional className for the root div element wrapping the label, input, and error message.
 * @props {string} [inputClassName] - Optional className for the input element itself, merged with internal classes.
 * @props ...rest - Other standard HTML input attributes are passed to the underlying Input component (excluding `type`).
 *
 * @example
 * import { useState } from 'react';
 * import PasswordToggleField from '@shared/components/form/PasswordToggleField'; // Adjust path as needed
 *
 * function MyForm() {
 *   const [password, setPassword] = useState('');
 *   const [formError, setFormError] = useState('');
 *
 *   const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
 *     const newPassword = e.target.value;
 *     setPassword(newPassword);
 *     if (newPassword.length > 0 && newPassword.length < 8) {
 *       setFormError('Password must be at least 8 characters.');
 *     } else {
 *       setFormError('');
 *     }
 *   };
 *
 *   return (
 *     <form onSubmit={(e) => e.preventDefault()}>
 *       <PasswordToggleField
 *         label="Create Password"
 *         id="create-password"
 *         name="newPassword"
 *         value={password}
 *         onChange={handlePasswordChange}
 *         placeholder="Enter a strong password"
 *         error={formError}
 *         inputClassName="mt-1" // Example of passing class to input
 *         required
 *       />
 *       <button type="submit" className="mt-4 p-2 bg-blue-500 text-white rounded">
 *         Submit
 *       </button>
 *     </form>
 *   );
 * }
 *
 * @maintenance
 * - Icons: Uses `Eye` and `EyeOff` from `lucide-react`.
 * - Styling: Styled with Tailwind CSS. Leverages `shadcn/ui` components (`Input`, `Label`, `Button`).
 * - `cn` utility: Assumes `cn` utility function is available at `@shared/lib/utils` for merging Tailwind classes.
 * - Accessibility:
 *   - Ensures `label` is associated with the `input` via `htmlFor` and `id`.
 *   - Toggle button has an `aria-label` for screen readers and `tabIndex="-1"` to be excluded from tab order.
 *   - Focus styles are inherited from `shadcn/ui` components and enhanced for error states.
 * - Controlled/Uncontrolled: Supports both modes.
 *   - For controlled mode, provide `value` and `onChange`.
 *   - For uncontrolled mode, provide `defaultValue`.
 */

import * as React from 'react';
import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Input } from '@shared-components/ui/input';
import { Label } from '@shared-components/ui/label';
import { Button } from '@shared-components/ui/button';
import { cn } from '@shared/lib/utils'; // Ensure this path is correct for your project

export interface PasswordToggleFieldProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  error?: string;
  name: string; // Made `name` explicitly required for generating default `id` and form functionality.
  inputClassName?: string;
  // `id` is optional in React.InputHTMLAttributes, will be generated if not provided.
}

const PasswordToggleField = React.forwardRef<HTMLInputElement, PasswordToggleFieldProps>(
  ({ label, id, name, error, className, inputClassName, ...rest }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const togglePasswordVisibility = () => setShowPassword(!showPassword);

    // Generate a unique ID for the input if not provided, for label association.
    const generatedId = id || `password-field-${name}`;

    return (
      <div className={cn('space-y-1', className)}>
        {label && <Label htmlFor={generatedId}>{label}</Label>}
        <div className="relative">
          <Input
            ref={ref}
            id={generatedId}
            type={showPassword ? 'text' : 'password'}
            name={name}
            className={cn(
              'pr-10', // Add padding to the right to make space for the icon button
              error ? 'border-red-500 focus-visible:ring-red-500' : '', // Error styling
              inputClassName // Allow external classes to be passed to the input
            )}
            {...rest} // Spread other props like value, onChange, placeholder, required, etc.
          />
          <Button
            type="button"
            variant="ghost"
            size="sm" // Using "sm" size for a smaller button
            className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 px-0" // Position and size the button
            onClick={togglePasswordVisibility}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            tabIndex={-1} // Remove button from tab order as input is the primary focus
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
        </div>
        {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
      </div>
    );
  }
);

PasswordToggleField.displayName = 'PasswordToggleField';

export default PasswordToggleField;
