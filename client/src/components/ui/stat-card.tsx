import { ReactNode } from "react";

/**
 * Props interface for the StatCard component with improved type handling
 */
export interface StatCardProps {
  /** Icon to display in the card */
  icon: ReactNode;
  /** CSS color class for the icon */
  iconColor: string;
  /** CSS background color class for the icon container */
  iconBgColor: string;
  /** Label text to display above the value */
  label: string;
  /** 
   * Value to display in the card
   * Can be a number, string, or null/undefined which will show a fallback
   */
  value: number | string | null | undefined;
  /** Optional fallback value to show when value is null or undefined */
  fallbackValue?: string;
}

/**
 * A card component for displaying statistical information with an icon
 * Handles null/undefined values gracefully with fallbacks
 */
export function StatCard({
  icon,
  iconColor,
  iconBgColor,
  label,
  value,
  fallbackValue = "—",
}: StatCardProps) {
  // Safely handle value display with nullish coalescing
  const displayValue = value ?? fallbackValue;
  
  return (
    <div className="bg-white rounded-lg shadow p-6 flex items-center">
      <div className={`rounded-full ${iconBgColor ?? "bg-gray-100"} p-3 mr-4`}>
        <div className={`h-6 w-6 ${iconColor ?? "text-gray-500"}`}>
          {icon}
        </div>
      </div>
      <div>
        <p className="text-gray-500 text-sm">{label ?? "Stat"}</p>
        <p className="text-2xl font-bold text-gray-text">{displayValue}</p>
      </div>
    </div>
  );
}
