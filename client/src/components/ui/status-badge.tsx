import { cn } from "@/lib/utils";

type StatusType = "visited" | "planned" | "wishlist" | "completed" | "cancelled" | "upcoming";

interface StatusBadgeProps {
  status: StatusType;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const getStatusStyles = (status: StatusType) => {
    switch (status) {
      case "visited":
      case "completed":
        return "bg-green-500 text-white";
      case "planned":
        return "bg-primary text-white";
      case "wishlist":
        return "bg-accent text-white";
      case "cancelled":
        return "bg-destructive text-white";
      case "upcoming":
        return "bg-primary text-white";
      default:
        return "bg-gray-200 text-gray-800";
    }
  };

  return (
    <span
      className={cn(
        "text-xs font-medium px-2 py-1 rounded-full",
        getStatusStyles(status),
        className
      )}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}
