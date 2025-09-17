import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit2, Trash2, Users, Building } from "lucide-react";
import { Hall } from "@/types/cafe";
import { useToast } from "@/hooks/use-toast";

const HallManagement = () => {
  const [halls, setHalls] = useState<Hall[]>([]);
  const [selectedHall, setSelectedHall] = useState<Hall | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "", floor_id: 1 });
  const { toast } = useToast();

  // 1. Function to fetch live data from your API
  const fetchHalls = async () => {
    try {
      const response = await fetch('/api/get_halls.php', { credentials: 'include'});
      if (!response.ok) throw new Error("Network response was not ok.");
      const data = await response.json();
      setHalls(data);
    } catch (error) {
      toast({
        title: "خطا در دریافت اطلاعات",
        description: "اتصال به سرور برای دریافت لیست سالن‌ها برقرار نشد.",
        variant: "destructive",
      });
    }
  };

  // 2. useEffect to call fetchHalls once when the component loads
  useEffect(() => {
    fetchHalls();
  }, []);

  const handleAddHall = () => {
    setSelectedHall(null);
    setFormData({ name: "", floor_id: 1 });
    setIsDialogOpen(true);
  };

  const handleEditHall = (hall: Hall) => {
    setSelectedHall(hall);
    setFormData({ name: hall.name, floor_id: hall.floor_id });
    setIsDialogOpen(true);
  };

  const handleDeleteHall = async (hallId: string) => {
    // This check is good for UI, but the final check should be on the server
    const hallToDelete = halls.find(h => h.id === hallId);
    if (hallToDelete && hallToDelete.tables.length > 0) {
      toast({
        title: "خطا در حذف سالن",
        description: "ابتدا تمام میزهای سالن را حذف کنید",
        variant: "destructive",
      });
      return;
    }
    
    // 3. Send delete request to your API
    try {
      const response = await fetch(`/api/delete_hall.php?id=${hallId}`,
        { method: 'DELETE', credentials: 'include' });
      if (!response.ok) throw new Error("Failed to delete.");
      
      toast({ title: "سالن حذف شد", description: "سالن با موفقیت حذف شد" });
      fetchHalls(); // Refresh the list from the server
    } catch (error) {
      toast({ title: "خطا", description: "حذف سالن با مشکل مواجه شد", variant: "destructive" });
    }
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast({ title: "خطا در ثبت", description: "نام سالن الزامی است", variant: "destructive" });
      return;
    }
    
    // 4. Send create/update request to your API
    const endpoint = selectedHall ? '/api/update_hall.php' : '/api/create_hall.php';
    const body = JSON.stringify({
      id: selectedHall?.id,
      ...formData
    });

    try {
      const response = await fetch(endpoint, {
        credentials: 'include',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: body,
      });

      if (!response.ok) throw new Error("Failed to save.");

      toast({
        title: selectedHall ? "سالن بروزرسانی شد" : "سالن اضافه شد",
        description: `اطلاعات با موفقیت ${selectedHall ? 'بروزرسانی' : 'اضافه'} شد`,
      });
      
      fetchHalls(); // Refresh the list from the server
      setIsDialogOpen(false);

    } catch (error) {
      toast({ title: "خطا", description: "ذخیره اطلاعات با مشکل مواجه شد", variant: "destructive" });
    }
  };

  const getfloor_idLabel = (floor_id: number) => {
    return floor_id === 1 ? "طبقه اول" : "طبقه دوم";
  };

  return (
    <div className="space-y-6">
      {/* Add Hall Button and Dialog (Your original code, no changes needed here) */}
      <div className="flex justify-end">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleAddHall} className="gap-2">
              <Plus className="w-4 h-4" />
              افزودن سالن جدید
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                {selectedHall ? "ویرایش سالن" : "افزودن سالن جدید"}
              </DialogTitle>
              <DialogDescription>
                اطلاعات سالن را وارد کنید
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="hall-name">نام سالن</Label>
                <Input
                  id="hall-name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="مثال: سالن TV"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="hall-floor_id">طبقه</Label>
                <Select 
                  value={formData.floor_id.toString()} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, floor_id: parseInt(value) }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="انتخاب طبقه" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">طبقه اول</SelectItem>
                    <SelectItem value="2">طبقه دوم</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                انصراف
              </Button>
              <Button onClick={handleSubmit}>
                {selectedHall ? "بروزرسانی" : "افزودن"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Halls List (Your original code, no changes needed here) */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {halls.map((hall) => (
          <Card key={hall.id} className="relative">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Building className="w-5 h-5 text-primary" />
                  {hall.name}
                </CardTitle>
                <Badge variant="secondary">
                  {getfloor_idLabel(hall.floor_id)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="w-4 h-4" />
                <span>{hall.tables.length} میز</span>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => handleEditHall(hall)} className="flex-1">
                  <Edit2 className="w-4 h-4 mr-2" />
                  ویرایش
                </Button>
                <Button variant="destructive" size="sm" onClick={() => handleDeleteHall(hall.id)} className="flex-1">
                  <Trash2 className="w-4 h-4 mr-2" />
                  حذف
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State (Your original code, no changes needed here) */}
      {halls.length === 0 && (
        <div className="text-center py-12">
          <Building className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-muted-foreground mb-2">
            هیچ سالنی یافت نشد
          </h3>
          <p className="text-sm text-muted-foreground">
            برای شروع، یک سالن جدید اضافه کنید
          </p>
        </div>
      )}
    </div>
  );
};

export default HallManagement;