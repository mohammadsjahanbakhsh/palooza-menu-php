import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Coffee } from "lucide-react";
import { User } from "@/types/cafe";
import { useToast } from "@/hooks/use-toast";
import HallManagement from "@/components/settings/HallManagement";
import TableManagement from "@/components/settings/TableManagement";
import ColorCustomization from "@/components/settings/ColorCustomization";

const Settings = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const user = localStorage.getItem('currentUser');
    if (!user) {
      navigate('/');
      return;
    }
    
    const userData = JSON.parse(user);
    if (userData.role !== 'admin') {
      toast({
        title: "دسترسی غیرمجاز",
        description: "شما اجازه دسترسی به این صفحه را ندارید",
        variant: "destructive"
      });
      navigate('/dashboard');
      return;
    }
    
    setCurrentUser(userData);
  }, [navigate, toast]);

  if (!currentUser) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-cream/30 to-coffee-light/20">
      {/* Header */}
      <header className="border-b bg-card/80 backdrop-blur-sm shadow-soft">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => navigate('/dashboard')}
                className="mr-2"
              >
                <ArrowLeft className="w-4 h-4 ml-2" />
                بازگشت
              </Button>
              
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-glow rounded-xl flex items-center justify-center">
                <Coffee className="w-6 h-6 text-primary-foreground" />
              </div>
              
              <div>
                <h1 className="text-2xl font-bold text-foreground">تنظیمات سیستم</h1>
                <p className="text-sm text-muted-foreground">
                  مدیریت سالن‌ها، میزها و شخصی‌سازی
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <Tabs defaultValue="halls" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="halls">مدیریت سالن‌ها</TabsTrigger>
            <TabsTrigger value="tables">مدیریت میزها</TabsTrigger>
            <TabsTrigger value="colors">شخصی‌سازی رنگ‌ها</TabsTrigger>
          </TabsList>
          
          <TabsContent value="halls">
            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle>مدیریت سالن‌ها</CardTitle>
                <CardDescription>
                  افزودن، ویرایش و حذف سالن‌ها در طبقات مختلف
                </CardDescription>
              </CardHeader>
              <CardContent>
                <HallManagement />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="tables">
            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle>مدیریت میزها</CardTitle>
                <CardDescription>
                  افزودن، ویرایش و حذف میزها در سالن‌های موجود
                </CardDescription>
              </CardHeader>
              <CardContent>
                <TableManagement />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="colors">
            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle>شخصی‌سازی رنگ‌ها</CardTitle>
                <CardDescription>
                  تغییر رنگ وضعیت‌های مختلف میزها
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ColorCustomization />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Settings;