-- Test verisi ekleme - KPI Evaluation System

-- Test çalışanları ekle
INSERT INTO employees (full_name, position, department, evaluation_period) 
VALUES 
    ('Ahmet Yılmaz', 'Satış Temsilcisi', 'Satış', 'Ocak 2025'),
    ('Ayşe Kaya', 'Pazarlama Uzmanı', 'Pazarlama', 'Ocak 2025'),
    ('Mehmet Demir', 'Müdür', 'Satış', 'Ocak 2025')
ON CONFLICT DO NOTHING;

-- Test KPI verileri - Ahmet Yılmaz için
INSERT INTO kpi_data (employee_id, kpi_index, kpi_title, target_value, achieved_value, unit, percentage)
SELECT 
    e.id,
    0 as kpi_index,
    'İletilen Fırsat Sayısı' as kpi_title,
    25 as target_value,
    18 as achieved_value,
    '' as unit,
    72.0 as percentage
FROM employees e WHERE e.full_name = 'Ahmet Yılmaz'
UNION ALL
SELECT 
    e.id, 1, 'Teklif Gönderildi & Değerlendirme Sürecinde', 15, 12, '', 80.0
FROM employees e WHERE e.full_name = 'Ahmet Yılmaz'
UNION ALL
SELECT 
    e.id, 2, 'Teklif Siparişe Dönüştü', 10, 8, '', 80.0
FROM employees e WHERE e.full_name = 'Ahmet Yılmaz'
UNION ALL
SELECT 
    e.id, 3, 'Yeni Müşteri Lead', 20, 16, '', 80.0
FROM employees e WHERE e.full_name = 'Ahmet Yılmaz'
UNION ALL
SELECT 
    e.id, 4, 'Telefonla Görüşme Süresi', 120, 95, 'dk', 79.17
FROM employees e WHERE e.full_name = 'Ahmet Yılmaz';

-- Test KPI verileri - Ayşe Kaya için
INSERT INTO kpi_data (employee_id, kpi_index, kpi_title, target_value, achieved_value, unit, percentage)
SELECT 
    e.id, 0, 'İletilen Fırsat Sayısı', 30, 28, '', 93.33
FROM employees e WHERE e.full_name = 'Ayşe Kaya'
UNION ALL
SELECT 
    e.id, 1, 'Teklif Gönderildi & Değerlendirme Sürecinde', 20, 18, '', 90.0
FROM employees e WHERE e.full_name = 'Ayşe Kaya'
UNION ALL
SELECT 
    e.id, 2, 'Teklif Siparişe Dönüştü', 12, 11, '', 91.67
FROM employees e WHERE e.full_name = 'Ayşe Kaya'
UNION ALL
SELECT 
    e.id, 3, 'Yeni Müşteri Lead', 25, 23, '', 92.0
FROM employees e WHERE e.full_name = 'Ayşe Kaya'
UNION ALL
SELECT 
    e.id, 4, 'Telefonla Görüşme Süresi', 150, 145, 'dk', 96.67
FROM employees e WHERE e.full_name = 'Ayşe Kaya';

-- Sonuç kontrolü
SELECT 
    'Test data added successfully!' as message,
    (SELECT COUNT(*) FROM employees) as employee_count,
    (SELECT COUNT(*) FROM kpi_data) as kpi_count;
