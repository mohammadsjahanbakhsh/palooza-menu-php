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
  status: "empty" | "reserved" | "in-service" | "settled";
  timeInfo?: string;
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
  // نوشیدنی گرم بر پایه قهوه
  { id: 1, name: "اسپرسو (50/50)", description: "ترکیب متعادل عربیکا و روبوستا", price: 93000, category: "hot-coffee", image: "☕" },
  { id: 2, name: "اسپرسو (100% عربیکا)", description: "اسپرسوی خالص عربیکا", price: 103000, category: "hot-coffee", image: "☕" },
  { id: 3, name: "آمریکانو (50/50)", description: "اسپرسوی رقیق شده با آب داغ", price: 95000, category: "hot-coffee", image: "☕" },
  { id: 4, name: "آمریکانو (100% عربیکا)", description: "آمریکانوی خالص عربیکا", price: 106000, category: "hot-coffee", image: "☕" },
  { id: 5, name: "کورتادو (50/50)", description: "اسپرسو با شیر بخار", price: 99000, category: "hot-coffee", image: "☕" },
  { id: 6, name: "کورتادو (100% عربیکا)", description: "کورتادوی خالص عربیکا", price: 108000, category: "hot-coffee", image: "☕" },
  { id: 7, name: "کاپوچینو (50/50)", description: "اسپرسو، شیر و فوم شیر", price: 105000, category: "hot-coffee", image: "☕" },
  { id: 8, name: "کاپوچینو (100% عربیکا)", description: "کاپوچینوی خالص عربیکا", price: 115000, category: "hot-coffee", image: "☕" },
  { id: 9, name: "لاته (50/50)", description: "اسپرسو با شیر داغ و فوم نرم", price: 110000, category: "hot-coffee", image: "☕" },
  { id: 10, name: "لاته (100% عربیکا)", description: "لاتهٔ خالص عربیکا", price: 120000, category: "hot-coffee", image: "☕" },
  { id: 11, name: "لاته بادام زمینی", description: "لاته با طعم بادام زمینی", price: 112000, category: "hot-coffee", image: "☕" },
  { id: 12, name: "موکا اورجینال", description: "ترکیب اسپرسو و شکلات", price: 115000, category: "hot-coffee", image: "☕" },
  { id: 13, name: "کارامل ماکیاتو", description: "لاته با شربت کارامل", price: 115000, category: "hot-coffee", image: "☕" },

  // نوشیدنی سرد بر پایه قهوه
  { id: 14, name: "آیس اسپرسو (50/50)", description: "اسپرسوی سرد روی یخ", price: 98000, category: "cold-coffee", image: "🧊" },
  { id: 15, name: "آیس اسپرسو (100% عربیکا)", description: "اسپرسوی سرد خالص عربیکا", price: 108000, category: "cold-coffee", image: "🧊" },
  { id: 16, name: "آیس آمریکانو (50/50)", description: "آمریکانوی سرد با یخ", price: 101000, category: "cold-coffee", image: "🧊" },
  { id: 17, name: "آیس آمریکانو (100% عربیکا)", description: "آمریکانوی سرد خالص عربیکا", price: 112000, category: "cold-coffee", image: "🧊" },
  { id: 18, name: "آیس لاته (50/50)", description: "لاتهٔ سرد با یخ", price: 115000, category: "cold-coffee", image: "🥤" },
  { id: 19, name: "آیس لاته (100% عربیکا)", description: "لاتهٔ سرد خالص عربیکا", price: 125000, category: "cold-coffee", image: "🥤" },
  { id: 20, name: "آیس لاته زعفران", description: "لاتهٔ سرد با زعفران", price: 125000, category: "cold-coffee", image: "🥤" },
  { id: 21, name: "آیس لاته نارگیل", description: "لاتهٔ سرد با طعم نارگیل", price: 130000, category: "cold-coffee", image: "🥤" },
  { id: 22, name: "آیس موکا", description: "موکای سرد با یخ", price: 125000, category: "cold-coffee", image: "🥤" },
  { id: 23, name: "آفوگاتو", description: "اسپرسو روی بستنی وانیل", price: 110000, category: "cold-coffee", image: "🍨" },
  { id: 24, name: "آفوگاتو رویال", description: "آفوگاتوی لوکس با تزئینات", price: 120000, category: "cold-coffee", image: "🍨" },
  { id: 25, name: "آفوگاتو پسته", description: "آفوگاتو با بستنی پسته", price: 135000, category: "cold-coffee", image: "🍨" },
  { id: 26, name: "اسپرسو کوکوناتو", description: "اسپرسو با نارگیل", price: 135000, category: "cold-coffee", image: "🥥" },
  { id: 27, name: "آیس اسپرسو پشن فروت", description: "اسپرسو با میوه پشن", price: 135000, category: "cold-coffee", image: "🍹" },
  { id: 28, name: "آیس اسپرسو پیناکولادا", description: "اسپرسو با طعم پیناکولادا", price: 135000, category: "cold-coffee", image: "🍹" },

  // نوشیدنی گرم غیرقهوه‌ای
  { id: 29, name: "هات چاکلت", description: "شکلات داغ کرمی", price: 110000, category: "hot-drinks", image: "🍫" },
  { id: 30, name: "ناتی چاکلت", description: "شکلات داغ با فندق", price: 125000, category: "hot-drinks", image: "🍫" },
  { id: 31, name: "توت فرنگی نارگیل", description: "نوشیدنی گرم توت فرنگی و نارگیل", price: 115000, category: "hot-drinks", image: "🍓" },
  { id: 32, name: "هات پینات", description: "نوشیدنی گرم فندقی", price: 110000, category: "hot-drinks", image: "🥜" },
  { id: 33, name: "ماسالا", description: "چای ادویه‌دار هندی", price: 98000, category: "hot-drinks", image: "🫖" },
  { id: 34, name: "ماسالا اسپایسی", description: "چای ماسالای تند", price: 150000, category: "hot-drinks", image: "🫖" },
  { id: 35, name: "کرک هل", description: "چای هل اماراتی", price: 98000, category: "hot-drinks", image: "🫖" },
  { id: 36, name: "شیر بیسکویت کارامل", description: "شیر داغ با طعم بیسکویت کارامل", price: 96000, category: "hot-drinks", image: "🥛" },
  { id: 37, name: "شیر زعفران هل", description: "شیر داغ با زعفران و هل", price: 98000, category: "hot-drinks", image: "🥛" },
  { id: 38, name: "کرم پسته", description: "نوشیدنی کرمی پسته", price: 160000, category: "hot-drinks", image: "🥛" },
  { id: 39, name: "شیر شکلات فندق", description: "شیر داغ شکلاتی با فندق", price: 96000, category: "hot-drinks", image: "🥛" },
  { id: 40, name: "شیر عسل دارچین", description: "شیر داغ با عسل و دارچین", price: 96000, category: "hot-drinks", image: "🥛" },

  // دمی بار
  { id: 41, name: "رگولار (50/50)", description: "قهوه دم کرده متعادل", price: 88000, category: "drip-coffee", image: "☕" },
  { id: 42, name: "رگولار (100% عربیکا)", description: "قهوه دم کرده خالص عربیکا", price: 98000, category: "drip-coffee", image: "☕" },
  { id: 43, name: "V60", description: "قهوه دست‌ساز V60", price: 160000, category: "drip-coffee", image: "☕" },

  // چای و دمنوش‌ها
  { id: 44, name: "چای کلاسیک", description: "چای سیاه معطر", price: 82000, category: "tea", image: "🫖" },
  { id: 45, name: "چای زعفران", description: "چای با زعفران اصل", price: 88000, category: "tea", image: "🫖" },
  { id: 46, name: "چای هل", description: "چای معطر با هل", price: 88000, category: "tea", image: "🫖" },
  { id: 47, name: "چای سبز و نعنا", description: "چای سبز با نعنا تازه", price: 90000, category: "tea", image: "🍃" },
  { id: 48, name: "چای اولانگ طلایی", description: "چای اولانگ معطر", price: 90000, category: "tea", image: "🫖" },
  { id: 49, name: "مولن رژ", description: "دمنوش گیاهی قرمز", price: 92000, category: "tea", image: "🌿" },
  { id: 50, name: "ویکتوریا سان ست", description: "دمنوش میوه‌ای", price: 92000, category: "tea", image: "🌿" },
  { id: 51, name: "کوئین بری", description: "دمنوش توت‌ها", price: 99000, category: "tea", image: "🫐" },
  { id: 52, name: "استرابری کیس", description: "دمنوش توت فرنگی", price: 99000, category: "tea", image: "🍓" },
  { id: 53, name: "پینک رز چامومیل", description: "دمنوش بابونه و گل رز", price: 92000, category: "tea", image: "🌹" },
  { id: 54, name: "نعنا مراکشی", description: "دمنوش نعنا تازه", price: 85000, category: "tea", image: "🌿" },
  { id: 55, name: "گلدن وانیل", description: "دمنوش وانیل طلایی", price: 94000, category: "tea", image: "🌿" },
  { id: 56, name: "آرامش", description: "دمنوش آرامش‌بخش", price: 94000, category: "tea", image: "🌿" },
  { id: 57, name: "زعفران", description: "دمنوش زعفرانی", price: 92000, category: "tea", image: "🌿" },
  { id: 58, name: "پیچ بلک تی", description: "چای سیاه با هلو", price: 92000, category: "tea", image: "🍑" },
  { id: 59, name: "رویال جاسمین", description: "چای یاس معطر", price: 90000, category: "tea", image: "🌸" },

  // میلک‌شیک‌ها
  { id: 60, name: "شکلات", description: "میلک‌شیک شکلاتی غنی", price: 145000, category: "milkshakes", image: "🍫" },
  { id: 61, name: "بادام زمینی", description: "میلک‌شیک بادام زمینی", price: 155000, category: "milkshakes", image: "🥜" },
  { id: 62, name: "بیسکوییت کارامل", description: "میلک‌شیک بیسکویت کارامل", price: 150000, category: "milkshakes", image: "🍪" },
  { id: 63, name: "توت فرنگی شاه توت", description: "میلک‌شیک توت‌های قرمز", price: 162000, category: "milkshakes", image: "🍓" },
  { id: 64, name: "قهوه", description: "میلک‌شیک قهوه‌ای", price: 160000, category: "milkshakes", image: "☕" },
  { id: 65, name: "نوتلا", description: "میلک‌شیک نوتلا", price: 190000, category: "milkshakes", image: "🍫" },
  { id: 66, name: "لوتوس", description: "میلک‌شیک لوتوس", price: 195000, category: "milkshakes", image: "🍪" },
  { id: 67, name: "زعفران پسته", description: "میلک‌شیک زعفران پسته", price: 180000, category: "milkshakes", image: "🥜" },

  // شربت‌ها
  { id: 68, name: "چشم‌هایش", description: "شربت سنتی چشم‌هایش", price: 82000, category: "syrups", image: "🥤" },
  { id: 69, name: "سووشون", description: "شربت سووشون", price: 82000, category: "syrups", image: "🥤" },
  { id: 70, name: "کلیدر", description: "شربت کلیدر", price: 82000, category: "syrups", image: "🥤" },
  { id: 71, name: "سمفونی", description: "شربت سمفونی", price: 86000, category: "syrups", image: "🥤" },
  { id: 72, name: "افسان", description: "شربت افسان", price: 82000, category: "syrups", image: "🥤" },

  // پروتئین بار
  { id: 73, name: "اسموتی پروتئین", description: "اسموتی پروتئینی تقویتی", price: 155000, category: "protein", image: "💪" },
  { id: 74, name: "شیک پروتئین", description: "شیک پروتئینی ورزشی", price: 180000, category: "protein", image: "💪" },
  { id: 75, name: "شیک پروتئین پلاس", description: "شیک پروتئینی پیشرفته", price: 190000, category: "protein", image: "💪" },

  // ماکتیل‌ها
  { id: 76, name: "لیموناد", description: "لیموناد تازه", price: 90000, category: "mocktails", image: "🍋" },
  { id: 77, name: "موهیتو", description: "موهیتوی بدون الکل", price: 92000, category: "mocktails", image: "🌿" },
  { id: 78, name: "تیارا", description: "ماکتیل تیارا", price: 102000, category: "mocktails", image: "🍹" },
  { id: 79, name: "ایریس", description: "ماکتیل ایریس", price: 98000, category: "mocktails", image: "🍹" },
  { id: 80, name: "لای لو", description: "ماکتیل لای لو", price: 98000, category: "mocktails", image: "🍹" },
  { id: 81, name: "ردهیت", description: "ماکتیل ردهیت", price: 99000, category: "mocktails", image: "🍹" },
  { id: 82, name: "بلک فارست", description: "ماکتیل بلک فارست", price: 99000, category: "mocktails", image: "🍹" },
  { id: 83, name: "پینک اسکای", description: "ماکتیل پینک اسکای", price: 96000, category: "mocktails", image: "🍹" },
  { id: 84, name: "بلونایت", description: "ماکتیل بلونایت", price: 98000, category: "mocktails", image: "🍹" },

  // ماچابار
  { id: 85, name: "ماچالاته دارچین", description: "ماچا لاته با دارچین", price: 98000, category: "matcha", image: "🍵" },
  { id: 86, name: "ماچالاته نارگیل", description: "ماچا لاته با نارگیل", price: 102000, category: "matcha", image: "🍵" },
  { id: 87, name: "آیس ماچا نارگیل", description: "ماچای سرد با نارگیل", price: 106000, category: "matcha", image: "🧊" },
  { id: 88, name: "آیس ماچا توت فرنگی", description: "ماچای سرد با توت فرنگی", price: 110000, category: "matcha", image: "🍓" },
  { id: 89, name: "آیس ماچا کنگو", description: "ماچای سرد کنگو", price: 120000, category: "matcha", image: "🧊" },
  { id: 90, name: "آیس ماچا کلاسیک", description: "ماچای سرد کلاسیک", price: 106000, category: "matcha", image: "🧊" },
  { id: 91, name: "آیس اسپرولینا لوندر", description: "اسپرولینای سرد با لاوندر", price: 98000, category: "matcha", image: "🌿" },
  { id: 92, name: "آیس اسپرولینا نارگیل", description: "اسپرولینای سرد با نارگیل", price: 106000, category: "matcha", image: "🌿" },
  { id: 93, name: "آیس اسپرولینا شکلات کوکی", description: "اسپرولینا با شکلات کوکی", price: 102000, category: "matcha", image: "🍪" },

  // اسموتی‌ها
  { id: 94, name: "انبه توت فرنگی", description: "اسموتی انبه و توت فرنگی", price: 120000, category: "smoothies", image: "🥭" },
  { id: 95, name: "سیب کارامل", description: "اسموتی سیب کارامل", price: 115000, category: "smoothies", image: "🍎" },
  { id: 96, name: "میوه های قرمز", description: "اسموتی میوه‌های قرمز", price: 120000, category: "smoothies", image: "🫐" },
  { id: 97, name: "آب پرتقال توت فرنگی", description: "اسموتی پرتقال و توت فرنگی", price: 105000, category: "smoothies", image: "🍊" },
  { id: 98, name: "منگوفریز", description: "اسموتی منگوی منجمد", price: 140000, category: "smoothies", image: "🥭" },

  // بیکری و پیستری
  { id: 104, name: "کیک هویچ گردو", description: "کیک هویج و گردو", price: 139000, category: "bakery", image: "🥕" },
  { id: 105, name: "چیز کیک کارامل", description: "کیک پنیر کارامل", price: 149000, category: "bakery", image: "🍰" },
  { id: 106, name: "چیز کیک نوتلا", description: "کیک پنیر نوتلا", price: 170000, category: "bakery", image: "🍰" },
  { id: 107, name: "چیز کیک نیویورکی", description: "کیک پنیر کلاسیک نیویورکی", price: 110000, category: "bakery", image: "🍰" },
  { id: 108, name: "هایتی", description: "کیک هایتی", price: 149000, category: "bakery", image: "🍰" },
  { id: 109, name: "دبل چاکلت", description: "کیک دو لایه شکلات", price: 135000, category: "bakery", image: "🍫" },
  { id: 110, name: "پن سوئیسی", description: "نان سوئیسی", price: 130000, category: "bakery", image: "🥖" },
  { id: 111, name: "تارت لایه ای پسته", description: "تارت لایه‌ای پسته", price: 130000, category: "bakery", image: "🥧" },
  { id: 112, name: "تارت لایه ای شکلات", description: "تارت لایه‌ای شکلات", price: 130000, category: "bakery", image: "🥧" },

  // افزودنی‌ها
  { id: 99, name: "کوکی", description: "کوکی تازه", price: 15000, category: "addons", image: "🍪" },
  { id: 100, name: "باقلوا", description: "باقلوای سنتی", price: 18000, category: "addons", image: "🧁" },
  { id: 101, name: "سیروپ", description: "سیروپ طعم‌دهنده", price: 10000, category: "addons", image: "🍯" },
  { id: 102, name: "ورودی", description: "هزینه ورودی", price: 50000, category: "addons", image: "🎫" },
  { id: 103, name: "شیر بدون لاکتوز", description: "شیر بدون لاکتوز", price: 50000, category: "addons", image: "🥛" }
];

