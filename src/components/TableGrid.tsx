// src/components/TableGrid.tsx

import { Table, TableStatus } from "@/types/cafe";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Clock, Coffee } from "lucide-react";
import { cn } from "@/lib/utils";

interface TableGridProps {
  tables: Table[];
  onTableClick: (table: Table) => void;
  className?: string;
}

// ✅ FIX: Status keys updated to match project types (free, serving, etc.)
const tableStatusConfig = {
  free: {
    bgClass: "bg-gradient-to-br from-table-free to-table-free/80",
    label: "خالی",
    textColor: "text-coffee-dark",
    borderClass: "border-table-free/30",
    glowClass: "shadow-[0_0_20px_rgba(34,197,94,0.4)]",
  },
  reserved: {
    bgClass: "bg-gradient-to-br from-table-reserved to-table-reserved/80",
    label: "رزرو",
    textColor: "text-coffee-dark",
    borderClass: "border-table-reserved/30",
    glowClass: "shadow-[0_0_15px_rgba(234,179,8,0.3)]",
  },
  serving: {
    bgClass: "bg-gradient-to-br from-table-serving to-table-serving/80",
    label: "در حال سرویس",
    textColor: "text-coffee-dark",
    borderClass: "border-table-serving/30",
    glowClass: "shadow-[0_0_15px_rgba(239,68,68,0.3)]",
  },
  paid: {
    bgClass: "bg-gradient-to-br from-table-paid to-table-paid/80",
    label: "تسویه شده",
    textColor: "text-coffee-dark",
    borderClass: "border-table-paid/30",
    glowClass: "shadow-[0_0_15px_rgba(59,130,246,0.3)]",
  },
};

const TableCard = ({ table, onClick }: { table: Table; onClick: () => void }) => {
  // ✅ FIX: Using 'free' status
  const config = tableStatusConfig[table.status as keyof typeof tableStatusConfig];
  const isFreeTable = table.status === 'free';
  const timeInService = (() => {
    if (table.status !== 'serving' || !table.lastActivity) return null;
    const lastActivityDate = new Date(table.lastActivity);
    if (isNaN(lastActivityDate.getTime())) return null;
    const minutes = Math.floor((Date.now() - new Date(table.lastActivity).getTime()) / 60000);
    return `${minutes} دقیقه`;
  })();

  return (
    <Card
      className={cn(
        "relative cursor-pointer transition-all duration-300 hover:scale-105 border-2",
        "backdrop-blur-sm aspect-square flex flex-col justify-between p-4",
        config.bgClass,
        config.borderClass,
        config.glowClass,
        isFreeTable && "animate-pulse hover:animate-none",
        "hover:animate-shake",
        "hover:shadow-2xl hover:border-white/50"
      )}
      onClick={onClick}
    >
      {/* Table Header */}
      <div className="flex items-center justify-between">
        <div className={cn("font-bold text-fluid-lg", config.textColor)}>
          {table.name}
          {isFreeTable && (
            <span className="inline-block w-2 h-2 bg-white rounded-full ml-2 animate-ping"></span>
          )}
        </div>
        <Badge
          variant="secondary"
          className={cn(
            "text-xs font-medium px-2 py-1 rounded-full",
            config.textColor,
            "bg-white/30 backdrop-blur-sm border border-white/20"
          )}
        >
          {config.label}
        </Badge>
      </div>

      {/* Table Info */}
      <div className="flex items-center justify-between mt-2">
        <div className={cn("flex items-center gap-1 text-fluid-base font-medium", config.textColor)}>
          <Users className="w-4 h-4" />
          <span>{table.capacity} نفره</span>
        </div>

        {/* ✅ FIX: Using 'serving' status and safely handling date string from API */}
        {table.status === 'serving' && table.lastActivity && (
          <div className={cn("flex items-center gap-1 text-fluid-xs", config.textColor)}>
            <Clock className="w-3 h-3" />
            <span>
              {Math.floor((Date.now() - new Date(table.lastActivity).getTime()) / 60000)}
            </span>
          </div>
        )}

        {isFreeTable && (
          <div className={cn("text-xs font-medium", config.textColor)}>
            آماده پذیرایی
          </div>
        )}
      </div>

      {/* Order Summary */}
      {table.currentOrder && (
        <div className={cn("mt-2 text-xs", config.textColor)}>
          <div className="flex items-center gap-1">
            <Coffee className="w-3 h-3" />
            <span>{table.currentOrder.items.length} آیتم</span>
          </div>
          <div className="font-medium">
            {table.currentOrder.totalAmount.toLocaleString()} تومان
          </div>
        </div>
      )}

      {/* Empty table call-to-action */}
      {isFreeTable && (
        <div className={cn("mt-2 text-fluid-xs text-center", config.textColor)}>
          <div className="bg-white/20 rounded-lg px-2 py-1 backdrop-blur-sm">
            کلیک برای رزرو یا سفارش
          </div>
        </div>
      )}
    </Card>
  );
};

const TableGrid = ({ tables, onTableClick, className }: TableGridProps) => {
  return (
    <div className={cn("grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4", className)}>
      {tables.map((table) => (
        <TableCard
          key={table.id}
          table={table}
          onClick={() => onTableClick(table)}
        />
      ))}
    </div>
  );
};

export default TableGrid;