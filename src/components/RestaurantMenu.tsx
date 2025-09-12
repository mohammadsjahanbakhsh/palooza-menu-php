import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowRight, Plus, Minus } from "lucide-react";

interface Table {
  id: number;
  number: string;
  seats: number;
  status: "available" | "occupied";
}

interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  image?: string;
}

interface CartItem extends MenuItem {
  quantity: number;
}

interface RestaurantMenuProps {
  table: Table;
  onClose: () => void;
}

const menuItems: MenuItem[] = [
  // پیش غذاها
  {
    id: 1,
    name: "کاشک بادمجان",
    description: "بادمجان کبابی با کاشک و نعنا",
    price: 85000,
    category: "appetizers"
  },
  {
    id: 2,
    name: "میرزا قاسمی",
    description: "بادمجان کبابی با تخم مرغ و گوجه",
    price: 75000,
    category: "appetizers"
  },
  {
    id: 3,
    name: "ماست موسیر",
    description: "ماست با موسیر تازه و گردو",
    price: 45000,
    category: "appetizers"
  },
  
  // غذاهای اصلی
  {
    id: 4,
    name: "کباب کوبیده",
    description: "دو سیخ کباب کوبیده با برنج و سبزی",
    price: 180000,
    category: "main"
  },
  {
    id: 5,
    name: "جوجه کباب",
    description: "جوجه کباب زعفرانی با برنج",
    price: 220000,
    category: "main"
  },
  {
    id: 6,
    name: "قورمه سبزی",
    description: "خورشت قورمه سبزی با گوشت و لوبیا",
    price: 165000,
    category: "main"
  },
  {
    id: 7,
    name: "فسنجان",
    description: "خورشت فسنجان با مرغ و انار",
    price: 185000,
    category: "main"
  },

  // نوشیدنی ها گرم
  {
    id: 8,
    name: "چای سنتی",
    description: "چای داخلی با شکر نبات",
    price: 25000,
    category: "drinks",
    image: "🫖"
  },
  {
    id: 9,
    name: "قهوه ترک",
    description: "قهوه ترک اصل با هل",
    price: 35000,
    category: "drinks", 
    image: "☕"
  },
  {
    id: 10,
    name: "چای ماسالا",
    description: "چای هندی با ادویه‌جات",
    price: 30000,
    category: "drinks",
    image: "🍵"
  },
  
  // نوشیدنی های سرد
  {
    id: 11,
    name: "دوغ گازدار",
    description: "دوغ خانگی با نعنا و خیار",
    price: 30000,
    category: "cold-drinks",
    image: "🥤"
  },
  {
    id: 12,
    name: "آب آلبالو",
    description: "شربت آلبالوی طبیعی",
    price: 35000,
    category: "cold-drinks",
    image: "🍹"
  },
  {
    id: 13,
    name: "لیموناد",
    description: "لیموناد تازه با نعنا",
    price: 40000,
    category: "cold-drinks",
    image: "🍋"
  },
  {
    id: 14,
    name: "شیک موز",
    description: "شیک موز با بستنی وانیل",
    price: 55000,
    category: "cold-drinks",
    image: "🍌"
  },

  // دسرها
  {
    id: 15,
    name: "فالوده شیرازی",
    description: "فالوده سنتی با بستنی و شربت",
    price: 65000,
    category: "desserts",
    image: "🍧"
  },
  {
    id: 16,
    name: "بستنی زعفرانی",
    description: "بستنی خانگی با زعفران",
    price: 55000,
    category: "desserts",
    image: "🍨"
  },
  {
    id: 17,
    name: "باقلوا",
    description: "باقلوا سنتی با عسل و پسته",
    price: 45000,
    category: "desserts",
    image: "🧁"
  }
];

const categories = {
  appetizers: "پیش غذا",
  main: "غذای اصلی", 
  drinks: "نوشیدنی گرم",
  "cold-drinks": "نوشیدنی سرد",
  desserts: "دسر"
};

