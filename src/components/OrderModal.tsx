import { useState, useEffect } from "react";
import { Table, TableStatus, MenuItem as MenuItemType, OrderItem, MenuCategory } from "@/types/cafe";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import MenuItem from "./MenuItem";
import { menuCategories, menuItems } from "@/data/mockData";
import { Coffee, ShoppingCart, Trash2, User, Clock, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface OrderModalProps {
  table: Table | null;
  open: boolean;
  onClose: () => void;
  onUpdateTableStatus: (tableId: string, status: TableStatus) => void;
}

const OrderModal = ({ table, open, onClose, onUpdateTableStatus }: OrderModalProps) => {
  const [currentOrder, setCurrentOrder] = useState<OrderItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number>(1);
  const { toast } = useToast();

  useEffect(() => {
    if (table?.currentOrder?.items) {
      setCurrentOrder(table.currentOrder.items);
    } else {
      setCurrentOrder([]);
    }
  }, [table]);

  const handleAddToOrder = (orderItem: OrderItem) => {
    setCurrentOrder(prev => {
      const existingIndex = prev.findIndex(item => 
        item.menuItem.id === orderItem.menuItem.id && item.notes === orderItem.notes
      );
      
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = { ...updated[existingIndex], quantity: orderItem.quantity };
        return orderItem.quantity > 0 ? updated : updated.filter((_, i) => i !== existingIndex);
      } else {
        return orderItem.quantity > 0 ? [...prev, orderItem] : prev;
      }
    });
  };

  const handleRemoveItem = (itemId: string) => {
    setCurrentOrder(prev => prev.filter(item => item.id !== itemId));
  };

  const calculateTotal = () => {
    return currentOrder.reduce((total, item) => total + (item.menuItem.price * item.quantity), 0);
  };

  const handleConfirmOrder = () => {
    if (currentOrder.length === 0) {
      toast({
        title: "سفارش خالی",
        description: "لطفاً آیتم‌هایی به سفارش اضافه کنید",
        variant: "destructive"
      });
      return;
    }

    // Simulate order confirmation
    toast({
      title: "سفارش ثبت شد",
      description: `سفارش میز ${table?.name} با موفقیت ثبت شد`,
    });

    // Update table status to occupied
    if (table && onUpdateTableStatus) {
      onUpdateTableStatus(table.id, 'occupied');
    }

    onClose();
  };

  const handleReserveTable = () => {
    if (table && onUpdateTableStatus) {
      onUpdateTableStatus(table.id, 'reserved');
      toast({
        title: "میز رزرو شد",
        description: `میز ${table.name} با موفقیت رزرو شد`,
      });
      onClose();
    }
  };

  const handleClearTable = () => {
    if (table && onUpdateTableStatus) {
      onUpdateTableStatus(table.id, 'empty');
      toast({
        title: "میز آزاد شد",
        description: `میز ${table.name} آزاد شد`,
      });
      onClose();
    }
  };

  const getFilteredMenuItems = (categoryId: number) => {
    return menuItems.filter(item => item.category_id === categoryId);
  };

  const formatPrice = (price: number) => {
    return (price / 1000).toLocaleString() + " تومان";
  };

  if (!table) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] bg-background/95 backdrop-blur-sm">
        <DialogHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl flex items-center gap-2">
                <Coffee className="w-6 h-6 text-primary" />
                میز {table.name}
              </DialogTitle>
              <DialogDescription className="flex items-center gap-4 mt-2">
                <span className="flex items-center gap-1">
                  <User className="w-4 h-4" />
                  ظرفیت {table.capacity} نفر
                </span>
                <Badge variant={
                  table.status === 'empty' ? 'default' :
                  table.status === 'occupied' ? 'destructive' :
                  table.status === 'reserved' ? 'secondary' : 'outline'
                }>
                  {table.status === 'empty' && 'خالی'}
                  {table.status === 'occupied' && 'اشغال'}
                  {table.status === 'reserved' && 'رزرو'}
                  {table.status === 'paid' && 'تسویه شده'}
                </Badge>
              </DialogDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="flex gap-6 flex-1 min-h-0">
          {/* Menu Section */}
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-4">منو</h3>
            
            <Tabs value={selectedCategory.toString()} onValueChange={(value) => setSelectedCategory(Number(value))}>
              <ScrollArea className="w-full whitespace-nowrap">
                <TabsList className="grid w-full grid-cols-6 lg:grid-cols-8">
                  {menuCategories.slice(0, 8).map((category) => (
                    <TabsTrigger 
                      key={category.id} 
                      value={category.id.toString()}
                      className="text-xs px-2"
                    >
                      {category.name.split(' ')[0]}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </ScrollArea>
              
              {menuCategories.map((category) => (
                <TabsContent key={category.id} value={category.id.toString()}>
                  <ScrollArea className="h-96">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-1">
                      {getFilteredMenuItems(category.id).map((item) => (
                        <MenuItem
                          key={item.id}
                          item={item}
                          onAddToOrder={handleAddToOrder}
                          currentQuantity={
                            currentOrder.find(orderItem => orderItem.menuItem.id === item.id)?.quantity || 0
                          }
                        />
                      ))}
                    </div>
                  </ScrollArea>
                </TabsContent>
              ))}
            </Tabs>
          </div>

          <Separator orientation="vertical" className="mx-2" />

          {/* Order Summary */}
          <div className="w-80 flex flex-col">
            <div className="flex items-center gap-2 mb-4">
              <ShoppingCart className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold">سفارش فعلی</h3>
            </div>

            <ScrollArea className="flex-1 max-h-96">
              {currentOrder.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  <ShoppingCart className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>آیتمی انتخاب نشده</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {currentOrder.map((item) => (
                    <Card key={item.id} className="bg-muted/30">
                      <CardContent className="p-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-sm leading-tight">
                              {item.menuItem.name}
                            </h4>
                            <p className="text-xs text-muted-foreground mt-1">
                              {item.quantity} × {formatPrice(item.menuItem.price)}
                            </p>
                            {item.notes && (
                              <p className="text-xs text-primary mt-1 bg-primary/10 px-2 py-1 rounded">
                                {item.notes}
                              </p>
                            )}
                          </div>
                          <div className="text-left ml-2">
                            <p className="font-bold text-sm">
                              {formatPrice(item.menuItem.price * item.quantity)}
                            </p>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveItem(item.id)}
                              className="w-6 h-6 p-0 mt-1 text-destructive hover:text-destructive"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </ScrollArea>

            <Separator className="my-4" />

            {/* Total */}
            <div className="bg-primary/10 p-4 rounded-lg mb-4">
              <div className="flex justify-between items-center">
                <span className="font-semibold">جمع کل:</span>
                <span className="text-xl font-bold text-primary">
                  {formatPrice(calculateTotal())}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2">
              {table.status === 'empty' && (
                <>
                  <Button onClick={handleConfirmOrder} className="w-full" variant="default">
                    ثبت سفارش
                  </Button>
                  <Button onClick={handleReserveTable} className="w-full" variant="secondary">
                    رزرو میز
                  </Button>
                </>
              )}
              
              {table.status === 'occupied' && (
                <Button onClick={handleConfirmOrder} className="w-full" variant="default">
                  بروزرسانی سفارش
                </Button>
              )}
              
              {(table.status === 'paid' || table.status === 'reserved') && (
                <Button onClick={handleClearTable} className="w-full" variant="table">
                  آزادسازی میز
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OrderModal;