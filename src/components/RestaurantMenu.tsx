// components/RestaurantMenu.tsx

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowRight, Plus, Minus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Table, User } from "@/types/cafe"; // Assuming you have these types defined

// --- Type Definitions for data from our API ---
interface ApiCategory {
  id: number;
  name: string;
}

interface ApiMenuItem {
  id: number;
  name: string;
  description: string;
  price: number;
  category_id: number;
  image?: string; // Image is a frontend concept for now
}

interface CartItem extends ApiMenuItem {
  quantity: number;
}

interface RestaurantMenuProps {
  table: Table;
  currentUser: User | null;
  onClose: () => void;
  onOrderSuccess: () => void; // Function to refresh the dashboard
}

export const RestaurantMenu = ({ table, currentUser, onClose, onOrderSuccess }: RestaurantMenuProps) => {
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [menuItems, setMenuItems] = useState<ApiMenuItem[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // --- Data Fetching ---
  useEffect(() => {
    const fetchMenuData = async () => {
      try {
        const response = await fetch('/api/get_menu_data.php',{credentials: 'include'});
        if (!response.ok) throw new Error("Server error while fetching menu.");
        
        const data = await response.json();
        setCategories(data.categories);
        setMenuItems(data.items);
      } catch (error) {
        console.error("Failed to fetch menu:", error);
        toast({ title: "خطا", description: "دریافت اطلاعات منو از سرور ناموفق بود.", variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchMenuData();
  }, [toast]);

  // --- Cart Management Functions ---
  const addToCart = (item: ApiMenuItem) => {
    setCart(prev => {
      const existingItem = prev.find(cartItem => cartItem.id === item.id);
      if (existingItem) {
        return prev.map(cartItem =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (itemId: number) => {
    setCart(prev => {
      const existingItem = prev.find(cartItem => cartItem.id === itemId);
      if (existingItem && existingItem.quantity > 1) {
        return prev.map(cartItem =>
          cartItem.id === itemId
            ? { ...cartItem, quantity: cartItem.quantity - 1 }
            : cartItem
        );
      }
      return prev.filter(cartItem => cartItem.id !== itemId);
    });
  };

  // --- Handler for Placing Order ---
  const handlePlaceOrder = async () => {
    if (cart.length === 0) {
      toast({ title: "سبد خرید خالی است", variant: "destructive" });
      return;
    }
    if (!currentUser) {
      toast({ title: "خطا", description: "کاربر مشخص نیست.", variant: "destructive" });
      return;
    }

    try {
      const response = await fetch('/api/create_factor.php', {
        credentials: 'include',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          table_id: table.id,
          user_id: currentUser.id,
          items: cart.map(item => ({ id: item.id, quantity: item.quantity, price: item.price })),
        }),
      });

      const result = await response.json();
      if (result.status !== 'success') {
        throw new Error(result.error || "Failed to place order.");
      }
      
      toast({ title: "موفق", description: "سفارش با موفقیت ثبت شد!" });
      onOrderSuccess(); // Notify the dashboard to refresh
      onClose(); // Close this menu component
    } catch (error) {
      console.error("Order placement error:", error);
      toast({ title: "خطا", description: "ثبت سفارش ناموفق بود.", variant: "destructive" });
    }
  };

  // --- Helper Functions ---
  const getItemQuantity = (itemId: number) => cart.find(cartItem => cartItem.id === itemId)?.quantity || 0;
  const getTotalPrice = () => cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  const formatPrice = (price: number) => new Intl.NumberFormat('fa-IR').format(price) + ' تومان';
  
  // --- Render Logic ---
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>در حال بارگذاری منو...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30 menu-slide-in">
        <div className="container mx-auto p-4 max-w-6xl">
            <div className="flex items-center justify-between mb-6">
                <Button variant="outline" onClick={onClose} className="flex items-center gap-2">
                    <ArrowRight size={16} />
                    بازگشت به میزها
                </Button>
                <div className="text-center">
                    <h1 className="text-2xl md:text-3xl font-bold">منوی رستوران</h1>
                    <p className="text-muted-foreground">میز شماره {table.name} - {table.capacity} نفر</p>
                </div>
                <div className="w-24"></div>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <Tabs defaultValue={categories[0]?.id.toString()} className="w-full">
                        <div className="mb-4">
                            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7 gap-1 h-auto p-1">
                                {categories.map((category) => (
                                    <TabsTrigger
                                        key={category.id}
                                        value={category.id.toString()}
                                        className="text-xs px-1 py-2 whitespace-nowrap overflow-hidden text-ellipsis data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-200 hover:bg-primary/10"
                                    >
                                        <span className="block truncate">{category.name}</span>
                                    </TabsTrigger>
                                ))}
                            </TabsList>
                        </div>
                        {categories.map(category => {
                            const categoryItems = menuItems.filter(item => item.category_id === category.id);
                            return (
                                <TabsContent key={category.id} value={category.id.toString()} className="space-y-4 mt-0">
                                    <div className="grid gap-3 md:gap-4">
                                        {categoryItems.map(item => (
                                            <Card key={item.id} className="group p-3 md:p-4 hover:shadow-xl transition-all duration-300 border-l-4 border-l-primary/20 hover:border-l-primary bg-gradient-to-r from-background to-muted/20 hover:from-primary/5 hover:to-primary/10 hover-scale">
                                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                                                    <div className="flex items-start gap-3 flex-1 min-w-0">
                                                        <div className="text-xl md:text-2xl bg-gradient-to-br from-primary/10 to-primary/5 rounded-full w-10 h-10 md:w-12 md:h-12 flex items-center justify-center flex-shrink-0">
                                                            ☕ {/* You can replace this with a dynamic icon later */}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <h3 className="font-semibold text-base md:text-lg group-hover:text-primary transition-colors duration-200 truncate">{item.name}</h3>
                                                            <p className="text-muted-foreground text-xs md:text-sm mt-1 line-clamp-2 leading-relaxed">{item.description}</p>
                                                            <p className="text-primary font-bold text-sm md:text-lg mt-2">{formatPrice(item.price)}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center justify-end gap-2 flex-shrink-0">
                                                        {getItemQuantity(item.id) > 0 ? (
                                                            <div className="flex items-center gap-2">
                                                                <Button variant="outline" size="sm" onClick={() => removeFromCart(item.id)} className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/20">
                                                                    <Minus size={14} />
                                                                </Button>
                                                                <Badge variant="secondary" className="px-2 py-1 bg-primary text-primary-foreground min-w-[2rem] text-center">{getItemQuantity(item.id)}</Badge>
                                                                <Button variant="outline" size="sm" onClick={() => addToCart(item)} className="h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary hover:border-primary/20">
                                                                    <Plus size={14} />
                                                                </Button>
                                                            </div>
                                                        ) : (
                                                            <Button variant="default" size="sm" onClick={() => addToCart(item)} className="h-8 px-3 text-xs font-medium">
                                                                <Plus size={14} className="ml-1" />
                                                                افزودن
                                                            </Button>
                                                        )}
                                                    </div>
                                                </div>
                                            </Card>
                                        ))}
                                    </div>
                                </TabsContent>
                            );
                        })}
                    </Tabs>
                </div>
                {/* Cart Section */}
                <div className="lg:col-span-1">
                    <Card className="sticky top-4 shadow-2xl">
                        <div className="p-4 border-b">
                            <h3 className="font-bold text-lg">🛒 سبد خرید</h3>
                        </div>
                        <div className="p-4 max-h-[70vh] overflow-y-auto">
                            {cart.length === 0 ? (
                                <div className="text-center py-8">
                                    <p className="text-muted-foreground">سبد خرید شما خالی است</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {cart.map(item => (
                                        <div key={item.id} className="bg-muted/50 rounded-lg p-3">
                                            <div className="flex justify-between items-start">
                                                <p className="font-medium text-sm">{item.name}</p>
                                                <p className="font-bold text-primary text-sm">{formatPrice(item.price * item.quantity)}</p>
                                            </div>
                                            <div className="flex items-center gap-2 justify-between mt-2">
                                                <div className="flex items-center gap-2">
                                                    <Button variant="outline" size="sm" onClick={() => removeFromCart(item.id)} className="h-7 w-7 p-0"><Minus size={12} /></Button>
                                                    <Badge variant="secondary">{item.quantity}</Badge>
                                                    <Button variant="outline" size="sm" onClick={() => addToCart(item)} className="h-7 w-7 p-0"><Plus size={12} /></Button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    <div className="border-t pt-4 mt-4">
                                        <div className="flex justify-between items-center mb-4">
                                            <p className="font-bold text-lg">مجموع کل:</p>
                                            <p className="font-bold text-primary text-xl">{formatPrice(getTotalPrice())}</p>
                                        </div>
                                        <Button onClick={handlePlaceOrder} className="w-full h-12 text-base font-semibold">
                                            🍽️ ثبت سفارش
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    </div>
  );
};