export const RestaurantMenu = ({ table, onClose }: RestaurantMenuProps) => {
  const [cart, setCart] = useState<CartItem[]>([]);

  const addToCart = (item: MenuItem) => {
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

  const getItemQuantity = (itemId: number) => {
    const item = cart.find(cartItem => cartItem.id === itemId);
    return item?.quantity || 0;
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fa-IR').format(price) + ' تومان';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30 menu-slide-in">
      <div className="container mx-auto p-4 max-w-6xl">
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex items-center gap-2"
          >
            <ArrowRight size={16} />
            بازگشت به میزها
          </Button>
          
          <div className="text-center">
            <h1 className="text-2xl md:text-3xl font-bold">منوی رستوران</h1>
            <p className="text-muted-foreground">میز شماره {table.number} - {table.seats} نفر</p>
          </div>
          
          <div className="w-24"></div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Tabs defaultValue="main" className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                {Object.entries(categories).map(([key, value]) => (
                  <TabsTrigger key={key} value={key} className="text-xs px-2">
                    {value}
                  </TabsTrigger>
                ))}
              </TabsList>

              {Object.keys(categories).map(category => (
                <TabsContent key={category} value={category} className="space-y-4 mt-6">
                  <div className="grid gap-4">
                    {menuItems
                      .filter(item => item.category === category)
                      .map(item => (
                        <Card key={item.id} className="p-4 hover:shadow-lg transition-all duration-200 border-l-4 border-l-primary/20">
                          <div className="flex justify-between items-start">
                            <div className="flex items-start gap-3 flex-1">
                              {item.image && (
                                <div className="text-2xl bg-muted rounded-full w-12 h-12 flex items-center justify-center">
                                  {item.image}
                                </div>
                              )}
                              <div className="flex-1">
                                <h3 className="font-semibold text-lg">{item.name}</h3>
                                <p className="text-muted-foreground text-sm mt-1 line-clamp-2">
                                  {item.description}
                                </p>
                                <p className="text-primary font-bold mt-2 text-lg">
                                  {formatPrice(item.price)}
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2 mr-4">
                              {getItemQuantity(item.id) > 0 ? (
                                <div className="flex items-center gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => removeFromCart(item.id)}
                                  >
                                    <Minus size={16} />
                                  </Button>
                                  <Badge variant="secondary" className="px-3 py-1">
                                    {getItemQuantity(item.id)}
                                  </Badge>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => addToCart(item)}
                                  >
                                    <Plus size={16} />
                                  </Button>
                                </div>
                              ) : (
                                <Button
                                  variant="default"
                                  size="sm"
                                  onClick={() => addToCart(item)}
                                >
                                  <Plus size={16} />
                                  اضافه کردن
                                </Button>
                              )}
                            </div>
                          </div>
                        </Card>
                      ))}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </div>

          {/* سبد خرید */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4 shadow-lg border-0 bg-gradient-to-b from-background to-muted/30">
              <div className="p-4 border-b border-border/50">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-lg">🛒 سبد خرید</h3>
                  {cart.length > 0 && (
                    <Badge variant="secondary" className="bg-primary/10 text-primary">
                      {cart.reduce((sum, item) => sum + item.quantity, 0)} آیتم
                    </Badge>
                  )}
                </div>
              </div>
              
              <div className="p-4">
                {cart.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">🍽️</div>
                    <p className="text-muted-foreground">
                      سبد خرید شما خالی است
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      محصولات مورد علاقه خود را اضافه کنید
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {cart.map(item => (
                      <div key={item.id} className="bg-muted/30 rounded-lg p-3 border border-border/30">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <p className="font-medium text-sm">{item.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {formatPrice(item.price)} × {item.quantity}
                            </p>
                          </div>
                          <p className="font-bold text-primary text-sm">
                            {formatPrice(item.price * item.quantity)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 justify-end">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeFromCart(item.id)}
                            className="h-7 w-7 p-0"
                          >
                            <Minus size={12} />
                          </Button>
                          <span className="mx-2 font-medium text-sm min-w-[20px] text-center">
                            {item.quantity}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => addToCart(item)}
                            className="h-7 w-7 p-0"
                          >
                            <Plus size={12} />
                          </Button>
                        </div>
                      </div>
                    ))}
                    
                    <div className="border-t border-border/50 pt-4 mt-4">
                      <div className="flex justify-between items-center mb-4">
                        <p className="font-bold text-lg">مجموع کل:</p>
                        <p className="font-bold text-primary text-xl">
                          {formatPrice(getTotalPrice())}
                        </p>
                      </div>
                      
                      <Button className="w-full h-12 text-base font-semibold bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg">
                        🍽️ ثبت سفارش ({cart.reduce((sum, item) => sum + item.quantity, 0)} آیتم)
                      </Button>
                      
                      <p className="text-xs text-muted-foreground text-center mt-2">
                        ارسال رایگان برای سفارش‌های بالای ۲۰۰ هزار تومان
                      </p>
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