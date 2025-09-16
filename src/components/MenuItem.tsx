import { useState } from "react";
import { MenuItem as MenuItemType, OrderItem } from "@/types/cafe";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Minus, Coffee, Leaf } from "lucide-react";
import { cn } from "@/lib/utils";

interface MenuItemProps {
  item: MenuItemType;
  onAddToOrder: (orderItem: OrderItem) => void;
  currentQuantity?: number;
  className?: string;
}

const MenuItem = ({ item, onAddToOrder, currentQuantity = 0, className }: MenuItemProps) => {
  const [quantity, setQuantity] = useState(currentQuantity);
  const [notes, setNotes] = useState("");

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity < 0) return;
    setQuantity(newQuantity);
    
    if (newQuantity > 0) {
      onAddToOrder({
        id: `${item.id}-${Date.now()}`,
        menuItem: item,
        quantity: newQuantity,
        notes,
      });
    }
  };

  const formatPrice = (price: number) => {
    return (price / 1000).toLocaleString() + " تومان";
  };

  return (
    <Card className={cn("hover:shadow-soft transition-all duration-300 border-0 bg-card/60 backdrop-blur-sm", className)}>
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="font-semibold text-foreground leading-tight mb-1">
              {item.name}
            </h3>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg font-bold text-primary">
                {formatPrice(item.price)}
              </span>
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
              onClick={() => handleQuantityChange(quantity - 1)}
              disabled={quantity <= 0}
              className="w-8 h-8 p-0 rounded-full"
            >
              <Minus className="w-3 h-3" />
            </Button>
            
            <span className="w-8 text-center font-medium">
              {quantity}
            </span>
            
            <Button
              variant="default"
              size="sm"
              onClick={() => handleQuantityChange(quantity + 1)}
              className="w-8 h-8 p-0 rounded-full bg-gradient-to-r from-primary to-primary-glow"
            >
              <Plus className="w-3 h-3" />
            </Button>
          </div>
          
          {quantity > 0 && (
            <div className="text-sm font-medium text-primary">
              {formatPrice(item.price * quantity)}
            </div>
          )}
        </div>
        
        {/* Notes Input (when quantity > 0) */}
        {quantity > 0 && (
          <div className="mt-3 pt-3 border-t border-border">
            <input
              type="text"
              placeholder="توضیحات سفارش..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-2 text-sm bg-background/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MenuItem;