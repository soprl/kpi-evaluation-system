-- KPI Evaluation System - Supabase Database Setup
-- Bu kodu Supabase SQL Editor'da çalıştırın

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

-- İndeksler (performans için)
CREATE INDEX IF NOT EXISTS idx_kpi_employee_id ON kpi_data(employee_id);
CREATE INDEX IF NOT EXISTS idx_employees_updated_at ON employees(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_kpi_data_created_at ON kpi_data(created_at DESC);

-- Otomatik updated_at güncellemesi için trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger'ı employees tablosuna ekle
DROP TRIGGER IF EXISTS update_employees_updated_at ON employees;
CREATE TRIGGER update_employees_updated_at
    BEFORE UPDATE ON employees
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) etkinleştir - güvenlik için
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE kpi_data ENABLE ROW LEVEL SECURITY;

-- Herkese okuma/yazma izni ver (basit setup için)
-- Production'da daha kısıtlayıcı policies kullanın
CREATE POLICY "Enable all operations for all users" ON employees
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Enable all operations for all users" ON kpi_data
    FOR ALL USING (true) WITH CHECK (true);

-- Test verisi ekle (opsiyonel)
INSERT INTO employees (full_name, position, department, evaluation_period) 
VALUES 
    ('Ahmet Yılmaz', 'Satış Temsilcisi', 'Satış', 'Ocak 2025'),
    ('Ayşe Kaya', 'Pazarlama Uzmanı', 'Pazarlama', 'Ocak 2025')
ON CONFLICT DO NOTHING;

-- Test KPI verileri - Düzeltilmiş versiyon
WITH kpi_template AS (
    SELECT 
        0 as kpi_index, 'İletilen Fırsat Sayısı' as kpi_title, 25 as target_value, 18 as achieved_value, '' as unit
    UNION ALL SELECT 
        1, 'Teklif Gönderildi & Değerlendirme Sürecinde', 15, 12, ''
    UNION ALL SELECT 
        2, 'Teklif Siparişe Dönüştü', 10, 8, ''
    UNION ALL SELECT 
        3, 'Yeni Müşteri Lead', 20, 16, ''
    UNION ALL SELECT 
        4, 'Telefonla Görüşme Süresi', 120, 95, 'dk'
)
INSERT INTO kpi_data (employee_id, kpi_index, kpi_title, target_value, achieved_value, unit, percentage)
SELECT 
    e.id,
    k.kpi_index,
    k.kpi_title,
    k.target_value,
    k.achieved_value,
    k.unit,
    ROUND((k.achieved_value::numeric / k.target_value::numeric) * 100, 2) as percentage
FROM employees e
CROSS JOIN kpi_template k
WHERE e.full_name IN ('Ahmet Yılmaz', 'Ayşe Kaya')
ON CONFLICT DO NOTHING;

-- Kurulum tamamlandı mesajı
SELECT 
    'Database setup completed successfully!' as message,
    COUNT(*) as employee_count 
FROM employees;
