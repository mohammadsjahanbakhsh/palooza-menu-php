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

  // نوشیدنی ها
  {
    id: 8,
    name: "چای سنتی",
    description: "چای داخلی با شکر نبات",
    price: 25000,
    category: "drinks"
  },
  {
    id: 9,
    name: "دوغ گازدار",
    description: "دوغ خانگی با نعنا",
    price: 30000,
    category: "drinks"
  },
  {
    id: 10,
    name: "آب آلبالو",
    description: "شربت آلبالوی طبیعی",
    price: 35000,
    category: "drinks"
  },

  // دسرها
  {
    id: 11,
    name: "فالوده شیرازی",
    description: "فالوده سنتی با بستنی و شربت",
    price: 65000,
    category: "desserts"
  },
  {
    id: 12,
    name: "بستنی زعفرانی",
    description: "بستنی خانگی با زعفران",
    price: 55000,
    category: "desserts"
  }
];

const categories = {
  appetizers: "پیش غذا",
  main: "غذای اصلی", 
  drinks: "نوشیدنی",
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
              <TabsList className="grid w-full grid-cols-4">
                {Object.entries(categories).map(([key, value]) => (
                  <TabsTrigger key={key} value={key} className="text-sm">
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
                        <Card key={item.id} className="p-4 hover:shadow-md transition-shadow">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h3 className="font-semibold text-lg">{item.name}</h3>
                              <p className="text-muted-foreground text-sm mt-1">
                                {item.description}
                              </p>
                              <p className="text-primary font-bold mt-2">
                                {formatPrice(item.price)}
                              </p>
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
            <Card className="p-4 sticky top-4">
              <h3 className="font-semibold text-lg mb-4">سفارش شما</h3>
              
              {cart.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  هیچ آیتمی انتخاب نشده
                </p>
              ) : (
                <div className="space-y-4">
                  {cart.map(item => (
                    <div key={item.id} className="flex justify-between items-center">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{item.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatPrice(item.price)} × {item.quantity}
                        </p>
                      </div>
                      <p className="font-semibold text-sm">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                    </div>
                  ))}
                  
                  <hr className="my-4" />
                  
                  <div className="flex justify-between items-center">
                    <p className="font-bold">مجموع:</p>
                    <p className="font-bold text-primary">
                      {formatPrice(getTotalPrice())}
                    </p>
                  </div>
                  
                  <Button className="w-full mt-4" size="lg">
                    ثبت سفارش
                  </Button>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};