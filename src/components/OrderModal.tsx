import { useState, useEffect } from "react";
import { Table, MenuItem as MenuItemType, OrderItem, MenuCategory, User, TableStatus } from "@/types/cafe";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Coffee, ShoppingCart, Trash2, User as UserIcon, X, Loader2, Plus, Minus, Leaf, MoveRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";


// --- MenuItem Component (No Changes) ---
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
            <Button variant="outline" size="sm" onClick={() => handleQuantityChange(-1)} disabled={currentQuantity <= 0} className="w-8 h-8 p-0 rounded-full">
              <Minus className="w-3 h-3" />
            </Button>
            <span className="w-8 text-center font-bold text-lg">{currentQuantity}</span>
            <Button variant="default" size="sm" onClick={() => handleQuantityChange(1)} className="w-8 h-8 p-0 rounded-full bg-gradient-to-r from-primary to-primary-glow">
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


// --- TransferOrderModal Component (New) ---
interface TransferOrderModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentTableId: number;
    factorId: number;
    onTransferSuccess: () => void;
}
const TransferOrderModal = ({ isOpen, onClose, currentTableId, factorId, onTransferSuccess }: TransferOrderModalProps) => {
    const [freeTables, setFreeTables] = useState<{ id: number; name: string }[]>([]);
    const [selectedTable, setSelectedTable] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        if (!isOpen) return;
        const fetchFreeTables = async () => {
            setIsLoading(true);
            try {
                const response = await fetch('/api/get_free_tables.php');
                const result = await response.json();
                if (result.status === 'success') {
                    setFreeTables(result.data);
                } else {
                    toast({ title: "خطا", description: result.message, variant: "destructive" });
                }
            } catch (error) {
                toast({ title: "خطا", description: "دریافت لیست میزهای آزاد ناموفق بود.", variant: "destructive" });
            } finally {
                setIsLoading(false);
            }
        };
        fetchFreeTables();
    }, [isOpen, toast]);

    const handleTransfer = async () => {
        if (!selectedTable) {
            toast({ title: "خطا", description: "لطفا یک میز مقصد انتخاب کنید.", variant: "destructive" });
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch('/api/transfer_order.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    factor_id: factorId,
                    source_table_id: currentTableId,
                    destination_table_id: parseInt(selectedTable, 10),
                }),
            });
            const result = await response.json();
            if (result.status === 'success') {
                toast({ title: "موفق", description: "سفارش با موفقیت منتقل شد." });
                onTransferSuccess();
            } else {
                throw new Error(result.message);
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "عملیات انتقال ناموفق بود.";
            toast({ title: "خطا", description: errorMessage, variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>انتقال سفارش</DialogTitle>
                    <DialogDescription>
                        لطفا میز مقصد را برای انتقال این سفارش انتخاب کنید.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-4">
                    {isLoading && <Loader2 className="w-6 h-6 animate-spin mx-auto" />}
                    {!isLoading && freeTables.length > 0 && (
                        <div>
                            <Label htmlFor="destination-table">میزهای آزاد</Label>
                             <Select onValueChange={setSelectedTable} value={selectedTable}>
                                <SelectTrigger id="destination-table">
                                    <SelectValue placeholder="یک میز انتخاب کنید..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {freeTables.map(table => (
                                        <SelectItem key={table.id} value={table.id.toString()}>میز {table.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}
                     {!isLoading && freeTables.length === 0 && (
                         <p className="text-center text-muted-foreground">در حال حاضر میز آزادی برای انتقال وجود ندارد.</p>
                     )}
                </div>
                <div className="flex justify-end gap-2">
                    <Button variant="ghost" onClick={onClose}>انصراف</Button>
                    <Button onClick={handleTransfer} disabled={isLoading || !selectedTable}>
                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "تایید انتقال"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

// --- PersianClock Component (Enhanced) ---
const PersianClock = () => {
    const [currentTime, setCurrentTime] = useState('');
  
    useEffect(() => {
      const timer = setInterval(() => {
        const now = new Date();
        const formattedTime = new Intl.DateTimeFormat('fa-IR-u-ca-persian', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          weekday: 'long',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false
        }).format(now);
        setCurrentTime(formattedTime);
      }, 1000); // Update every second
  
      return () => clearInterval(timer);
    }, []);
  
    return (
      <div className="text-sm text-orange-500 font-semibold text-left whitespace-nowrap">
        {currentTime}
      </div>
    );
};


// --- OrderModal Component (Main) ---
interface ApiOrderItem {
  id: number;
  menu_item_id: string;
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
  const [customerName, setCustomerName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentFactorId, setCurrentFactorId] = useState<number | null>(null);
  const [reservationTime, setReservationTime] = useState('');
  const [minDateTime, setMinDateTime] = useState('');
  const [selectedShamsiDate, setSelectedShamsiDate] = useState('');
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const { toast } = useToast();

    useEffect(() => {
        const loadInitialData = async () => {
        if (!open || !table) return;
        setIsLoading(true);
        
        try {
            const menuResponse = await fetch('/api/get_menu_data.php', { credentials: 'include' });
            const menuData = await menuResponse.json();
            setMenuCategories(menuData.categories);
            setMenuItems(menuData.items);

            if (table.status === 'serving' || table.status === 'paid') {
            const orderResponse = await fetch(`/api/get_last_order.php?table_id=${table.id}`, { credentials: 'include' });
            const orderResult = await orderResponse.json();
            
            if (orderResult.status === 'success' && orderResult.data) {
                const orderData = orderResult.data;
                setCustomerName(orderData.customer_name || '');
                setCustomerPhone(orderData.customer_phone || '');
                setCurrentFactorId(orderData.id);

                const formattedItems = orderData.items.map((item: ApiOrderItem) => {
                const menuItem = menuData.items.find((mi: MenuItemType) => mi.id.toString() === item.menu_item_id.toString());
                if (!menuItem) return null;
                return { id: item.id.toString(), menuItem, quantity: item.quantity, notes: item.notes || '' };
                }).filter(Boolean) as OrderItem[];
                setCurrentOrder(formattedItems);
            } else {
                setCurrentOrder([]); setCustomerName(''); setCustomerPhone(''); setCurrentFactorId(null);
            }
            } else {
            setCurrentOrder([]); setCustomerName(''); setCustomerPhone(''); setCurrentFactorId(null);
            }
        } catch (error) {
            console.error("Failed to load modal data:", error);
            toast({ title: "خطا", description: "دریافت اطلاعات ناموفق بود.", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
        };

        if (table?.status === 'free') {
            const now = new Date();
            // Add 30 minutes to the current time for the minimum reservation time
            now.setMinutes(now.getMinutes() + 30);
            const offset = now.getTimezoneOffset() * 60000;
            const localISOTime = new Date(now - offset).toISOString().slice(0, 16);
            setMinDateTime(localISOTime);
        }

        loadInitialData();
    }, [open, table, toast]);

    useEffect(() => {
        if (reservationTime) {
            try {
                const date = new Date(reservationTime);
                const formattedDate = new Intl.DateTimeFormat('fa-IR-u-ca-persian', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false
                }).format(date);
                setSelectedShamsiDate(formattedDate);
            } catch (e) {
                setSelectedShamsiDate('');
            }
        } else {
            setSelectedShamsiDate('');
        }
    }, [reservationTime]);

    const handleUpdateOrder = (menuItem: MenuItemType, quantity: number, notes: string) => {
        setCurrentOrder(prev => {
            const existingIndex = prev.findIndex(item => item.menuItem.id === menuItem.id);
            if (existingIndex >= 0) {
                const updated = [...prev];
                updated[existingIndex] = { ...updated[existingIndex], quantity, notes };
                return quantity <= 0 ? updated.filter((_, i) => i !== existingIndex) : updated;
            } else if (quantity > 0) {
                return [...prev, { id: crypto.randomUUID(), menuItem, quantity, notes }];
            }
            return prev;
        });
    };

    const handleRemoveItem = (itemId: string) => setCurrentOrder(prev => prev.filter(item => item.id !== itemId));
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
        if (result.status !== 'success') throw new Error(result.message || result.error || 'Server error');
        toast({ title: "موفق", description: successMessage });
        onDataRefresh();
        onClose();
        } catch (error) {
        console.error("API Action Failed:", error);
        const errorMessage = error instanceof Error ? error.message : "عملیات ناموفق بود.";
        toast({ title: "خطا", description: errorMessage, variant: "destructive" });
        }
    };
  
    const createOrderPayload = () => ({
        table_id: table?.id,
        factor_id: currentFactorId,
        system_user_id: currentUser?.id,
        customer_phone: customerPhone,
        customer_name: customerName,
        items: currentOrder.map(item => ({ id: item.menuItem.id, quantity: item.quantity, price: item.menuItem.price, notes: item.notes })),
    });

    const handleCreateFactor = () => {
        if (!customerName.trim()) return toast({ title: "خطا", description: "لطفاً نام مشتری را وارد کنید.", variant: "destructive" });
        if (currentOrder.length === 0) return toast({ title: "خطا", description: "لطفاً آیتم‌هایی به سفارش اضافه کنید", variant: "destructive" });
        if (!currentUser?.id) return toast({ title: "خطا", description: "کاربر شناسایی نشد.", variant: "destructive" });
        handleApiAction('/api/create_factor.php', createOrderPayload(), "فاکتور با موفقیت ثبت شد.");
    };

    const handleUpdateFactor = () => {
        if (!currentFactorId) return toast({ title: "خطا", description: "شناسه فاکتور برای بروزرسانی یافت نشد.", variant: "destructive" });
        if (!customerName.trim()) return toast({ title: "خطا", description: "لطفاً نام مشتری را وارد کنید.", variant: "destructive" });
        if (!currentUser?.id) return toast({ title: "خطا", description: "کاربر شناسایی نشد.", variant: "destructive" });
        handleApiAction('/api/update_factor.php', createOrderPayload(), "سفارش با موفقیت بروزرسانی شد.");
    };
  
    const handleUpdateStatus = (newStatus: TableStatus) => {
        if (!table) return;
        if (newStatus === 'paid') {
            if (!currentFactorId) return toast({ title: "خطا", description: "فاکتوری برای تسویه یافت نشد.", variant: "destructive"});
            handleApiAction('/api/update_statuses.php', { factor_id: currentFactorId, table_id: table.id, factor_status: 'paid', table_status: 'paid' }, `سفارش تسویه شد.`);
        } else {
            handleApiAction('/api/update_table_status.php', { id: table.id, status: newStatus }, `وضعیت میز بروزرسانی شد.`);
        }
    };

    const handleScheduleReservation = () => {
        if (!table) return;
        if (!reservationTime) return toast({ title: "خطا", description: "لطفا زمان رزرو را انتخاب کنید.", variant: "destructive" });
        if (new Date(reservationTime) <= new Date()) {
            return toast({ title: "خطا", description: "زمان رزرو باید در آینده باشد.", variant: "destructive" });
        }
        handleApiAction('/api/schedule_reservation.php', { table_id: table.id, reservation_time: reservationTime }, 'میز با موفقیت رزرو شد.');
    };

    const handleTransferSuccess = () => {
        setIsTransferModalOpen(false);
        onDataRefresh();
        onClose();
    };

  if (!table) return null;

  return (
    <>
        <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl w-full h-full sm:h-auto max-h-[96vh] bg-background/95 backdrop-blur-sm flex flex-col p-1 sm:p-4">
            <DialogHeader className="pb-2 border-b">
            <div className="flex items-center justify-between w-full gap-4">
                <DialogTitle className="text-2xl flex items-center gap-2">
                    <Coffee className="w-9 h-9 text-primary" />
                    میز {table.name}
                </DialogTitle>
                <div className="flex-grow" />
                <PersianClock />
                <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full flex-shrink-0"><X className="w-7 h-7" /></Button>
            </div>
            </DialogHeader>

            {isLoading ? (
                <div className="flex-1 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary"/></div>
            ) : (
                <div className="flex flex-col md:flex-row gap-4 flex-1 min-h-0">
                
                {/* Left Column: Menu Section */}
                <div className="md:w-2/3 flex flex-col min-h-0 min-w-0">
                    <Tabs defaultValue={menuCategories[0]?.id.toString() || '1'} className="flex-1 flex flex-col min-h-0">
                        <div className="w-full overflow-x-auto">
                            <TabsList className="inline-flex">
                                {menuCategories.map((category) => (
                                <TabsTrigger key={category.id} value={category.id.toString()} className="px-4 py-2 text-sm flex-shrink-0">{category.name}</TabsTrigger>
                                ))}
                            </TabsList>
                        </div>
                        <ScrollArea className="flex-1 mt-2">
                            {menuCategories.map((category) => (
                            <TabsContent key={category.id} value={category.id.toString()} className="m-0">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-1">
                                    {menuItems.filter(item => item.category_id === category.id).map((item) => (
                                    <MenuItem key={item.id} item={item} orderItem={currentOrder.find(oi => oi.menuItem.id === item.id)} onUpdate={handleUpdateOrder}/>
                                    ))}
                                </div>
                            </TabsContent>
                            ))}
                        </ScrollArea>
                    </Tabs>
                </div>

                <Separator orientation="vertical" className="hidden md:block" />

                {/* Right Column: Order Summary & Actions */}
                <div className="w-full md:w-1/3 flex flex-col min-h-0">
                    <ScrollArea className="flex-1">
                        <div className="p-1 space-y-4">
                            <div className="grid gap-2">
                                <Input id="customer-name" placeholder="نام مشتری" value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
                                <Input id="customer-phone" placeholder="شماره تلفن مشتری (اختیاری)" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} />
                            </div>
                            
                            {currentOrder.length === 0 && table.status !== 'free' && table.status !== 'reserved' &&
                                <div className="text-center text-muted-foreground py-8 h-full flex flex-col justify-center items-center"><p>سفارش فعالی برای این میز وجود ندارد.</p></div>
                            }
                            {currentOrder.length === 0 && (table.status === 'free' || table.status === 'reserved') &&
                                <div className="text-center text-muted-foreground py-8 h-full flex flex-col justify-center items-center"><ShoppingCart className="w-10 h-10 mb-2 opacity-30"/><p>آیتمی انتخاب نشده</p></div>
                            }
                            {currentOrder.length > 0 &&
                                <div className="space-y-3">
                                    {currentOrder.map((item) => (
                                    <Card key={item.id} className="bg-muted/30">
                                        <CardContent className="p-3 flex justify-between items-start">
                                        <div className="flex-1"><h4 className="font-medium text-sm">{item.menuItem.name}</h4><p className="text-xs text-muted-foreground mt-1">{item.quantity} × {formatPrice(item.menuItem.price)}</p>{item.notes && <p className="text-xs text-primary mt-1 bg-primary/10 px-2 py-1 rounded">{item.notes}</p>}</div>
                                        <Button variant="ghost" size="icon" onClick={() => handleRemoveItem(item.id)} className="w-6 h-6 text-destructive hover:text-destructive"><Trash2 className="w-4 h-4" /></Button>
                                        </CardContent>
                                    </Card>
                                    ))}
                                </div>
                            }
                            
                            {currentOrder.length > 0 && <>
                                <Separator/>
                                <div className="bg-primary/10 p-3 rounded-lg">
                                    <div className="flex justify-between items-center"><span className="font-semibold">جمع کل:</span><span className="text-xl font-bold text-primary">{formatPrice(calculateTotal())}</span></div>
                                </div>
                            </>}

                            <div className="space-y-2">
                                {table.status === 'free' && (
                                <div className="p-2 border rounded-lg space-y-3">
                                    <h4 className="text-sm font-semibold text-center">عملیات میز آزاد</h4>
                                    <Button onClick={handleCreateFactor} className="w-full bg-green-600 hover:bg-green-700 text-white">ثبت سفارش جدید</Button>
                                    <Separator />
                                    <Label htmlFor="reservation-time">رزرو برای آینده</Label>
                                    <Input 
                                        id="reservation-time" 
                                        type="datetime-local" 
                                        value={reservationTime} 
                                        min={minDateTime}
                                        onChange={(e) => setReservationTime(e.target.value)} 
                                    />
                                    {selectedShamsiDate && (
                                        <div className="text-center text-xs text-primary pt-1">
                                            {selectedShamsiDate}
                                        </div>
                                    )}
                                    <Button onClick={handleScheduleReservation} className="w-full" variant="secondary">ثبت رزرو</Button>
                                </div>
                                )}
                                {table.status === 'serving' && (
                                <div className="p-2 border rounded-lg space-y-2">
                                    <h4 className="text-sm font-semibold text-center">عملیات میز در حال سرویس</h4>
                                    <Button onClick={handleUpdateFactor} className="w-full">بروزرسانی سفارش</Button>
                                    <Button onClick={() => handleUpdateStatus('paid')} className="w-full bg-blue-600 hover:bg-blue-700 text-white">تسویه حساب</Button>
                                    <Button variant="outline" className="w-full" onClick={() => setIsTransferModalOpen(true)} disabled={!currentFactorId}>
                                        <MoveRight className="w-4 h-4 ml-2" />
                                        انتقال سفارش
                                    </Button>
                                </div>
                                )}
                                {table.status === 'reserved' && (
                                <div className="p-2 border rounded-lg space-y-2">
                                    <h4 className="text-sm font-semibold text-center">عملیات میز رزرو شده</h4>
                                    <Button onClick={handleCreateFactor} className="w-full bg-green-600 hover:bg-green-700 text-white">گرفتن سفارش</Button>
                                    <Button onClick={() => handleUpdateStatus('free')} className="w-full" variant="destructive">کنسل کردن رزرو</Button>
                                </div>
                                )}
                                {table.status === 'paid' && (
                                    <div className="p-2 border rounded-lg space-y-2">
                                        <h4 className="text-sm font-semibold text-center">عملیات میز تسویه شده</h4>
                                        <Button onClick={() => handleUpdateStatus('free')} className="w-full">آزادسازی میز</Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </ScrollArea>
                </div>
                </div>
            )}
        </DialogContent>
        </Dialog>
        {table && currentFactorId && 
            <TransferOrderModal 
                isOpen={isTransferModalOpen}
                onClose={() => setIsTransferModalOpen(false)}
                currentTableId={parseInt(table.id, 10)}
                factorId={currentFactorId}
                onTransferSuccess={handleTransferSuccess}
            />
        }
    </>
  );
};

export default OrderModal;

