import { useState } from "react";
import { useNavigate,Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Coffee, Lock, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import backgroundIndex from "@/assets/ravi.jpg";

// import backgroundIndex from '../assets/backgroundindex.png'
import logo from '../assets/bookstore-logo-BdxIlNK5.jpg'
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
    <div
      className="min-h-screen relative overflow-hidden"
      style={{ backgroundImage: `url(${backgroundIndex})` }}
      dir="rtl"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-background/90 via-coffee-dark/60 to-primary/80 backdrop-blur-[2px]"></div>

      {/* Content */}
      <div
        className="relative z-10 w-full max-w-sm sm:max-w-md lg:max-w-lg mx-auto
                      bg-white bg-opacity-90 border border-white rounded-2xl
                      p-6 sm:p-10 flex flex-col items-center"
      >
        {" "}
        <div className="w-full max-w-md space-y">
          {/* Logo & Brand */}
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-300 rounded-2xl flex items-center justify-center shadow-floating mb-4">
              <Coffee className="w-8 h-8 text-white" />{" "}
              {/* رنگ آیکون کاپ را هم برای هماهنگی سفید کردم */}
            </div>
            <p className="text-cream mt-2 font-medium">کتاب فروشی راوی</p>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-[#FF8C00] to-[#FFA500] bg-clip-text text-transparent">
              ravi bookstore
            </h1>
          </div>

          {/* Login Form */}
          <Card className="shadow-soft border-0 bg-card/80 backdrop-blur">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-2xl">ورود به سیستم</CardTitle>
              
            </CardHeader>

            <CardContent>
              <form onSubmit={handleLogin} className="space-y-2">
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
                  className="w-full h-10 px-4 py-2 text-white text-sm font-medium rounded-md
             bg-gradient-to-r from-orange-500 to-orange-300
             hover:shadow-lg transition-all duration-300
             inline-flex items-center justify-center"
                  disabled={isLoading}
                >
                  {isLoading ? "در حال ورود..." : "ورود"}
                </Button>
              </form>
              <div className="mt-4 text-center">
                <Link
                  to="/register"
                  className="text-[hsl(var(--primary))] hover:underline"
                >
                  برو به صفحه ثبت‌نام ←
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Demo Credentials */}
          <Card className="bg-muted/50 border-accent/20">
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground text-center mb-3">
                حساب‌های تست:
              </p>
              <div className="text-xs space-y-1 text-center">
                <div>
                  <strong>ادمین:</strong> admin / 123123
                </div>
                <div>
                  <strong>سالن‌دار:</strong> ؟؟؟؟؟
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Login;