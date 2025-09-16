// types/cafe.ts

export interface User {
  id: string;
  username: string;
  name: string;
  role: 'admin' | 'waiter';
  avatar?: string;
}

export interface Hall {
  id: string;
  name: string;
  floor_id: number;
  tables: Table[];
}
export type TableStatus = 'empty' | 'reserved' | 'occupied' | 'paid';

export interface Table {
  id: string;
  name: string;
  capacity: number;
  status: TableStatus;
  hallId: string;
  currentOrder?: Order;
  reservationTime?: Date;
  lastActivity?: Date;
}


export interface MenuCategory {
  id: number;
  name: string;
}

export interface MenuItem {
  id: number;
  category_id: number;
  name: string;
  price: number;
  is_100_arabica: boolean;
}

export interface OrderItem {
  id: string;
  menuItem: MenuItem;
  quantity: number;
  notes?: string;
  isPaid?: boolean;
}

export interface Order {
  id: string;
  tableId: string;
  waiterId: string;
  items: OrderItem[];
  status: 'pending' | 'preparing' | 'ready' | 'completed';
  totalAmount: number;
  paidAmount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface SalesReport {
  date: string;
  totalSales: number;
  orderCount: number;
  topItems: MenuItem[];
  waiterPerformance: WaiterPerformance[];
}

export interface WaiterPerformance {
  waiterId: string;
  waiterName: string;
  orderCount: number;
  totalSales: number;
}