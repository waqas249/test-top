/*
  # Restaurant Order Management System Schema

  1. New Tables
    - `branches`
      - `id` (uuid, primary key)
      - `name` (text)
      - `location` (text) 
      - `created_at` (timestamptz)
    
    - `user_profiles`
      - `id` (uuid, primary key, references auth.users)
      - `email` (text)
      - `branch_id` (uuid, references branches)
      - `created_at` (timestamptz)
    
    - `menu_items`
      - `id` (uuid, primary key)
      - `name` (text)
      - `description` (text)
      - `price` (decimal)
      - `category` (text)
      - `availability` (boolean)
      - `image_url` (text, optional)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `orders`
      - `id` (uuid, primary key)
      - `branch_id` (uuid, references branches)
      - `table_number` (integer)
      - `status` (enum: 'New', 'Preparing', 'Ready')
      - `total_amount` (decimal)
      - `notes` (text, optional)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `order_items`
      - `id` (uuid, primary key)
      - `order_id` (uuid, references orders)
      - `menu_item_id` (uuid, references menu_items)
      - `quantity` (integer)
      - `item_price` (decimal)
      - `notes` (text, optional)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for branch-specific data access
    - Users can only access data for their assigned branch

  3. Data
    - Insert sample branches (Cardiff and Wembley)
    - Insert comprehensive menu items
    - Create user profiles for predefined branch credentials
*/

-- Create custom types
CREATE TYPE order_status AS ENUM ('New', 'Preparing', 'Ready');

-- Create branches table
CREATE TABLE IF NOT EXISTS branches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  location text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create user profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  branch_id uuid REFERENCES branches(id) ON DELETE RESTRICT,
  created_at timestamptz DEFAULT now()
);

-- Create menu items table
CREATE TABLE IF NOT EXISTS menu_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  price decimal(10,2) NOT NULL,
  category text NOT NULL,
  availability boolean DEFAULT true,
  image_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id uuid REFERENCES branches(id) ON DELETE RESTRICT,
  table_number integer NOT NULL,
  status order_status DEFAULT 'New',
  total_amount decimal(10,2) NOT NULL,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create order items table
CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE,
  menu_item_id uuid REFERENCES menu_items(id) ON DELETE RESTRICT,
  quantity integer NOT NULL CHECK (quantity > 0),
  item_price decimal(10,2) NOT NULL,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for branches
CREATE POLICY "Users can read their branch"
  ON branches
  FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT branch_id FROM user_profiles WHERE id = auth.uid()
    )
  );

-- Create RLS policies for user_profiles
CREATE POLICY "Users can read their own profile"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (id = auth.uid());

-- Create RLS policies for menu_items (shared across all branches)
CREATE POLICY "All authenticated users can read menu items"
  ON menu_items
  FOR SELECT
  TO authenticated
  USING (true);

