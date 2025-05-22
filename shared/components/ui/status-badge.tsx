import { cn } from "@shared/lib/utils";

export interface StatusBadgeProps {
  statusLabel: string;
  className?: string;
}

export function StatusBadge({ statusLabel, className }: StatusBadgeProps) {
  const getStatusStyles = (label: string) => {
    switch (label.toLowerCase()) {
      case "visited":
      case "completed":
        return "bg-green-500 text-white";
      case "planned":
      case "upcoming":
        return "bg-primary text-white";
      case "wishlist":
        return "bg-accent text-white";
      case "cancelled":
        return "bg-destructive text-white";
      default:
        return "bg-gray-200 text-gray-800";
    }
  };

  return (
    <span
      className={cn(
        "text-xs font-medium px-2 py-1 rounded-full",
        getStatusStyles(statusLabel),
        className
      )}
    >
      {statusLabel.charAt(0).toUpperCase() + statusLabel.slice(1)}
    </span>
  );
}
