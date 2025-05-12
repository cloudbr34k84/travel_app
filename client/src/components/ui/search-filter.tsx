import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";

interface SearchFilterProps {
  searchPlaceholder?: string;
  onSearchChange: (value: string) => void;
  filters?: {
    name: string;
    options: { value: string; label: string }[];
    value: string;
    onChange: (value: string) => void;
  }[];
}

export function SearchFilter({
  searchPlaceholder = "Search...",
  onSearchChange,
  filters = [],
}: SearchFilterProps) {
  return (
    <div className="bg-white rounded-lg shadow p-4 mb-6">
      <div className="flex flex-col md:flex-row md:items-center space-y-3 md:space-y-0 md:space-x-4">
        <div className="flex-1 relative">
          <Input
            placeholder={searchPlaceholder}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pr-10"
          />
          <div className="absolute right-3 top-2.5">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
        </div>
        {filters.length > 0 && (
          <div className="flex flex-wrap gap-4">
            {filters.map((filter) => (
              <Select
                key={filter.name}
                value={filter.value}
                onValueChange={filter.onChange}
              >
                <SelectTrigger className="w-44">
                  <SelectValue placeholder={`All ${filter.name}`} />
                </SelectTrigger>
                <SelectContent>
                  {filter.options.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
