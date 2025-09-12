import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background to-muted/30">
      <div className="text-center space-y-6">
        <h1 className="text-6xl font-bold text-primary">۴۰۴</h1>
        <p className="text-2xl text-muted-foreground">صفحه مورد نظر یافت نشد</p>
        <p className="text-lg text-muted-foreground">
          صفحه‌ای که دنبال آن می‌گردید وجود ندارد
        </p>
        <Button 
          variant="persian" 
          size="lg"
          asChild
          className="mt-6"
        >
          <a href="/">بازگشت به صفحه اصلی</a>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
