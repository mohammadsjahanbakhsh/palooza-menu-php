import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Palette, RotateCcw, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Interface for the color scheme
interface ColorScheme {
  tableFree: string;
  tableReserved: string;
  tableServing: string;
  tablePaid: string;
}

// ✅ تغییر اصلی اینجاست: رنگ‌های پیش‌فرض با مقادیر درخواستی شما جایگزین شدند
const defaultColors: ColorScheme = {
  tableFree:    "153 31% 86%", //  خالی: #D1E7DD
  tablePaid:     "189 53% 88%", //  تسویه شده: #D1ECF1
  tableReserved: "46 100% 90%", //  رزرو شده: #FFF3CD
  tableServing: "355 70% 91%", //  در حال سرویس: #F8D7DA
};

const ColorCustomization = () => {
  const [colors, setColors] = useState<ColorScheme>(defaultColors);
  const [tempColors, setTempColors] = useState<ColorScheme>(defaultColors);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Load saved colors from the DATABASE when the component mounts
  useEffect(() => {
    const loadColorsFromServer = async () => {
      try {
        const response = await fetch('/api/get_color_settings.php', { credentials: 'include' });
        if (!response.ok) throw new Error("Failed to fetch colors.");
        const savedColors = await response.json();
        if (savedColors && savedColors.tableFree) { // Check if data is valid
          setColors(savedColors);
          setTempColors(savedColors);
          applyColorsToCSS(savedColors); // Apply loaded colors immediately
        }
      } catch (error) {
        console.error("Could not load custom colors from server, using defaults:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadColorsFromServer();
  }, []);

  // --- Color Conversion Utilities ---
  const hexToHsl = (hex: string): string => {
    hex = hex.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16) / 255;
    const g = parseInt(hex.substr(2, 2), 16) / 255;
    const b = parseInt(hex.substr(4, 2), 16) / 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    const l = (max + min) / 2;
    let h = 0, s = 0;
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }
    return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
  };

  const hslToHex = (hsl: string): string => {
    if (!hsl || typeof hsl !== 'string') return '#000000';
    const [h, s, l] = hsl.split(' ').map((val, index) => {
      if (index === 0) return parseInt(val) / 360;
      return parseInt(val.replace('%', '')) / 100;
    });
    if (s === 0) {
      const val = Math.round(l * 255).toString(16).padStart(2, '0');
      return `#${val}${val}${val}`;
    }
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    const r = hue2rgb(p, q, h + 1/3);
    const g = hue2rgb(p, q, h);
    const b = hue2rgb(p, q, h - 1/3);
    const toHex = (c: number) => Math.round(c * 255).toString(16).padStart(2, '0');
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  };

  // --- Handlers ---
  const handleColorChange = (colorKey: keyof ColorScheme, value: string) => {
    const hslValue = hexToHsl(value);
    setTempColors(prev => ({ ...prev, [colorKey]: hslValue }));
  };

  const applyColorsToCSS = (colorsToApply: ColorScheme) => {
    const root = document.documentElement;
    root.style.setProperty('--table-free', colorsToApply.tableFree);
    root.style.setProperty('--table-reserved', colorsToApply.tableReserved);
    root.style.setProperty('--table-serving', colorsToApply.tableServing);
    root.style.setProperty('--table-paid', colorsToApply.tablePaid);
  };

  const saveColors = async () => {
    try {
      await fetch('/api/save_color_settings.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(tempColors),
      });
      applyColorsToCSS(tempColors);
      setColors(tempColors);
      toast({ title: "رنگ‌ها ذخیره شد", description: "تنظیمات رنگ با موفقیت در سرور ذخیره شد" });
    } catch (error) {
      toast({ title: "خطا", description: "ذخیره رنگ‌ها ناموفق بود.", variant: "destructive" });
    }
  };

  const resetColors = async () => {
    try {
      await fetch('/api/save_color_settings.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(defaultColors),
      });
      applyColorsToCSS(defaultColors);
      setTempColors(defaultColors);
      setColors(defaultColors);
      toast({ title: "رنگ‌ها بازنشانی شد", description: "رنگ‌ها به حالت پیش‌فرض بازگردانده شد" });
    } catch (error) {
      toast({ title: "خطا", description: "بازنشانی رنگ‌ها ناموفق بود.", variant: "destructive" });
    }
  };

  const colorConfigs = [
    { key: 'tableFree' as keyof ColorScheme, label: 'میز خالی', description: 'رنگ میزهای خالی و آماده استفاده' },
    { key: 'tableReserved' as keyof ColorScheme, label: 'میز رزرو شده', description: 'رنگ میزهای رزرو شده' },
    { key: 'tableServing' as keyof ColorScheme, label: 'در حال سرویس', description: 'رنگ میزهای در حال سرویس' },
    { key: 'tablePaid' as keyof ColorScheme, label: 'تسویه شده', description: 'رنگ میزهای تسویه شده' }
  ];

  if (isLoading) {
    return <p>در حال بارگذاری تنظیمات رنگ...</p>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Palette className="w-5 h-5" />پیش‌نمایش رنگ‌ها</CardTitle>
          <CardDescription>پیش‌نمایش رنگ‌های انتخابی برای وضعیت‌های مختلف میز</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {colorConfigs.map((config) => (
              <div key={config.key} className="text-center space-y-2">
                <div 
                  className="w-16 h-16 rounded-lg mx-auto border-2 border-border shadow-sm"
                  style={{ backgroundColor: `hsl(${tempColors[config.key]})` }}
                ></div>
                <Badge variant="secondary" className="text-xs">{config.label}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      <div className="grid gap-4 md:grid-cols-2">
        {colorConfigs.map((config) => (
          <Card key={config.key}>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">{config.label}</CardTitle>
              <CardDescription className="text-sm">{config.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-3 items-center">
                <Input
                  id={`color-${config.key}`}
                  type="color"
                  value={hslToHex(tempColors[config.key])}
                  onChange={(e) => handleColorChange(config.key, e.target.value)}
                  className="w-16 h-10 p-1 border rounded cursor-pointer"
                />
                <div className="flex-1 text-sm font-mono text-muted-foreground">
                  {tempColors[config.key]}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <div className="flex flex-wrap gap-3 justify-end">
        <Button variant="outline" onClick={() => applyColorsToCSS(tempColors)}>
          <Palette className="w-4 h-4 mr-2" />
          پیش‌نمایش
        </Button>
        <Button variant="outline" onClick={resetColors}>
          <RotateCcw className="w-4 h-4 mr-2" />
          بازنشانی
        </Button>
        <Button onClick={saveColors}>
          <Save className="w-4 h-4 mr-2" />
          ذخیره تنظیمات
        </Button>
      </div>
    </div>
  );
};

export default ColorCustomization;