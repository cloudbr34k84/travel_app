import { ReactNode } from "react";

interface StatCardProps {
  icon: ReactNode;
  iconColor: string;
  iconBgColor: string;
  label: string;
  value: number | string;
}

export function StatCard({
  icon,
  iconColor,
  iconBgColor,
  label,
  value,
}: StatCardProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6 flex items-center">
      <div className={`rounded-full ${iconBgColor} p-3 mr-4`}>
        <div className={`h-6 w-6 ${iconColor}`}>{icon}</div>
      </div>
      <div>
        <p className="text-gray-500 text-sm">{label}</p>
        <p className="text-2xl font-bold text-gray-text">{value}</p>
      </div>
    </div>
  );
}