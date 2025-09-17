// src/components/TableGrid.tsx

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableStatus } from "@/types/cafe";

// Define an interface for the component's props
interface TableGridProps {
  tables: Table[];
  onTableClick: (table: Table) => void;
}

// A helper object for styling based on status
const statusStyles: { [key in TableStatus]: { style: string; label: string } } = {
  free:    { style: "bg-green-500 text-white", label: "خالی" },
  reserved: { style: "bg-yellow-500 text-white", label: "رزرو شده" },
  serving: { style: "bg-red-500 text-white", label: "در حال سرویس" },
  paid:     { style: "bg-blue-500 text-white", label: "تسویه شده" },
};

// The single, correct component definition
export const TableGrid = ({ tables, onTableClick }: TableGridProps) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
      {tables.map((table) => {
        const statusInfo = statusStyles[table.status] ?? { style: "bg-gray-400 text-white", label: "نامشخص" };
        return (
          <Card
            key={table.id}
            onClick={() => onTableClick(table)}
            className="p-4 flex flex-col items-center justify-center gap-2 cursor-pointer hover:scale-105 transition-transform"
          >
            <p className="font-bold text-lg">{table.name}</p>
            <Badge className={statusInfo.style}>
              {statusInfo.label}
            </Badge>
          </Card>
        );
      })}
    </div>
  );
};