/**
 * CommonTable - Reusable Table Component
 * 
 * A prop-driven table component that dynamically renders headers and cells
 * based on provided column definitions and data arrays.
 * 
 * @example
 * const columns = [
 *   { header: "Name", accessor: (row) => row.name },
 *   { header: "Email", accessor: (row) => row.email },
 *   { header: "Actions", accessor: (row) => <Button>Edit</Button> }
 * ];
 * 
 * const data = [
 *   { name: "John Doe", email: "john@example.com" },
 *   { name: "Jane Smith", email: "jane@example.com" }
 * ];
 * 
 * // Basic table without clickable rows
 * <CommonTable columns={columns} data={data} />
 * 
 * // Table with clickable rows that navigate to view pages
 * <CommonTable 
 *   columns={columns} 
 *   data={data} 
 *   getRowLink={(row) => `/users/${row.id}`}
 * />
 * 
 * @usage
 * - columns: Array of column definitions with header text and accessor functions
 * - data: Array of row objects to display
 * - className: Optional additional styling classes
 * - getRowLink: Optional function that returns a URL for row navigation when clicked
 * 
 * @clickable_rows
 * When getRowLink is provided:
 * - Each row becomes clickable with pointer cursor and hover effects
 * - Clicking navigates to the URL returned by getRowLink(row)
 * - Interactive elements within cells (buttons, links) should use stopPropagation 
 *   to prevent triggering row navigation
 * 
 * @future_extensions
 * - Add sorting functionality by extending column definitions
 * - Add pagination props for large datasets
 * - Add row selection capabilities
 * - Add loading and error states
 */

import * as React from "react"
import { cn } from "@shared/lib/utils"

// Import the existing table components
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@shared-components/ui/table"

interface CommonTableColumn {
  header: string;
  accessor: (row: any) => React.ReactNode;
}

interface CommonTableProps {
  columns: CommonTableColumn[];
  data: any[];
  className?: string;
  getRowLink?: (row: any) => string;
}

/**
 * CommonTable Component
 * 
 * Renders a dynamic table with configurable columns and data.
 * Supports optional clickable rows for navigation.
 */
const CommonTable: React.FC<CommonTableProps> = ({ 
  columns, 
  data, 
  className,
  getRowLink
}) => {
  const handleRowClick = (row: any) => {
    if (getRowLink) {
      const url = getRowLink(row);
      window.location.href = url;
    }
  };

  return (
    <div className={cn("w-full", className)}>
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column, index) => (
              <TableHead key={index}>
                {column.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell 
                colSpan={columns.length} 
                className="text-center py-8 text-muted-foreground"
              >
                No data available
              </TableCell>
            </TableRow>
          ) : (
            data.map((row, rowIndex) => (
              <TableRow 
                key={rowIndex}
                onClick={() => handleRowClick(row)}
                className={cn(
                  getRowLink && "cursor-pointer hover:bg-gray-50 transition-colors"
                )}
              >
                {columns.map((column, colIndex) => (
                  <TableCell key={colIndex}>
                    {column.accessor(row)}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default CommonTable;
export type { CommonTableColumn, CommonTableProps };