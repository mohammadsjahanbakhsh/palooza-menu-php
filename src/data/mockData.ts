import { Hall, Table, MenuCategory, MenuItem } from "@/types/cafe";

// Mock halls and tables structure based on the cafe layout
export const mockHalls: Hall[] = [
  {
    id: "floor1-tv",
    name: "سالن TV",
    floor: 1,
    tables: [
      { id: "A1", name: "A1", capacity: 4, status: "empty", hallId: "floor1-tv", lastActivity: new Date() },
      { id: "A2", name: "A2", capacity: 2, status: "occupied", hallId: "floor1-tv", lastActivity: new Date(Date.now() - 45 * 60000) },
      { id: "A3", name: "A3", capacity: 6, status: "reserved", hallId: "floor1-tv", reservationTime: new Date(Date.now() + 30 * 60000) },
      { id: "A4", name: "A4", capacity: 4, status: "paid", hallId: "floor1-tv", lastActivity: new Date() },
      { id: "A5", name: "A5", capacity: 2, status: "empty", hallId: "floor1-tv", lastActivity: new Date() },
    ]
  },
  {
    id: "floor1-center",
    name: "سالن وسط",
    floor: 1,
    tables: [
      { id: "A6", name: "A6", capacity: 4, status: "occupied", hallId: "floor1-center", lastActivity: new Date(Date.now() - 20 * 60000) },
      { id: "A7", name: "A7", capacity: 2, status: "empty", hallId: "floor1-center", lastActivity: new Date() },
    ]
  },
  {
    id: "floor1-original",
    name: "سالن اورجینال", 
    floor: 1,
    tables: [
      { id: "A8", name: "A8", capacity: 4, status: "reserved", hallId: "floor1-original", reservationTime: new Date(Date.now() + 60 * 60000) },
      { id: "A9", name: "A9", capacity: 6, status: "empty", hallId: "floor1-original", lastActivity: new Date() },
    ]
  },
  {
    id: "floor2-art",
    name: "سالن هنر",
    floor: 2,
    tables: [
      { id: "C1", name: "C1", capacity: 2, status: "occupied", hallId: "floor2-art", lastActivity: new Date(Date.now() - 15 * 60000) },
      { id: "C2", name: "C2", capacity: 4, status: "empty", hallId: "floor2-art", lastActivity: new Date() },
      { id: "C3", name: "C3", capacity: 2, status: "paid", hallId: "floor2-art", lastActivity: new Date() },
      { id: "C4", name: "C4", capacity: 6, status: "empty", hallId: "floor2-art", lastActivity: new Date() },
      { id: "C5", name: "C5", capacity: 4, status: "reserved", hallId: "floor2-art", reservationTime: new Date(Date.now() + 90 * 60000) },
      { id: "C6", name: "C6", capacity: 2, status: "empty", hallId: "floor2-art", lastActivity: new Date() },
      { id: "V1", name: "V1", capacity: 8, status: "occupied", hallId: "floor2-art", lastActivity: new Date(Date.now() - 60 * 60000) },
    ]
  },
  {
    id: "floor2-roof",
    name: "روف",
    floor: 2,
    tables: Array.from({ length: 17 }, (_, i) => ({
      id: `B${i + 8}`,
      name: `B${i + 8}`,
      capacity: Math.random() > 0.5 ? 4 : 2,
      status: ["empty", "occupied", "reserved", "paid"][Math.floor(Math.random() * 4)] as any,
      hallId: "floor2-roof",
      lastActivity: new Date(Date.now() - Math.random() * 120 * 60000),
    }))
  }
];

// Get all tables flattened
export const getAllTables = (): Table[] => {
  return mockHalls.flatMap(hall => hall.tables);
};

// Menu categories from the provided data
export const menuCategories: MenuCategory[] = [
  { id: 1, name: "نوشیدنی گرم بر پایه قهوه" },
  { id: 2, name: "نوشیدنی سرد بر پایه قهوه" },
  { id: 3, name: "نوشیدنی گرم غیرقهوه‌ای" },
  { id: 4, name: "دمی بار" },
  { id: 5, name: "چای و دمنوش‌ها" },
  { id: 6, name: "میلک‌شیک‌ها" },
  { id: 7, name: "شربت‌ها" },
  { id: 8, name: "پروتئین بار" },
  { id: 9, name: "ماکتیل‌ها" },
  { id: 10, name: "ماچابار" },
  { id: 11, name: "اسموتی‌ها" },
  { id: 12, name: "افزودنی‌ها" },
  { id: 13, name: "بیکری و پیستری" },
];

// Sample menu items (selection from the provided data)
export const menuItems: MenuItem[] = [
  { id: 1, category_id: 1, name: "اسپرسو (50/50)", price: 93000, is_100_arabica: false },
  { id: 2, category_id: 1, name: "اسپرسو (100% عربیکا)", price: 103000, is_100_arabica: true },
  { id: 7, category_id: 1, name: "کاپوچینو (50/50)", price: 105000, is_100_arabica: false },
  { id: 8, category_id: 1, name: "کاپوچینو (100% عربیکا)", price: 115000, is_100_arabica: true },
  { id: 9, category_id: 1, name: "لاته (50/50)", price: 110000, is_100_arabica: false },
  { id: 10, category_id: 1, name: "لاته (100% عربیکا)", price: 120000, is_100_arabica: true },
  
  { id: 18, category_id: 2, name: "آیس لاته (50/50)", price: 115000, is_100_arabica: false },
  { id: 19, category_id: 2, name: "آیس لاته (100% عربیکا)", price: 125000, is_100_arabica: true },
  { id: 22, category_id: 2, name: "آیس موکا", price: 125000, is_100_arabica: false },
  
  { id: 29, category_id: 3, name: "هات چاکلت", price: 110000, is_100_arabica: false },
  { id: 33, category_id: 3, name: "ماسالا", price: 98000, is_100_arabica: false },
  { id: 34, category_id: 3, name: "ماسالا اسپایسی", price: 150000, is_100_arabica: false },
  
  { id: 44, category_id: 5, name: "چای کلاسیک", price: 82000, is_100_arabica: false },
  { id: 45, category_id: 5, name: "چای زعفران", price: 88000, is_100_arabica: false },
  { id: 47, category_id: 5, name: "چای سبز و نعنا", price: 90000, is_100_arabica: false },
  
  { id: 60, category_id: 6, name: "شکلات", price: 145000, is_100_arabica: false },
  { id: 64, category_id: 6, name: "قهوه", price: 160000, is_100_arabica: false },
  { id: 65, category_id: 6, name: "نوتلا", price: 190000, is_100_arabica: false },
  
  { id: 104, category_id: 13, name: "کیک هویچ گردو", price: 139000, is_100_arabica: false },
  { id: 105, category_id: 13, name: "چیز کیک کارامل", price: 149000, is_100_arabica: false },
  { id: 106, category_id: 13, name: "چیز کیک نوتلا", price: 170000, is_100_arabica: false },
];