const categories = {
  "hot-coffee": "☕ نوشیدنی گرم بر پایه قهوه",
  "cold-coffee": "🧊 نوشیدنی سرد بر پایه قهوه", 
  "hot-drinks": "🫖 نوشیدنی گرم غیرقهوه‌ای",
  "drip-coffee": "☕ دمی بار",
  "tea": "🍃 چای و دمنوش‌ها",
  "milkshakes": "🥤 میلک‌شیک‌ها",
  "syrups": "🥤 شربت‌ها",
  "protein": "💪 پروتئین بار",
  "mocktails": "🍹 ماکتیل‌ها",
  "matcha": "🍵 ماچابار",
  "smoothies": "🥤 اسموتی‌ها",
  "bakery": "🧁 بیکری و پیستری",
  "addons": "🍯 افزودنی‌ها"
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
            <Tabs defaultValue="hot-coffee" className="w-full">
              <div className="mb-4">
                <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7 gap-1 h-auto p-1">
                  {Object.entries(categories).map(([key, value]) => (
                    <TabsTrigger 
                      key={key} 
                      value={key} 
                      className="text-xs px-1 py-2 whitespace-nowrap overflow-hidden text-ellipsis data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-200 hover:bg-primary/10"
                    >
                      <span className="block truncate">{value}</span>
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>

              {Object.keys(categories).map(category => {
                const categoryItems = menuItems.filter(item => item.category === category);
                return (
                  <TabsContent key={category} value={category} className="space-y-4 mt-0">
                    <div className="mb-4">
                      <h2 className="text-xl font-bold text-foreground mb-2 flex items-center gap-2">
                        {categories[category as keyof typeof categories]}
                        <Badge variant="secondary" className="bg-primary/10 text-primary">
                          {categoryItems.length} آیتم
                        </Badge>
                      </h2>
                    </div>
                    <div className="grid gap-3 md:gap-4">
                      {categoryItems.map(item => (
                        <Card key={item.id} className="group p-3 md:p-4 hover:shadow-xl transition-all duration-300 border-l-4 border-l-primary/20 hover:border-l-primary bg-gradient-to-r from-background to-muted/20 hover:from-primary/5 hover:to-primary/10 hover-scale">
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                            <div className="flex items-start gap-3 flex-1 min-w-0">
                              {item.image && (
                                <div className="text-xl md:text-2xl bg-gradient-to-br from-primary/10 to-primary/5 rounded-full w-10 h-10 md:w-12 md:h-12 flex items-center justify-center flex-shrink-0 group-hover:from-primary/20 group-hover:to-primary/10 transition-colors duration-300">
                                  {item.image}
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-base md:text-lg group-hover:text-primary transition-colors duration-200 truncate">{item.name}</h3>
                                <p className="text-muted-foreground text-xs md:text-sm mt-1 line-clamp-2 leading-relaxed">
                                  {item.description}
                                </p>
                                <div className="flex items-center justify-between mt-2">
                                  <p className="text-primary font-bold text-sm md:text-lg">
                                    {formatPrice(item.price)}
                                  </p>
                                  {getItemQuantity(item.id) > 0 && (
                                    <Badge variant="secondary" className="bg-primary/20 text-primary text-xs">
                                      در سبد: {getItemQuantity(item.id)}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center justify-end gap-2 flex-shrink-0">
                              {getItemQuantity(item.id) > 0 ? (
                                <div className="flex items-center gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => removeFromCart(item.id)}
                                    className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/20 transition-all duration-200"
                                  >
                                    <Minus size={14} />
                                  </Button>
                                  <Badge variant="secondary" className="px-2 py-1 bg-primary text-primary-foreground min-w-[2rem] text-center">
                                    {getItemQuantity(item.id)}
                                  </Badge>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => addToCart(item)}
                                    className="h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary hover:border-primary/20 transition-all duration-200"
                                  >
                                    <Plus size={14} />
                                  </Button>
                                </div>
                              ) : (
                                <Button
                                  variant="default"
                                  size="sm"
                                  onClick={() => addToCart(item)}
                                  className="h-8 px-3 text-xs font-medium bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-105"
                                >
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

          {/* سبد خرید */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4 shadow-2xl border-0 bg-gradient-to-b from-background via-background to-primary/5 backdrop-blur-sm">
              <div className="p-4 border-b border-primary/10 bg-gradient-to-r from-primary/5 to-primary/10">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-lg flex items-center gap-2">
                    🛒 سبد خرید
                  </h3>
                  {cart.length > 0 && (
                    <Badge variant="secondary" className="bg-primary text-primary-foreground animate-pulse">
                      {cart.reduce((sum, item) => sum + item.quantity, 0)} آیتم
                    </Badge>
                  )}
                </div>
              </div>
              
              <div className="p-4 max-h-[70vh] overflow-y-auto">
                {cart.length === 0 ? (
                  <div className="text-center py-8 md:py-12">
                    <div className="text-4xl md:text-6xl mb-4 animate-bounce">🍽️</div>
                    <p className="text-muted-foreground font-medium">
                      سبد خرید شما خالی است
                    </p>
                    <p className="text-xs md:text-sm text-muted-foreground mt-2 leading-relaxed">
                      محصولات دلخواه خود را از منو انتخاب کنید
                    </p>
                    <div className="mt-4 p-3 bg-primary/5 rounded-lg">
                      <p className="text-xs text-primary font-medium">
                        💡 نکته: روی دسته‌بندی‌ها کلیک کنید
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {cart.map(item => (
                      <div key={item.id} className="bg-gradient-to-r from-muted/20 to-primary/5 rounded-lg p-3 border border-primary/10 hover:border-primary/20 transition-all duration-200 hover-scale">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-sm truncate">{item.name}</p>
                              <span className="text-lg">{item.image}</span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              {formatPrice(item.price)} × {item.quantity}
                            </p>
                          </div>
                          <p className="font-bold text-primary text-sm">
                            {formatPrice(item.price * item.quantity)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 justify-between">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => removeFromCart(item.id)}
                              className="h-7 w-7 p-0 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/20"
                            >
                              <Minus size={12} />
                            </Button>
                            <Badge variant="secondary" className="bg-primary/10 text-primary min-w-[2rem] text-center">
                              {item.quantity}
                            </Badge>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => addToCart(item)}
                              className="h-7 w-7 p-0 hover:bg-primary/10 hover:text-primary hover:border-primary/20"
                            >
                              <Plus size={12} />
                            </Button>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setCart(prev => prev.filter(cartItem => cartItem.id !== item.id))}
                            className="h-7 w-7 p-0 text-destructive hover:bg-destructive/10"
                          >
                            ✕
                          </Button>
                        </div>
                      </div>
                    ))}
                    
                    <div className="border-t border-primary/20 pt-4 mt-4 bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg p-3">
                      <div className="flex justify-between items-center mb-4">
                        <p className="font-bold text-base md:text-lg">مجموع کل:</p>
                        <p className="font-bold text-primary text-lg md:text-xl">
                          {formatPrice(getTotalPrice())}
                        </p>
                      </div>
                      
                      <Button className="w-full h-10 md:h-12 text-sm md:text-base font-semibold bg-gradient-to-r from-primary via-primary to-primary/80 hover:from-primary/90 hover:via-primary/90 hover:to-primary/70 shadow-lg hover:shadow-xl transition-all duration-300 animate-pulse hover:animate-none">
                        🍽️ ثبت سفارش ({cart.reduce((sum, item) => sum + item.quantity, 0)} آیتم)
                      </Button>
                      
                      <div className="mt-3 p-2 bg-background/80 rounded text-center">
                        <p className="text-xs text-muted-foreground">
                          📍 ارائه در کافه‌شاپ
                        </p>
                        {getTotalPrice() >= 200000 && (
                          <p className="text-xs text-primary font-medium mt-1">
                            🎉 مبلغ شما مشمول تخفیف ویژه است!
                          </p>
                        )}
                      </div>
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