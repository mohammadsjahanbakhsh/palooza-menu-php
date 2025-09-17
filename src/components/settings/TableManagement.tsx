// /components/TableManagement.tsx

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit2, Trash2, Users, Table as TableIcon } from "lucide-react";
import { Hall, Table, TableStatus } from "@/types/cafe";
import { useToast } from "@/hooks/use-toast";

const TableManagement = () => {
  const [halls, setHalls] = useState<Hall[]>([]);
  const [selectedTable, setSelectedTable] = useState<(Table & { hallName?: string }) | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    capacity: 2,
    hallId: "",
    status: "free" as TableStatus,
  });
  const { toast } = useToast();

  const fetchData = async () => {
    try {
      const response = await fetch('/api/get_halls.php',{credentials: 'include'});
      if (!response.ok) throw new Error("Network response was not ok.");
      const data: Hall[] = await response.json();
      setHalls(data);
    } catch (error) {
      console.error("Fetch error:", error);
      toast({
        title: "خطا در دریافت اطلاعات",
        description: "اتصال به سرور برای دریافت لیست میزها برقرار نشد.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddTable = () => {
    setSelectedTable(null);
    setFormData({ name: "", capacity: 2, hallId: "", status: "free" });
    setIsDialogOpen(true);
  };

  const handleEditTable = (table: Table & { hallName?: string }) => {
    setSelectedTable(table);
    setFormData({
      name: table.name,
      capacity: table.capacity,
      hallId: table.hallId,
      status: table.status,
    });
    setIsDialogOpen(true);
  };
  
  const handleDeleteTable = async (tableId: string) => {
    try {
      const response = await fetch('/api/delete_table.php', {
        credentials: 'include',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: tableId }),
      });
      if (!response.ok) throw new Error("Failed to delete table");
      toast({ title: "میز حذف شد", description: "میز با موفقیت از سیستم حذف شد." });
      fetchData();
    } catch (error) {
      toast({ title: "خطا در حذف", description: "ارتباط با سرور برای حذف میز ناموفق بود.", variant: "destructive" });
    }
  };

  const handleSubmit = async () => {
    if (!formData.name.trim() || !formData.hallId) {
      toast({ title: "خطا در ثبت", description: "نام میز و انتخاب سالن الزامی است", variant: "destructive" });
      return;
    }

    const isEditing = !!selectedTable;
    const endpoint = isEditing ? '/api/update_table.php' : '/api/create_table.php';
    const body = JSON.stringify({
      id: isEditing ? selectedTable.id : undefined,
      ...formData,
    });

    try {
      const response = await fetch(endpoint, {
        credentials: 'include',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: body,
      });
      if (!response.ok) throw new Error("Failed to save table");
      toast({
        title: isEditing ? "میز بروزرسانی شد" : "میز اضافه شد",
        description: "اطلاعات با موفقیت در دیتابیس ذخیره شد",
      });
      fetchData();
      setIsDialogOpen(false);
    } catch(error) {
      toast({ title: "خطا در ذخیره‌سازی", description: "ارتباط با سرور با مشکل مواجه شد", variant: "destructive" });
    }
  };

  const getStatusLabel = (status: TableStatus) => ({
    free: "خالی",
    reserved: "رزرو شده",
    serving: "در حال سرویس",
    paid: "تسویه شده",
  }[status]);

  const getStatusColor = (status: TableStatus) => ({
    free: "bg-green-500",
    reserved: "bg-yellow-500",
    serving: "bg-blue-500",
    paid: "bg-purple-500",
  }[status]);
  
  const getAllTables = (halls: Hall[]) => {
    return halls.flatMap(hall =>
      hall.tables.map(table => ({
        ...table,
        hallName: hall.name,
      }))
    );
  };
  
  const allTables = getAllTables(halls);

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleAddTable} className="gap-2">
              <Plus className="w-4 h-4" />
              افزودن میز جدید
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{selectedTable ? "ویرایش میز" : "افزودن میز جدید"}</DialogTitle>
              <DialogDescription>اطلاعات میز را وارد کنید.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="table-name">نام میز</Label>
                <Input
                  id="table-name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="مثال: A1"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="table-capacity">ظرفیت</Label>
                <Select
                  value={formData.capacity.toString()}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, capacity: parseInt(value) }))}
                >
                  <SelectTrigger><SelectValue placeholder="انتخاب ظرفیت" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2">2 نفره</SelectItem>
                    <SelectItem value="4">4 نفره</SelectItem>
                    <SelectItem value="6">6 نفره</SelectItem>
                    <SelectItem value="8">8 نفره</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="table-hall">سالن</Label>
                <Select
                  value={formData.hallId}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, hallId: value }))}
                >
                  <SelectTrigger><SelectValue placeholder="انتخاب سالن" /></SelectTrigger>
                  <SelectContent>
                    {halls.map((hall) => (
                      <SelectItem key={hall.id} value={hall.id}>
                        {hall.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {selectedTable && (
                 <div className="grid gap-2">
                    <Label htmlFor="table-status">وضعیت</Label>
                    <Select 
                      value={formData.status} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as TableStatus }))}
                    >
                      <SelectTrigger><SelectValue placeholder="انتخاب وضعیت" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="free">خالی</SelectItem>
                        <SelectItem value="reserved">رزرو شده</SelectItem>
                        <SelectItem value="serving">در حال سرویس</SelectItem>
                        <SelectItem value="paid">تسویه شده</SelectItem>
                      </SelectContent>
                    </Select>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>انصراف</Button>
              <Button onClick={handleSubmit}>{selectedTable ? "بروزرسانی" : "افزودن"}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {allTables.map((table) => (
          <Card key={table.id} className="relative">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <TableIcon className="w-5 h-5 text-primary" />
                  {table.name}
                </CardTitle>
                <Badge variant="secondary" className={`text-xs ${getStatusColor(table.status)} text-white`}>
                  {getStatusLabel(table.status)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2"><Users className="w-4 h-4" /><span>{table.capacity} نفره</span></div>
                <div><span className="font-medium">سالن:</span> {table.hallName}</div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => handleEditTable(table)} className="flex-1"><Edit2 className="w-4 h-4 ml-2" />ویرایش</Button>
                <Button variant="destructive" size="sm" onClick={() => handleDeleteTable(table.id)} className="flex-1"><Trash2 className="w-4 h-4 ml-2" />حذف</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      {allTables.length === 0 && (
        <div className="text-center py-12 col-span-full">
          <TableIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-muted-foreground mb-2">هیچ میزی یافت نشد</h3>
          <p className="text-sm text-muted-foreground">برای شروع، یک میز جدید اضافه کنید.</p>
        </div>
      )}
    </div>
  );
};
export default TableManagement;