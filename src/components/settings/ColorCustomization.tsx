import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Palette, RotateCcw, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ColorScheme {
  tableEmpty: string;
  tableReserved: string;
  tableOccupied: string;
  tablePaid: string;
}

const defaultColors: ColorScheme = {
  tableEmpty: "134 239 172", // green-300
  tableReserved: "250 204 21", // yellow-400
  tableOccupied: "248 113 113", // red-400
  tablePaid: "96 165 250", // blue-400
};

const ColorCustomization = () => {
  const [colors, setColors] = useState<ColorScheme>(defaultColors);
  const [tempColors, setTempColors] = useState<ColorScheme>(defaultColors);
  const { toast } = useToast();

  useEffect(() => {
    // Load saved colors from localStorage
    const savedColors = localStorage.getItem('tableColors');
    if (savedColors) {
      const parsed = JSON.parse(savedColors);
      setColors(parsed);
      setTempColors(parsed);
    }
  }, []);

  const handleColorChange = (colorKey: keyof ColorScheme, value: string) => {
    // Convert hex to HSL
    const hslValue = hexToHsl(value);
    setTempColors(prev => ({
      ...prev,
      [colorKey]: hslValue
    }));
  };

  const hexToHsl = (hex: string): string => {
    // Remove # if present
    hex = hex.replace('#', '');
    
    // Convert hex to RGB
    const r = parseInt(hex.substr(0, 2), 16) / 255;
    const g = parseInt(hex.substr(2, 2), 16) / 255;
    const b = parseInt(hex.substr(4, 2), 16) / 255;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
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

    // Convert to HSL format for CSS variables
    return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
  };

  const hslToHex = (hsl: string): string => {
    const [h, s, l] = hsl.split(' ').map((val, index) => {
      if (index === 0) return parseInt(val) / 360;
      return parseInt(val.replace('%', '')) / 100;
    });

    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };

    let r, g, b;
    if (s === 0) {
      r = g = b = l;
    } else {
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }

    const toHex = (c: number) => {
      const hex = Math.round(c * 255).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    };

    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  };

  const applyColors = () => {
    // Apply colors to CSS variables
    const root = document.documentElement;
    root.style.setProperty('--table-empty', tempColors.tableEmpty);
    root.style.setProperty('--table-reserved', tempColors.tableReserved);
    root.style.setProperty('--table-occupied', tempColors.tableOccupied);
    root.style.setProperty('--table-paid', tempColors.tablePaid);
    
    setColors(tempColors);
  };

  const saveColors = () => {
    applyColors();
    localStorage.setItem('tableColors', JSON.stringify(tempColors));
    
    toast({
      title: "رنگ‌ها ذخیره شد",
      description: "تنظیمات رنگ با موفقیت ذخیره شد"
    });
  };

  const resetColors = () => {
    setTempColors(defaultColors);
    
    // Apply default colors to CSS variables
    const root = document.documentElement;
    root.style.setProperty('--table-empty', defaultColors.tableEmpty);
    root.style.setProperty('--table-reserved', defaultColors.tableReserved);
    root.style.setProperty('--table-occupied', defaultColors.tableOccupied);
    root.style.setProperty('--table-paid', defaultColors.tablePaid);
    
    setColors(defaultColors);
    localStorage.removeItem('tableColors');
    
    toast({
      title: "رنگ‌ها بازنشانی شد",
      description: "رنگ‌ها به حالت پیش‌فرض بازگردانده شد"
    });
  };

  const previewColors = () => {
    applyColors();
  };

  const colorConfigs = [
    {
      key: 'tableEmpty' as keyof ColorScheme,
      label: 'میز خالی',
      description: 'رنگ میزهای خالی و آماده استفاده'
    },
    {
      key: 'tableReserved' as keyof ColorScheme,
      label: 'میز رزرو شده',
      description: 'رنگ میزهای رزرو شده'
    },
    {
      key: 'tableOccupied' as keyof ColorScheme,
      label: 'در حال سرویس',
      description: 'رنگ میزهای در حال سرویس'
    },
    {
      key: 'tablePaid' as keyof ColorScheme,
      label: 'تسویه شده',
      description: 'رنگ میزهای تسویه شده'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Preview Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="w-5 h-5" />
            پیش‌نمایش رنگ‌ها
          </CardTitle>
          <CardDescription>
            پیش‌نمایش رنگ‌های انتخابی برای وضعیت‌های مختلف میز
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {colorConfigs.map((config) => (
              <div key={config.key} className="text-center space-y-2">
                <div 
                  className="w-16 h-16 rounded-lg mx-auto border-2 border-border shadow-sm"
                  style={{ backgroundColor: `hsl(${tempColors[config.key]})` }}
                ></div>
                <Badge variant="secondary" className="text-xs">
                  {config.label}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Color Pickers */}
      <div className="grid gap-4 md:grid-cols-2">
        {colorConfigs.map((config) => (
          <Card key={config.key}>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">{config.label}</CardTitle>
              <CardDescription className="text-sm">
                {config.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Label htmlFor={`color-${config.key}`}>انتخاب رنگ</Label>
                <div className="flex gap-3 items-center">
                  <Input
                    id={`color-${config.key}`}
                    type="color"
                    value={hslToHex(tempColors[config.key])}
                    onChange={(e) => handleColorChange(config.key, e.target.value)}
                    className="w-16 h-10 p-1 border rounded cursor-pointer"
                  />
                  <div className="flex-1">
                    <div className="text-sm font-mono text-muted-foreground">
                      {tempColors[config.key]}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3 justify-end">
        <Button variant="outline" onClick={previewColors}>
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