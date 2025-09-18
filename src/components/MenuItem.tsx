import { useState, useEffect } from "react";
import { OrderItem, MenuItem as MenuItemType } from "@/types/cafe";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Plus, Minus, Coffee, Leaf } from "lucide-react";
import { cn } from "@/lib/utils";

interface MenuItemProps {
  item: MenuItemType;
  orderItem: OrderItem | undefined; 
  onUpdate: (menuItem: MenuItemType, quantity: number, notes: string) => void;
}

const MenuItem = ({ item, orderItem, onUpdate }: MenuItemProps) => {
  // تعداد فعلی از پراپ والد گرفته می‌شود
  const currentQuantity = orderItem?.quantity || 0;
  // یادداشت‌ها یک state داخلی دارند تا تایپ کردن در اینپوت ممکن باشد
  const [notes, setNotes] = useState(orderItem?.notes || "");

  // این هوک state داخلی یادداشت‌ها را با والد هماهنگ می‌کند
  useEffect(() => {
    setNotes(orderItem?.notes || "");
  }, [orderItem?.notes]);

  // تابع برای مدیریت تغییر تعداد
  const handleQuantityChange = (amount: number) => {
    const newQuantity = currentQuantity + amount;
    if (newQuantity < 0) return;
    onUpdate(item, newQuantity, notes);
  };
  
  // تابع برای مدیریت تغییر یادداشت‌ها
  const handleNotesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newNotes = e.target.value;
    setNotes(newNotes);
    // تغییرات یادداشت را بلافاصله به والد اطلاع می‌دهد
    onUpdate(item, currentQuantity, newNotes);
  };
  
  const formatPrice = (price: number) => new Intl.NumberFormat('fa-IR').format(price) + " تومان";

  return (
    <Card className={cn("transition-all duration-300", currentQuantity > 0 && "ring-2 ring-primary")}>
      <CardContent className="p-3">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="font-semibold text-foreground leading-tight mb-1">{item.name}</h3>
            <div className="flex items-center gap-2 mb-2">
              <span className="font-bold text-primary text-fluid-base">{formatPrice(item.price)}</span>
              {item.is_100_arabica && (
                <Badge variant="secondary" className="bg-accent/20 text-accent-foreground text-xs">
                  <Leaf className="w-3 h-3 mr-1" />
                  100% عربیکا
                </Badge>
              )}
            </div>
          </div>
          <Coffee className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-1" />
        </div>

        {/* Quantity Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuantityChange(-1)}
              disabled={currentQuantity <= 0}
              className="w-8 h-8 p-0 rounded-full"
            >
              <Minus className="w-3 h-3" />
            </Button>
            <span className="w-8 text-center font-bold text-lg">{currentQuantity}</span>
            <Button
              variant="default"
              size="sm"
              onClick={() => handleQuantityChange(1)}
              className="w-8 h-8 p-0 rounded-full bg-gradient-to-r from-primary to-primary-glow"
            >
              <Plus className="w-3 h-3" />
            </Button>
          </div>
          {currentQuantity > 0 && (
            <div className="text-sm font-medium text-primary">{formatPrice(item.price * currentQuantity)}</div>
          )}
        </div>
        
        {/* Notes Input */}
        {currentQuantity > 0 && (
          <div className="mt-3 pt-3 border-t border-border">
            <Input
              type="text"
              placeholder="توضیحات سفارش..."
              value={notes}
              onChange={handleNotesChange}
              className="w-full p-2 text-sm bg-background/50"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MenuItem;
