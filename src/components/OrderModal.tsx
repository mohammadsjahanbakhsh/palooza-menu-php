import { useState, useEffect } from "react";
// ✅ ۱. وارد کردن تایپ User برای رفع خطای Cannot find name 'User'
import { Table, MenuItem as MenuItemType, OrderItem, MenuCategory, User } from "@/types/cafe";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import MenuItem from "./MenuItem";
import { Coffee, ShoppingCart, Trash2, User as UserIcon, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";


// ✅ ۲. تعریف دقیق TableStatus مطابق با مقادیر دیتابیس
type TableStatus = 'free' | 'reserved' | 'serving' | 'paid';

// ✅ ۳. تعریف یک اینترفیس برای آیتم‌های سفارش که از API می‌آید
interface ApiOrderItem {
  id: number;
  item_id: number;
  item_name: string;
  price: string; // قیمت معمولاً به صورت string از API می‌آید
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
      if (open && table) { // اطمینان از وجود table
        setIsLoading(true);
        try {
          const menuResponse = await fetch('/api/get_menu_data.php', {
  credentials: 'include' // This line tells the browser to send the login cookie
});
          const menuData = await menuResponse.json();
          setMenuCategories(menuData.categories);
          setMenuItems(menuData.items);

          // ✅ مقایسه 'serving' حالا بدون خطا کار می‌کند
          if (table.status === 'serving') {
            const orderResponse = await fetch(`/api/get_order_by_table.php?table_id=${table.id}`, {
  credentials: 'include' // This line tells the browser to send the login cookie
});
            const orderData = await orderResponse.json();
            if (orderData && orderData.items) {
              // ✅ تعریف تایپ برای item برای رفع خطای implicit 'any'
              const formattedItems = orderData.items.map((item: ApiOrderItem) => ({
                  id: item.id.toString(),
                  menuItem: { id: item.item_id, name: item.item_name, price: parseFloat(item.price) },
                  quantity: item.quantity,
                  notes: item.notes || ''
              }));
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
      }
    };
    loadInitialData();
  }, [open, table, toast]);

  // ... (توابع handleAddToOrder, handleRemoveItem, calculateTotal بدون تغییر)
  const handleAddToOrder = (orderItem: OrderItem) => { setCurrentOrder(prev => { const existingIndex = prev.findIndex(item => item.menuItem.id === orderItem.menuItem.id && item.notes === orderItem.notes); if (existingIndex >= 0) { const updated = [...prev]; updated[existingIndex] = { ...updated[existingIndex], quantity: orderItem.quantity }; return orderItem.quantity > 0 ? updated : updated.filter((_, i) => i !== existingIndex); } else { return orderItem.quantity > 0 ? [...prev, orderItem] : prev; } }); };
  const handleRemoveItem = (itemId: string) => { setCurrentOrder(prev => prev.filter(item => item.id !== itemId)); };
  const calculateTotal = () => { return currentOrder.reduce((total, item) => total + (item.menuItem.price * item.quantity), 0); };
  const formatPrice = (price: number) => { return new Intl.NumberFormat('fa-IR').format(price) + " تومان"; };


  const handleCreateFactor = async () => {
    if (currentOrder.length === 0) {
      toast({ title: "سفارش خالی", description: "لطفاً آیتم‌هایی به سفارش اضافه کنید", variant: "destructive" });
      return;
    }
    try {
      const response = await fetch('/api/create_factor.php', {
  credentials: 'include' ,// This line tells the browser to send the login cookie
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          table_id: table?.id,
          user_id: currentUser?.id,
          useer_id_phone: customerPhone,
          items: currentOrder.map(item => ({
            id: item.menuItem.id,
            quantity: item.quantity,
            price: item.menuItem.price,
            notes: item.notes
          }))
        })
      });
      const result = await response.json();
      if (result.status !== 'success') throw new Error(result.error || 'Server error');
      toast({ title: "موفق", description: "فاکتور با موفقیت ثبت شد." });
      onDataRefresh();
      onClose();
    } catch(error) {
      console.error("Failed to confirm order:", error);
      toast({ title: "خطا", description: "ثبت فاکتور ناموفق بود.", variant: "destructive" });
    }
  };
  
  const handleUpdateStatus = async (newStatus: TableStatus) => {
    if (!table) return;
    try {
        const response = await fetch('/api/update_table_status.php', {
  credentials: 'include' ,// This line tells the browser to send the login cookie

            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: table.id, status: newStatus })
        });
        if (!response.ok) throw new Error(`Failed to set status to ${newStatus}`);
        toast({ title: "موفق", description: `وضعیت میز ${table.name} بروزرسانی شد` });
        onDataRefresh();
        onClose();
    } catch (error) {
        toast({ title: "خطا", description: "بروزرسانی وضعیت میز ناموفق بود", variant: "destructive" });
    }
  };


  if (!table) return null;

  // ✅ ۴. محتوای کامل JSX که خواسته بودید
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
                  <UserIcon className="w-4 h-4" />
                  ظرفیت {table.capacity} نفر
                </span>
                <Badge>
                  {
                    {
                      'free': 'خالی',
                      'reserved': 'رزرو',
                      'serving': 'در حال سرویس',
                      'paid': 'تسویه شده'
                    }[table.status]
                  }
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
            <Tabs defaultValue={menuCategories[0]?.id.toString() || '1'}>
              <ScrollArea className="w-full whitespace-nowrap">
                <TabsList>
                  {menuCategories.map((category) => (
                    <TabsTrigger key={category.id} value={category.id.toString()}>
                      {category.name}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </ScrollArea>
              {menuCategories.map((category) => (
                <TabsContent key={category.id} value={category.id.toString()}>
                  <ScrollArea className="h-96">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-1">
                      {menuItems.filter(item => item.category_id === category.id).map((item) => (
                        <MenuItem
                          key={item.id}
                          item={item}
                          onAddToOrder={handleAddToOrder}
                          currentQuantity={currentOrder.find(orderItem => orderItem.menuItem.id === item.id)?.quantity || 0}
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
            <div className="grid gap-2 mb-4">
              <Label htmlFor="customer-phone">شماره تلفن مشتری (اختیاری)</Label>
              <Input id="customer-phone" placeholder="مثال: 09123456789" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} />
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
                            <h4 className="font-medium text-sm leading-tight">{item.menuItem.name}</h4>
                            <p className="text-xs text-muted-foreground mt-1">{item.quantity} × {formatPrice(item.menuItem.price)}</p>
                            {item.notes && <p className="text-xs text-primary mt-1 bg-primary/10 px-2 py-1 rounded">{item.notes}</p>}
                          </div>
                          <div className="text-left ml-2">
                            <p className="font-bold text-sm">{formatPrice(item.menuItem.price * item.quantity)}</p>
                            <Button variant="ghost" size="sm" onClick={() => handleRemoveItem(item.id)} className="w-6 h-6 p-0 mt-1 text-destructive hover:text-destructive">
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
            <div className="bg-primary/10 p-4 rounded-lg mb-4">
              <div className="flex justify-between items-center">
                <span className="font-semibold">جمع کل:</span>
                <span className="text-xl font-bold text-primary">{formatPrice(calculateTotal())}</span>
              </div>
            </div>
            <div className="space-y-2">
              {table.status === 'free' && (
                <>
                  <Button onClick={handleCreateFactor} className="w-full">ثبت سفارش</Button>
                  <Button onClick={() => handleUpdateStatus('reserved')} className="w-full" variant="secondary">رزرو میز</Button>
                </>
              )}
              {table.status === 'serving' && <Button onClick={()=>{/* TODO: Call Update Order API */}} className="w-full">بروزرسانی سفارش</Button>}
              {(table.status === 'paid' || table.status === 'reserved') && <Button onClick={() => handleUpdateStatus('free')} className="w-full">آزادسازی میز</Button>}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OrderModal;