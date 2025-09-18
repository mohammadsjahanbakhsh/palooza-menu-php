import { useState, useEffect } from "react";
import { Table, MenuItem as MenuItemType, OrderItem, MenuCategory, User, TableStatus } from "@/types/cafe";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Coffee, ShoppingCart, Trash2, User as UserIcon, X, Loader2, Plus, Minus, Leaf } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

// --- MenuItem Component ---

interface MenuItemProps {
  item: MenuItemType;
  orderItem: OrderItem | undefined;
  onUpdate: (menuItem: MenuItemType, quantity: number, notes: string) => void;
}

const MenuItem = ({ item, orderItem, onUpdate }: MenuItemProps) => {
  const currentQuantity = orderItem?.quantity || 0;
  const [notes, setNotes] = useState(orderItem?.notes || "");

  useEffect(() => {
    setNotes(orderItem?.notes || "");
  }, [orderItem?.notes]);

  const handleQuantityChange = (amount: number) => {
    const newQuantity = currentQuantity + amount;
    if (newQuantity < 0) return;
    onUpdate(item, newQuantity, notes);
  };

  const handleNotesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newNotes = e.target.value;
    setNotes(newNotes);
    onUpdate(item, currentQuantity, newNotes);
  };

  const formatPrice = (price: number) => new Intl.NumberFormat('fa-IR').format(price) + " تومان";

  return (
    <Card className={cn("transition-all duration-300", currentQuantity > 0 && "ring-2 ring-primary")}>
      <CardContent className="p-3">
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

// --- OrderModal Component ---

interface ApiOrderItem {
  id: number;
  item_id: string;
  item_name: string;
  price: string;
  quantity: number;
  notes?: string;
}

interface OrderModalProps {
  table: Table | null;
  open: boolean;
  onClose: () => void;
  onDataRefresh: () => void;
  currentUser: User | null;
}

const OrderModal = ({ table, open, onClose, onDataRefresh, currentUser }: OrderModalProps) => {
  const [menuCategories, setMenuCategories] = useState<MenuCategory[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItemType[]>([]);
  const [currentOrder, setCurrentOrder] = useState<OrderItem[]>([]);
  const [customerPhone, setCustomerPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const loadInitialData = async () => {
      if (!open || !table) return;
      setIsLoading(true);
      try {
        const menuResponse = await fetch('/api/get_menu_data.php', { credentials: 'include' });
        const menuData: { categories: MenuCategory[], items: MenuItemType[] } = await menuResponse.json();
        setMenuCategories(menuData.categories);
        setMenuItems(menuData.items);

        if (table.status === 'serving' && table.currentOrder) {
          const orderResponse = await fetch(`/api/get_order_by_factor.php?factor_id=${table.currentOrder.id}`, { credentials: 'include' });
          const orderData = await orderResponse.json();
          if (orderData && orderData.items) {
            const formattedItems = orderData.items.map((item: ApiOrderItem) => {
              const menuItem = menuData.items.find(mi => mi.id.toString() === item.item_id.toString());
              if (!menuItem) return null;
              return {
                id: item.id.toString(),
                menuItem,
                quantity: item.quantity,
                notes: item.notes || ''
              };
            }).filter(Boolean) as OrderItem[];
            setCurrentOrder(formattedItems);
          }
        } else {
          setCurrentOrder([]);
        }
      } catch (error) {
        console.error("Failed to load modal data:", error);
        toast({ title: "خطا", description: "دریافت اطلاعات منو ناموفق بود.", variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    };
    loadInitialData();
  }, [open, table, toast]);

  const handleUpdateOrder = (menuItem: MenuItemType, quantity: number, notes: string) => {
    setCurrentOrder(prev => {
        const existingIndex = prev.findIndex(item => item.menuItem.id === menuItem.id);
        
        if (existingIndex >= 0) {
            const updated = [...prev];
            const existingItem = updated[existingIndex];
            updated[existingIndex] = { ...existingItem, quantity, notes };
            
            if (quantity <= 0) {
                return updated.filter((_, i) => i !== existingIndex);
            }
            return updated;

        } else if (quantity > 0) {
            const newOrderItem: OrderItem = {
                id: crypto.randomUUID(),
                menuItem,
                quantity,
                notes,
            };
            return [...prev, newOrderItem];
        }
        return prev;
    });
  };

  const handleRemoveItem = (itemId: string) => {
    setCurrentOrder(prev => prev.filter(item => item.id !== itemId));
  };

  const calculateTotal = () => currentOrder.reduce((total, item) => total + (item.menuItem.price * item.quantity), 0);
  const formatPrice = (price: number) => new Intl.NumberFormat('fa-IR').format(price) + " تومان";

  const handleApiAction = async (endpoint: string, body: object, successMessage: string) => {
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const result = await response.json();
      if (result.status !== 'success') throw new Error(result.error || 'Server error');
      toast({ title: "موفق", description: successMessage });
      onDataRefresh();
      onClose();
    } catch (error) {
      console.error("API Action Failed:", error);
      toast({ title: "خطا", description: "عملیات ناموفق بود.", variant: "destructive" });
    }
  };
  
  const createOrderPayload = () => ({
    table_id: table?.id,
    factor_id: table?.currentOrder?.id,
    user_id: currentUser?.id,
    customer_phone: customerPhone,
    items: currentOrder.map(item => ({
      id: item.menuItem.id,
      quantity: item.quantity,
      price: item.menuItem.price,
      notes: item.notes,
    })),
  });

  const handleCreateFactor = () => {
    if (currentOrder.length === 0) {
      toast({ title: "سفارش خالی", description: "لطفاً آیتم‌هایی به سفارش اضافه کنید", variant: "destructive" });
      return;
    }
    handleApiAction('/api/create_factor.php', createOrderPayload(), "فاکتور با موفقیت ثبت شد.");
  };

  const handleUpdateFactor = () => {
    if (currentOrder.length === 0) {
      toast({ title: "سفارش خالی", description: "سفارش را نمی‌توان خالی بروزرسانی کرد.", variant: "destructive" });
      return;
    }
    handleApiAction('/api/update_factor.php', createOrderPayload(), "سفارش با موفقیت بروزرسانی شد.");
  };
  
  const handleUpdateStatus = (newStatus: TableStatus) => {
    if (!table) return;
    handleApiAction('/api/update_table_status.php', { id: table.id, status: newStatus }, `وضعیت میز ${table.name} بروزرسانی شد`);
  };

  if (!table) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-full h-full sm:h-auto max-h-[95vh] bg-background/95 backdrop-blur-sm flex flex-col p-4 sm:p-6">
        <DialogHeader className="pb-4 border-b">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl flex items-center gap-2">
                <Coffee className="w-6 h-6 text-primary" />
                میز {table.name}
              </DialogTitle>
              <DialogDescription className="mt-2">
                سفارش جدید ثبت کنید یا سفارش فعلی را ویرایش نمایید.
              </DialogDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        {isLoading ? (
            <div className="flex-1 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary"/></div>
        ) : (
            <div className="flex flex-col md:flex-row gap-4 flex-1 min-h-0">
              
              {/* Menu Section */}
              <div className="flex-auto md:flex-1 flex flex-col min-h-0">
                  <h3 className="text-lg font-semibold mb-2 flex-shrink-0">منو</h3>
                  <Tabs defaultValue={menuCategories[0]?.id.toString() || '1'} className="flex-1 flex flex-col min-h-0">
                      <ScrollArea className="w-full whitespace-nowrap">
                        <TabsList className="flex-nowrap">
                            {menuCategories.map((category) => (
                            <TabsTrigger key={category.id} value={category.id.toString()} className="px-4 py-2 text-sm flex-shrink-0">
                                {category.name}
                            </TabsTrigger>
                            ))}
                        </TabsList>
                      </ScrollArea>
                      
                      <ScrollArea className="flex-1 mt-2">
                          {menuCategories.map((category) => (
                          <TabsContent key={category.id} value={category.id.toString()} className="m-0">
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-1">
                                  {menuItems.filter(item => item.category_id === category.id).map((item) => (
                                  <MenuItem
                                      key={item.id}
                                      item={item}
                                      orderItem={currentOrder.find(oi => oi.menuItem.id === item.id)}
                                      onUpdate={handleUpdateOrder}
                                  />
                                  ))}
                              </div>
                          </TabsContent>
                          ))}
                      </ScrollArea>
                  </Tabs>
              </div>

              <Separator orientation="vertical" className="hidden md:block" />

              {/* Order Summary Section */}
              <div className="w-full md:w-80 flex-auto md:flex-initial flex flex-col min-h-0 max-h-[50vh] md:max-h-none">
                  <div className="flex-shrink-0">
                      <div className="flex items-center gap-2 mb-2">
                          <ShoppingCart className="w-5 h-5 text-primary" />
                          <h3 className="text-lg font-semibold">سفارش فعلی</h3>
                      </div>
                      <div className="grid gap-2 mb-2">
                          <Label htmlFor="customer-phone">شماره تلفن مشتری (اختیاری)</Label>
                          <Input id="customer-phone" placeholder="مثال: 09123456789" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} />
                      </div>
                  </div>
                  
                  <ScrollArea className="flex-1 min-h-0">
                      {currentOrder.length === 0 ? (
                          <div className="text-center text-muted-foreground py-8 h-full flex flex-col justify-center items-center">
                              <ShoppingCart className="w-10 h-10 mb-2 opacity-30"/>
                              <p>آیتمی انتخاب نشده</p>
                          </div>
                      ) : (
                          <div className="space-y-3 p-1">
                              {currentOrder.map((item) => (
                              <Card key={item.id} className="bg-muted/30">
                                  <CardContent className="p-3 flex justify-between items-start">
                                  <div className="flex-1">
                                      <h4 className="font-medium text-sm">{item.menuItem.name}</h4>
                                      <p className="text-xs text-muted-foreground mt-1">{item.quantity} × {formatPrice(item.menuItem.price)}</p>
                                      {item.notes && <p className="text-xs text-primary mt-1 bg-primary/10 px-2 py-1 rounded">{item.notes}</p>}
                                  </div>
                                  <Button variant="ghost" size="icon" onClick={() => handleRemoveItem(item.id)} className="w-6 h-6 text-destructive hover:text-destructive">
                                      <Trash2 className="w-4 h-4" />
                                  </Button>
                                  </CardContent>
                              </Card>
                              ))}
                          </div>
                      )}
                  </ScrollArea>

                  <div className="flex-shrink-0 pt-2">
                      <Separator className="my-2" />
                      <div className="bg-primary/10 p-3 rounded-lg mb-2">
                          <div className="flex justify-between items-center">
                              <span className="font-semibold">جمع کل:</span>
                              <span className="text-xl font-bold text-primary">{formatPrice(calculateTotal())}</span>
                          </div>
                      </div>
                      <div className="space-y-2">
                         {table.status === 'free' && (
                          <>
                              <Button onClick={handleCreateFactor} className="w-full bg-green-600 hover:bg-green-700 text-white">ثبت سفارش</Button>
                              <Button onClick={() => handleUpdateStatus('reserved')} className="w-full" variant="secondary">رزرو میز</Button>
                          </>
                          )}
                          {table.status === 'serving' && <Button onClick={handleUpdateFactor} className="w-full">بروزرسانی سفارش</Button>}
                          {(table.status === 'paid' || table.status === 'reserved') && <Button onClick={() => handleUpdateStatus('free')} className="w-full">آزادسازی میز</Button>}
                      </div>
                  </div>
              </div>
            </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default OrderModal;

