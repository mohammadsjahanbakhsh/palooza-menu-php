import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Clock } from "lucide-react";
import { RestaurantMenu } from "./RestaurantMenu";
// import { Table } from "@/types/cafe"
interface Table {
  id: number;
  number: string;
  seats: number;
  status: "empty" | "reserved" | "in-service" | "settled";
  timeInfo?: string;
}

interface TableColors {
  empty: string;
  reserved: string;
  "in-service": string;
  settled: string;
}

const initialTables: Table[] = [
  { id: 1, number: "01", seats: 4, status: "empty" },
  { id: 2, number: "02", seats: 2, status: "reserved", timeInfo: "19:30" },
  { id: 3, number: "03", seats: 6, status: "empty" },
  { id: 4, number: "04", seats: 4, status: "in-service", timeInfo: "20:15" },
  { id: 5, number: "05", seats: 8, status: "settled", timeInfo: "21:00" },
  { id: 6, number: "06", seats: 2, status: "empty" },
  { id: 7, number: "07", seats: 4, status: "reserved", timeInfo: "20:30" },
  { id: 8, number: "08", seats: 6, status: "empty" },
  { id: 9, number: "09", seats: 4, status: "in-service", timeInfo: "18:45" },
  { id: 10, number: "10", seats: 2, status: "empty" },
  { id: 11, number: "11", seats: 4, status: "settled", timeInfo: "19:45" },
  { id: 12, number: "12", seats: 6, status: "empty" },
];

const defaultColors: TableColors = {
  empty: "#22c55e", // سبز
  reserved: "#eab308", // زرد  
  "in-service": "#ef4444", // قرمز
  settled: "#3b82f6", // آبی
};

const statusLabels = {
  empty: "خالی",
  reserved: "رزرو شده", 
  "in-service": "در حال سرویس",
  settled: "تسویه شده"
};

export const TableGrid = () => {
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [tables, setTables] = useState<Table[]>(initialTables);
  const [colors, setColors] = useState<TableColors>(defaultColors);
  const [showColorPicker, setShowColorPicker] = useState(false);

  const handleTableClick = (table: Table) => {
    if (table.status === "empty") {
      setSelectedTable(table);
    }
  };

  const handleColorChange = (status: keyof TableColors, color: string) => {
    setColors(prev => ({ ...prev, [status]: color }));
  };

  const closeMenu = () => {
    setSelectedTable(null);
  };

  if (selectedTable) {
    return <RestaurantMenu table={selectedTable} onClose={closeMenu} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            رستوران پرشین پالوزا
          </h1>
          <p className="text-muted-foreground text-lg">
            برای مشاهده منو، روی میزهای خالی کلیک کنید
          </p>
          <div className="mt-4">
            <button
              onClick={() => setShowColorPicker(!showColorPicker)}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              تنظیم رنگ‌ها
            </button>
          </div>
        </div>

        {showColorPicker && (
          <Card className="p-6 mb-6">
            <h3 className="text-xl font-bold mb-4">تنظیم رنگ‌های میزها</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(statusLabels).map(([status, label]) => (
                <div key={status} className="flex items-center gap-3">
                  <label htmlFor={`color-picker-${status}`}
                  className="min-w-0 flex-1 font-medium">{label}:</label>
                  <input
                    type="color"
                    value={colors[status as keyof TableColors]}
                    onChange={(e) => handleColorChange(status as keyof TableColors, e.target.value)}
                    className="w-12 h-8 rounded border cursor-pointer"
                  />
                </div>
              ))}
            </div>
          </Card>
        )}

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {tables.map((table) => (
            <Card
              key={table.id}
              className={`
                relative p-6 transition-all duration-300 
                ${table.status === "empty" ? "cursor-pointer hover:scale-105 table-pulse" : "cursor-default"}
                hover:shadow-lg
              `}
              style={{
                backgroundColor: `${colors[table.status]}20`,
                borderColor: colors[table.status],
                borderWidth: '2px'
              }}
              onClick={() => handleTableClick(table)}
            >
              <div className="text-center space-y-3">
                <div className="text-2xl font-bold">میز {table.number}</div>
                
                <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
                  <Users size={16} />
                  <span>{table.seats} نفر</span>
                </div>

                <Badge
                  className="w-full justify-center text-white"
                  style={{ backgroundColor: colors[table.status] }}
                >
                  {statusLabels[table.status]}
                </Badge>

                {table.timeInfo && (
                  <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
                    <Clock size={12} />
                    <span>{table.timeInfo}</span>
                  </div>
                )}
              </div>

              {table.status === "empty" && (
                <div 
                  className="absolute inset-0 rounded-lg border-2 animate-pulse opacity-30"
                  style={{ 
                    backgroundColor: `${colors.empty}10`,
                    borderColor: colors.empty 
                  }}
                />
              )}
            </Card>
          ))}
        </div>

        <div className="mt-8 text-center">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            {Object.entries(statusLabels).map(([status, label]) => (
              <div key={status} className="flex items-center gap-2">
                <div 
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: colors[status as keyof TableColors] }}
                ></div>
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};