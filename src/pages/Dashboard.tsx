import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Coffee, Users, LogOut, Settings, BarChart3 } from "lucide-react";
import { TableGrid } from "@/components/TableGrid";
import OrderModal from "@/components/OrderModal";
import { Table, User, TableStatus, Hall } from "@/types/cafe"; // Correctly import all needed types
import { useToast } from "@/hooks/use-toast";

const Dashboard = () => {
  // --- State Declarations ---
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [halls, setHalls] = useState<Hall[]>([]); // For holding hall data from API
  const [allTables, setAllTables] = useState<Table[]>([]); // For holding all tables from API
  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // --- Effects ---
  // Effect to check for logged-in user
  useEffect(() => {
    const user = localStorage.getItem("currentUser");
    if (!user) {
      navigate('/');
      return;
    }
    setCurrentUser(JSON.parse(user));
  }, [navigate]);

  // Effect to fetch hall and table data from the API
  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch("/api/get_halls.php"); // Your API endpoint
        if (!res.ok) {
          throw new Error('Failed to fetch data from server');
        }
        const data: Hall[] = await res.json();
        setHalls(data);
        setAllTables(data.flatMap(hall => hall.tables));
      } catch (err) {
        console.error("Error fetching data:", err);
        toast({
          title: "خطا در بارگذاری داده‌ها",
          description: "ارتباط با سرور برقرار نشد. لطفاً از صحت عملکرد API مطمئن شوید.",
          variant: "destructive",
        });
      }
    }
    loadData();
  }, [toast]); // Runs once when the component mounts

  // --- Handlers ---
  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    toast({ title: "خروج موفق", description: "با موفقیت از سیستم خارج شدید" });
    navigate('/');
  };

  const handleTableClick = (table: Table) => {
    setSelectedTable(table);
    setOrderModalOpen(true);
  };

  const handleUpdateTableStatus = (tableId: string, newStatus: TableStatus) => {
    // Note: This updates the local state. You'll also need to send this update to your API.
    setAllTables(prevTables =>
      prevTables.map(table =>
        table.id === tableId
          ? { ...table, status: newStatus, lastActivity: new Date() }
          : table
      )
    );
    // You should also update the 'halls' state to keep it in sync
    setHalls(prevHalls => 
      prevHalls.map(hall => ({
        ...hall,
        tables: hall.tables.map(table => 
          table.id === tableId ? { ...table, status: newStatus, lastActivity: new Date() } : table
        )
      }))
    );
    toast({
      title: "وضعیت میز بروزرسانی شد",
      description: `میز ${tableId} به وضعیت ${getTableStatusLabel(newStatus)} تغییر کرد`,
    });
  };

  // --- Helper Functions ---
  const getTableStatusLabel = (status: TableStatus) => {
    const labels = {
      empty: "خالی",
      reserved: "رزرو شده",
      occupied: "در حال سرویس",
      paid: "تسویه شده",
    };
    return labels[status] || status;
  };

  const getTableStatusCounts = () => {
    return allTables.reduce((acc, table) => {
      acc[table.status] = (acc[table.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  };

  const statusCounts = getTableStatusCounts();

  if (!currentUser) {
    return <div>Loading...</div>;
  }

  // --- JSX ---
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
                    <p className="text-2xl font-bold text-table-empty">{statusCounts.empty || 0}</p>
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
                    <p className="text-2xl font-bold text-table-occupied">{statusCounts.occupied || 0}</p>
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

        {/* Tables by Floor */}
        <Tabs defaultValue="floor1" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="floor1">طبقه اول</TabsTrigger>
            <TabsTrigger value="floor2">طبقه دوم</TabsTrigger>
          </TabsList>

          <TabsContent value="floor1" className="space-y-6">
            {halls
              .filter(hall => String(hall.floor_id) === '1')
              .map((hall) => (
                <Card key={hall.id} className="shadow-soft">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-primary" />
                      {hall.name}
                    </CardTitle>
                    <CardDescription>
                      {hall.tables.length} میز • طبقه {hall.floor_id}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <TableGrid
                      tables={hall.tables}
                      onTableClick={handleTableClick}
                    />
                  </CardContent>
                </Card>
              ))}
          </TabsContent>

          <TabsContent value="floor2" className="space-y-6">
            {halls
              .filter(hall => String(hall.floor_id) === '2')
              .map((hall) => (
                <Card key={hall.id} className="shadow-soft">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-primary" />
                      {hall.name}
                    </CardTitle>
                    <CardDescription>
                      {hall.tables.length} میز • طبقه {hall.floor_id}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <TableGrid
                      tables={hall.tables}
                      onTableClick={handleTableClick}
                    />
                  </CardContent>
                </Card>
              ))}
          </TabsContent>
        </Tabs>

        {/* Order Modal */}
        <OrderModal
          table={selectedTable}
          open={orderModalOpen}
          onClose={() => setOrderModalOpen(false)}
          onUpdateTableStatus={handleUpdateTableStatus}
        />
      </div>
    </div>
  );
};

export default Dashboard;