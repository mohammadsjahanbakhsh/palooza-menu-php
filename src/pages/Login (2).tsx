import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Coffee, Lock, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import cafeHero from "@/assets/cafe-hero.jpg";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate login - In real app, this would connect to backend
    setTimeout(() => {
      if (username && password) {
        localStorage.setItem('currentUser', JSON.stringify({
          id: '1',
          username,
          name: username === 'admin' ? 'مدیر سیستم' : 'سالن‌دار',
          role: username === 'admin' ? 'admin' : 'waiter'
        }));
        
        toast({
          title: "ورود موفق",
          description: "به سامانه مدیریت کافه خوش آمدید",
        });
        
        navigate("/dashboard");
      } else {
        toast({
          title: "خطا در ورود",
          description: "نام کاربری و رمز عبور را وارد کنید",
          variant: "destructive"
        });
      }
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${cafeHero})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-background/90 via-coffee-dark/60 to-primary/80 backdrop-blur-[2px]"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-8">
          {/* Logo & Brand */}
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-primary to-primary-glow rounded-2xl flex items-center justify-center shadow-floating mb-4">
              <Coffee className="w-8 h-8 text-primary-foreground" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Mah.World Café
            </h1>
            <p className="text-cream mt-2 font-medium">سامانه مدیریت کافه</p>
          </div>

          {/* Login Form */}
          <Card className="shadow-soft border-0 bg-card/80 backdrop-blur">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-2xl">ورود به سیستم</CardTitle>
              <CardDescription>
                برای دسترسی به پنل مدیریت وارد شوید
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="username">نام کاربری</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="pl-10 bg-background/50"
                      placeholder="admin یا نام سالن‌دار"
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password">رمز عبور</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 bg-background/50"
                      placeholder="رمز عبور خود را وارد کنید"
                      required
                    />
                  </div>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-primary to-primary-glow hover:shadow-floating transition-all duration-300"
                  disabled={isLoading}
                >
                  {isLoading ? "در حال ورود..." : "ورود"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Demo Credentials */}
          <Card className="bg-muted/50 border-accent/20">
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground text-center mb-3">
                حساب‌های تست:
              </p>
              <div className="text-xs space-y-1 text-center">
                <div><strong>ادمین:</strong> admin / admin</div>
                <div><strong>سالن‌دار:</strong> waiter1 / 123456</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Login;