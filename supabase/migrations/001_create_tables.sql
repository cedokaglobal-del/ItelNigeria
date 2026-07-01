-- Create products table
CREATE TABLE IF NOT EXISTS products (
  slug TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  brand TEXT NOT NULL,
  category TEXT NOT NULL,
  price DOUBLE PRECISION NOT NULL,
  "originalPrice" DOUBLE PRECISION,
  images JSONB DEFAULT '[]'::jsonb,
  rating DOUBLE PRECISION DEFAULT 0,
  reviews INTEGER DEFAULT 0,
  tagline TEXT NOT NULL,
  badge TEXT,
  spec TEXT NOT NULL,
  highlights JSONB DEFAULT '[]'::jsonb,
  description TEXT NOT NULL,
  warranty TEXT NOT NULL,
  "inStock" BOOLEAN DEFAULT true,
  tags JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Allow anonymous read access
CREATE POLICY "Allow anonymous read access" ON products
  FOR SELECT USING (true);

-- Allow service role full access (admin operations via service_role key)
CREATE POLICY "Allow service role insert" ON products
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow service role update" ON products
  FOR UPDATE USING (true);

CREATE POLICY "Allow service role delete" ON products
  FOR DELETE USING (true);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  date TIMESTAMPTZ NOT NULL,
  customer JSONB NOT NULL,
  items JSONB NOT NULL,
  subtotal DOUBLE PRECISION NOT NULL,
  shipping DOUBLE PRECISION NOT NULL,
  total DOUBLE PRECISION NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  payment TEXT NOT NULL DEFAULT 'transfer',
  address JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous insert" ON orders
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow service role all" ON orders
  FOR ALL USING (true);

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  blurb TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous read" ON categories
  FOR SELECT USING (true);

CREATE POLICY "Allow service role all" ON categories
  FOR ALL USING (true);

-- Create solar_systems table
CREATE TABLE IF NOT EXISTS solar_systems (
  slug TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  tagline TEXT NOT NULL,
  description TEXT,
  images JSONB DEFAULT '[]'::jsonb,
  badge TEXT,
  rating DOUBLE PRECISION DEFAULT 0,
  reviews INTEGER DEFAULT 0,
  voltage TEXT NOT NULL,
  "totalPanels" INTEGER NOT NULL,
  "panelWattage" INTEGER NOT NULL,
  "inverterKVA" DOUBLE PRECISION NOT NULL,
  "batteryCapacityKWh" DOUBLE PRECISION NOT NULL,
  "batteryType" TEXT NOT NULL,
  "totalArrayKW" DOUBLE PRECISION NOT NULL,
  price DOUBLE PRECISION NOT NULL,
  "originalPrice" DOUBLE PRECISION,
  "whatItPowers" TEXT NOT NULL,
  components JSONB DEFAULT '[]'::jsonb,
  "installationAccessories" JSONB DEFAULT '[]'::jsonb,
  highlights JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE solar_systems ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous read" ON solar_systems
  FOR SELECT USING (true);

CREATE POLICY "Allow service role all" ON solar_systems
  FOR ALL USING (true);

-- Create a function to check if tables exist (used by setup page)
CREATE OR REPLACE FUNCTION check_tables_exist()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result jsonb;
BEGIN
  SELECT jsonb_build_object(
    'products', EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'products'),
    'orders', EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'orders'),
    'categories', EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'categories'),
    'solar_systems', EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'solar_systems')
  ) INTO result;
  RETURN result;
END;
$$;
