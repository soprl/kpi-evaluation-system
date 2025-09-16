-- KPI Evaluation System - Minimal Supabase Setup
-- Sadece tablolar ve temel konfigürasyon

-- Çalışanlar tablosu
CREATE TABLE IF NOT EXISTS employees (
    id BIGSERIAL PRIMARY KEY,
    full_name TEXT NOT NULL,
    position TEXT,
    department TEXT,
    evaluation_period TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- KPI verileri tablosu
CREATE TABLE IF NOT EXISTS kpi_data (
    id BIGSERIAL PRIMARY KEY,
    employee_id BIGINT REFERENCES employees(id) ON DELETE CASCADE,
    kpi_index INTEGER NOT NULL,
    kpi_title TEXT NOT NULL,
    target_value REAL NOT NULL DEFAULT 0,
    achieved_value REAL NOT NULL DEFAULT 0,
    unit TEXT DEFAULT '',
    percentage REAL NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- İndeksler
CREATE INDEX IF NOT EXISTS idx_kpi_employee_id ON kpi_data(employee_id);
CREATE INDEX IF NOT EXISTS idx_employees_updated_at ON employees(updated_at DESC);

-- Otomatik updated_at güncellemesi
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_employees_updated_at
    BEFORE UPDATE ON employees
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- RLS etkinleştir
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE kpi_data ENABLE ROW LEVEL SECURITY;

-- Basit policy (herkese erişim)
CREATE POLICY "Enable all operations" ON employees FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all operations" ON kpi_data FOR ALL USING (true) WITH CHECK (true);

-- Başarı mesajı
SELECT 'Minimal database setup completed!' as message;
