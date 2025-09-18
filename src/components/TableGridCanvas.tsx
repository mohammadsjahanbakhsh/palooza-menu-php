import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Coffee, Users, LogOut, Settings, BarChart3 } from "lucide-react";
import { TableGrid } from "@/components/TableGrid";
import OrderModal from "@/components/OrderModal";
import { Table, User, TableStatus, Hall } from "@/types/cafe";
import { useToast } from "@/hooks/use-toast";

const Dashboard = () => {
  // --- State Declarations (from Code 1) ---
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [halls, setHalls] = useState<Hall[]>([]);
  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  // --- Main Data Fetching Function (from Code 1) ---
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/get_halls_with_tables.php", { credentials: 'include' });
      if (!res.ok) {
        throw new Error('Could not fetch data from the server');
      }
      const data: Hall[] = await res.json();
      setHalls(data);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        title: "خطا در بارگذاری اطلاعات",
        description: "ارتباط با سرور برقرار نشد. لطفا بعدا تلاش کنید.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // --- Effects (from Code 1) ---
  useEffect(() => {
    const user = localStorage.getItem("currentUser");
    if (!user) {
      navigate('/');
      return;
    }
    setCurrentUser(JSON.parse(user));
    fetchData(); // Fetch initial data
  }, [navigate]);

  // --- Handlers (from Code 1 & 2) ---
  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    toast({ title: "خروج موفق", description: "شما با موفقیت از سیستم خارج شدید." });
    navigate('/');
  };

  const handleTableClick = (table: Table) => {
    setSelectedTable(table);
    setOrderModalOpen(true);
  };
  
  // --- Helper Functions (Combined) ---
  const getTableStatusCounts = () => {
    return halls
      .flatMap(hall => hall.tables)
      .reduce((acc, table) => {
        acc[table.status] = (acc[table.status] || 0) + 1;
        return acc;
      }, {} as Record<TableStatus, number>);
  };

  const statusCounts = getTableStatusCounts();
  
  if (isLoading || !currentUser) {
    return <div>در حال بارگذاری...</div>;
  }

  // --- JSX (Appearance from Code 2) ---
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-cream/30 to-coffee-light/20">
      {/* Header */}
      <header className="border-b bg-card/80 backdrop-blur-sm shadow-soft">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-glow rounded-xl flex items-center justify-center">
                <Coffee className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Ravi BookStore</h1>
                <p className="text-sm text-muted-foreground">
                  خوش آمدید، {currentUser.name}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-primary/10 text-primary">
                {currentUser.role === 'admin' ? 'مدیر سیستم' : 'سالن‌دار'}
              </Badge>
              {currentUser.role === 'admin' && (
                <Button variant="outline" size="sm" onClick={() => navigate('/settings')}>
                  <Settings className="w-4 h-4 mr-2" />
                  تنظیمات
                </Button>
              )}
              <Button variant="outline" size="sm">
                <BarChart3 className="w-4 h-4 mr-2" />
                گزارشات
              </Button>
              <Button variant="destructive" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                خروج
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-table-empty/10 border-table-empty/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">میزهای خالی</p>
                  <p className="text-2xl font-bold text-table-empty">{statusCounts.free || 0}</p>
                </div>
                <div className="w-8 h-8 bg-table-empty rounded-full"></div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-table-occupied/10 border-table-occupied/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">در حال سرویس</p>
                  <p className="text-2xl font-bold text-table-occupied">{statusCounts.serving || 0}</p>
                </div>
                <div className="w-8 h-8 bg-table-occupied rounded-full"></div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-table-reserved/10 border-table-reserved/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">رزرو شده</p>
                  <p className="text-2xl font-bold text-table-reserved">{statusCounts.reserved || 0}</p>
                </div>
                <div className="w-8 h-8 bg-table-reserved rounded-full"></div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-table-paid/10 border-table-paid/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">تسویه شده</p>
                  <p className="text-2xl font-bold text-table-paid">{statusCounts.paid || 0}</p>
                </div>
                <div className="w-8 h-8 bg-table-paid rounded-full"></div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tables by Floor (Logic from Code 1, UI from Code 2) */}
        <Tabs defaultValue="1" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="1">طبقه اول</TabsTrigger>
            <TabsTrigger value="2">طبقه دوم</TabsTrigger>
          </TabsList>

          <TabsContent value="1" className="space-y-6">
            {halls.filter(hall => hall.floor_id === 1).map((hall) => (
                <Card key={hall.id} className="shadow-soft">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-primary" />
                      {hall.name}
                    </CardTitle>
                    <CardDescription>{hall.tables.length} میز • طبقه {hall.floor_id}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <TableGrid tables={hall.tables} onTableClick={handleTableClick} />
                  </CardContent>
                </Card>
              ))}
          </TabsContent>

          <TabsContent value="2" className="space-y-6">
            {halls.filter(hall => hall.floor_id === 2).map((hall) => (
                <Card key={hall.id} className="shadow-soft">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-primary" />
                      {hall.name}
                    </CardTitle>
                    <CardDescription>{hall.tables.length} میز • طبقه {hall.floor_id}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <TableGrid tables={hall.tables} onTableClick={handleTableClick} />
                  </CardContent>
                </Card>
              ))}
          </TabsContent>
        </Tabs>

        {/* Order Modal (Logic from Code 1) */}
        <OrderModal
          table={selectedTable}
          open={orderModalOpen}
          onClose={() => setOrderModalOpen(false)}
          onDataRefresh={fetchData}
          currentUser={currentUser}
        />
      </div>
    </div>
  );
};

export default Dashboard;