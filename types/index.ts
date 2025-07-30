export interface Branch {
  id: string;
  name: string;
  location: string;
  created_at: string;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  availability: boolean;
  image_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  branch_id: string;
  table_number: number;
  status: 'New' | 'Preparing' | 'Ready';
  total_amount: number;
  notes?: string;
  created_at: string;
  updated_at: string;
  order_items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  menu_item_id: string;
  quantity: number;
  item_price: number;
  notes?: string;
  created_at: string;
  menu_item?: MenuItem;
}

export interface UserProfile {
  id: string;
  email: string;
  branch_id: string;
  branch?: Branch;
}

export interface CartItem {
  menu_item: MenuItem;
  quantity: number;
  notes?: string;
}