-- Create RLS policies for orders
CREATE POLICY "Users can read orders from their branch"
  ON orders
  FOR SELECT
  TO authenticated
  USING (
    branch_id IN (
      SELECT branch_id FROM user_profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can insert orders for their branch"
  ON orders
  FOR INSERT
  TO authenticated
  WITH CHECK (
    branch_id IN (
      SELECT branch_id FROM user_profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can update orders from their branch"
  ON orders
  FOR UPDATE
  TO authenticated
  USING (
    branch_id IN (
      SELECT branch_id FROM user_profiles WHERE id = auth.uid()
    )
  );

-- Create RLS policies for order_items
CREATE POLICY "Users can read order items from their branch orders"
  ON order_items
  FOR SELECT
  TO authenticated
  USING (
    order_id IN (
      SELECT id FROM orders WHERE branch_id IN (
        SELECT branch_id FROM user_profiles WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can insert order items for their branch orders"
  ON order_items
  FOR INSERT
  TO authenticated
  WITH CHECK (
    order_id IN (
      SELECT id FROM orders WHERE branch_id IN (
        SELECT branch_id FROM user_profiles WHERE id = auth.uid()
      )
    )
  );

-- Insert branches
INSERT INTO branches (id, name, location) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'Cardiff Branch', 'Cardiff'),
  ('550e8400-e29b-41d4-a716-446655440002', 'Wembley Branch', 'Wembley')
ON CONFLICT (id) DO NOTHING;

-- Insert comprehensive menu items
INSERT INTO menu_items (name, description, price, category) VALUES
  -- Starters/Grill
  ('Chicken Tikka', 'Marinated chicken pieces grilled to perfection', 8.95, 'Starters/Grill'),
  ('Lamb Seekh Kebab', 'Spiced minced lamb on skewers', 9.95, 'Starters/Grill'),
  ('Tandoori Chicken', 'Half chicken marinated in yogurt and spices', 12.95, 'Starters/Grill'),
  ('Mixed Grill Platter', 'Selection of grilled meats', 16.95, 'Starters/Grill'),
  ('Chicken Wings', 'Spicy grilled chicken wings', 7.95, 'Starters/Grill'),
  
  -- Special Offers
  ('Family Feast', 'Complete meal for 4-6 people', 45.00, 'Special Offers'),
  ('Lunch Special', 'Curry, rice, naan and drink', 12.95, 'Special Offers'),
  ('Student Deal', 'Any curry with rice or naan', 9.95, 'Special Offers'),
  
  -- Tawa
  ('Chicken Tawa', 'Chicken cooked on traditional tawa', 13.95, 'Tawa'),
  ('Lamb Tawa', 'Tender lamb pieces on tawa', 15.95, 'Tawa'),
  ('Mixed Tawa', 'Chicken and lamb combination', 17.95, 'Tawa'),
  ('Fish Tawa', 'Fresh fish cooked on tawa', 16.95, 'Tawa'),
  
  -- Vegetarian
  ('Dal Tarka', 'Lentils with garlic and cumin', 7.95, 'Vegetarian'),
  ('Palak Paneer', 'Spinach with cottage cheese', 9.95, 'Vegetarian'),
  ('Aloo Gobi', 'Potato and cauliflower curry', 8.95, 'Vegetarian'),
  ('Chana Masala', 'Spiced chickpeas', 8.95, 'Vegetarian'),
  ('Vegetable Biryani', 'Fragrant rice with mixed vegetables', 11.95, 'Vegetarian'),
  
  -- Main Course
  ('Chicken Karahi', 'Traditional chicken curry', 12.95, 'Main Course'),
  ('Lamb Biryani', 'Aromatic rice with tender lamb', 15.95, 'Main Course'),
  ('Chicken Tikka Masala', 'Creamy tomato-based curry', 13.95, 'Main Course'),
  ('Beef Nihari', 'Slow-cooked beef stew', 16.95, 'Main Course'),
  ('Fish Curry', 'Fresh fish in spicy gravy', 14.95, 'Main Course'),
  ('Mutton Karahi', 'Traditional mutton curry', 17.95, 'Main Course'),
  
  -- Sides
  ('Basmati Rice', 'Fragrant long-grain rice', 3.95, 'Sides'),
  ('Naan Bread', 'Fresh baked bread', 2.95, 'Sides'),
  ('Garlic Naan', 'Naan with garlic and herbs', 3.95, 'Sides'),
  ('Raita', 'Yogurt with cucumber and mint', 2.95, 'Sides'),
  ('Pickles', 'Traditional Pakistani pickles', 1.95, 'Sides'),
  ('Chips', 'Crispy potato chips', 3.95, 'Sides'),
  
  -- Drinks - Can
  ('Coke Can', 'Coca Cola 330ml', 1.95, 'Drinks'),
  ('Sprite Can', 'Sprite 330ml', 1.95, 'Drinks'),
  ('Fanta Can', 'Fanta Orange 330ml', 1.95, 'Drinks'),
  
  -- Drinks - Glass Bottle
  ('Coke Glass Bottle', 'Coca Cola 330ml glass bottle', 2.95, 'Drinks'),
  ('7UP Glass Bottle', '7UP 330ml glass bottle', 2.95, 'Drinks'),
  
  -- Drinks - Water
  ('Still Water', '500ml still water', 1.50, 'Drinks'),
  ('Sparkling Water', '500ml sparkling water', 2.50, 'Drinks'),
  
  -- Drinks - Big Bottle
  ('Coke 1.5L', 'Coca Cola 1.5L bottle', 4.95, 'Drinks'),
  ('Sprite 1.5L', 'Sprite 1.5L bottle', 4.95, 'Drinks'),
  
  -- Drinks - Hot
  ('Chai Tea', 'Traditional spiced tea', 2.95, 'Drinks'),
  ('Coffee', 'Fresh brewed coffee', 2.95, 'Drinks'),
  ('Green Tea', 'Healthy green tea', 2.95, 'Drinks'),
  
  -- Drinks - Lassi
  ('Mango Lassi', 'Sweet mango yogurt drink', 3.95, 'Drinks'),
  ('Plain Lassi', 'Traditional yogurt drink', 3.50, 'Drinks'),
  ('Salted Lassi', 'Savory yogurt drink', 3.50, 'Drinks')
ON CONFLICT DO NOTHING;

-- Function to create user profile on signup
CREATE OR REPLACE FUNCTION create_user_profile()
RETURNS TRIGGER AS $$
DECLARE
  branch_id_var uuid;
BEGIN
  -- Determine branch based on email
  IF NEW.email = 'cardiff@tasteofpeshawar.com' THEN
    branch_id_var := '550e8400-e29b-41d4-a716-446655440001';
  ELSIF NEW.email = 'wembley@tasteofpeshawar.com' THEN
    branch_id_var := '550e8400-e29b-41d4-a716-446655440002';
  ELSE
    RETURN NEW; -- Skip profile creation for other emails
  END IF;

  -- Insert user profile
  INSERT INTO user_profiles (id, email, branch_id)
  VALUES (NEW.id, NEW.email, branch_id_var);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for automatic user profile creation
DROP TRIGGER IF EXISTS create_user_profile_trigger ON auth.users;
CREATE TRIGGER create_user_profile_trigger
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION create_user_profile();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_menu_items_updated_at
  BEFORE UPDATE ON menu_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();