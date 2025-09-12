import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Clock } from "lucide-react";
import { RestaurantMenu } from "./RestaurantMenu";

interface Table {
  id: number;
  number: string;
  seats: number;
  status: "available" | "occupied";
  occupiedSince?: string;
}

const tables: Table[] = [
  { id: 1, number: "01", seats: 4, status: "available" },
  { id: 2, number: "02", seats: 2, status: "occupied", occupiedSince: "19:30" },
  { id: 3, number: "03", seats: 6, status: "available" },
  { id: 4, number: "04", seats: 4, status: "available" },
  { id: 5, number: "05", seats: 8, status: "occupied", occupiedSince: "20:15" },
  { id: 6, number: "06", seats: 2, status: "available" },
  { id: 7, number: "07", seats: 4, status: "available" },
  { id: 8, number: "08", seats: 6, status: "available" },
  { id: 9, number: "09", seats: 4, status: "occupied", occupiedSince: "18:45" },
  { id: 10, number: "10", seats: 2, status: "available" },
  { id: 11, number: "11", seats: 4, status: "available" },
  { id: 12, number: "12", seats: 6, status: "available" },
];

export const TableGrid = () => {
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);

  const handleTableClick = (table: Table) => {
    if (table.status === "available") {
      setSelectedTable(table);
    }
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
            برای مشاهده منو، روی میزهای سبز کلیک کنید
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {tables.map((table) => (
            <Card
              key={table.id}
              className={`
                relative p-6 cursor-pointer transition-all duration-300 
                ${
                  table.status === "available"
                    ? "bg-primary/10 border-primary hover:bg-primary/20 hover:scale-105 table-pulse"
                    : "bg-destructive/10 border-destructive cursor-not-allowed opacity-70"
                }
                hover:shadow-lg
              `}
              onClick={() => handleTableClick(table)}
            >
              <div className="text-center space-y-3">
                <div className="text-2xl font-bold">میز {table.number}</div>
                
                <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
                  <Users size={16} />
                  <span>{table.seats} نفر</span>
                </div>

                <Badge
                  variant={table.status === "available" ? "default" : "destructive"}
                  className="w-full justify-center"
                >
                  {table.status === "available" ? "آزاد" : "اشغال"}
                </Badge>

                {table.status === "occupied" && table.occupiedSince && (
                  <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
                    <Clock size={12} />
                    <span>از {table.occupiedSince}</span>
                  </div>
                )}
              </div>

              {table.status === "available" && (
                <div className="absolute inset-0 bg-primary/5 rounded-lg border-2 border-primary/20 animate-pulse" />
              )}
            </Card>
          ))}
        </div>

        <div className="mt-8 text-center">
          <div className="flex justify-center items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-primary rounded-full"></div>
              <span>میز آزاد</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-destructive rounded-full"></div>
              <span>میز اشغال</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};