// Vercel Serverless Function - Çalışan API'si
import { createConnection } from '../lib/database.js';

export default async function handler(req, res) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    try {
        const db = await createConnection();
        
        switch (req.method) {
            case 'GET':
                await handleGet(req, res, db);
                break;
            case 'POST':
                await handlePost(req, res, db);
                break;
            case 'DELETE':
                await handleDelete(req, res, db);
                break;
            default:
                res.status(405).json({ error: 'Method not allowed' });
        }
    } catch (error) {
        console.error('API Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

// GET - Tüm çalışanları getir
async function handleGet(req, res, db) {
    const { id } = req.query;
    
    try {
        if (id) {
            // Tek çalışan getir
            const { data: employee, error: empError } = await db
                .from('employees')
                .select('*')
                .eq('id', id)
                .single();
            
            if (empError || !employee) {
                return res.status(404).json({ error: 'Çalışan bulunamadı' });
            }
            
            const { data: kpis, error: kpiError } = await db
                .from('kpi_data')
                .select('*')
                .eq('employee_id', id)
                .order('kpi_index');
            
            if (kpiError) {
                console.error('KPI data error:', kpiError);
                return res.status(500).json({ error: 'KPI verileri alınamadı' });
            }
            
            res.json({
                employee: employee,
                kpis: kpis || []
            });
        } else {
            // Tüm çalışanları getir
            const { data: employees, error } = await db
                .from('employees')
                .select(`
                    *,
                    kpi_data(count),
                    kpi_data(percentage)
                `)
                .order('updated_at', { ascending: false });
            
            if (error) {
                console.error('Employees fetch error:', error);
                return res.status(500).json({ error: 'Çalışanlar alınamadı' });
            }
            
            // KPI istatistiklerini hesapla
            const employeesWithStats = await Promise.all(
                employees.map(async (emp) => {
                    const { data: kpis } = await db
                        .from('kpi_data')
                        .select('percentage')
                        .eq('employee_id', emp.id);
                    
                    const avgPerformance = kpis && kpis.length > 0 
                        ? kpis.reduce((sum, kpi) => sum + (kpi.percentage || 0), 0) / kpis.length
                        : 0;
                    
                    return {
                        ...emp,
                        kpi_count: kpis ? kpis.length : 0,
                        avg_performance: avgPerformance
                    };
                })
            );
            
            res.json({ employees: employeesWithStats });
        }
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ error: 'Veritabanı hatası' });
    }
}

// POST - Çalışan kaydet/güncelle
async function handlePost(req, res, db) {
    const { id, full_name, position, department, evaluation_period, kpis } = req.body;
    
    if (!full_name) {
        return res.status(400).json({ error: 'Çalışan adı gerekli' });
    }
    
    try {
        let employeeId;
        
        if (id) {
            // Güncelleme
            const { data, error } = await db
                .from('employees')
                .update({
                    full_name,
                    position,
                    department,
                    evaluation_period,
                    updated_at: new Date().toISOString()
                })
                .eq('id', id)
                .select();
            
            if (error) {
                console.error('Employee update error:', error);
                return res.status(500).json({ error: 'Çalışan güncellenemedi' });
            }
            
            employeeId = id;
        } else {
            // Yeni kayıt
            const { data, error } = await db
                .from('employees')
                .insert({
                    full_name,
                    position,
                    department,
                    evaluation_period
                })
                .select();
            
            if (error) {
                console.error('Employee insert error:', error);
                return res.status(500).json({ error: 'Çalışan eklenemedi' });
            }
            
            employeeId = data[0].id;
        }
        
        // KPI verilerini güncelle
        await updateKPIData(db, employeeId, kpis);
        
        res.json({ success: true, employee_id: employeeId });
    } catch (error) {
        console.error('Employee save error:', error);
        res.status(500).json({ error: 'Kaydetme hatası' });
    }
}

// DELETE - Çalışan sil
async function handleDelete(req, res, db) {
    const { id } = req.query;
    
    if (!id) {
        return res.status(400).json({ error: 'Çalışan ID gerekli' });
    }
    
    // Önce KPI verilerini sil
    await db.query('DELETE FROM kpi_data WHERE employee_id = $1', [id]);
    
    // Sonra çalışanı sil
    const result = await db.query('DELETE FROM employees WHERE id = $1', [id]);
    
    if (result.rowCount === 0) {
        return res.status(404).json({ error: 'Çalışan bulunamadı' });
    }
    
    res.json({ success: true });
}

// KPI verilerini güncelle
async function updateKPIData(db, employeeId, kpis) {
    try {
        // Eski KPI verilerini sil
        const { error: deleteError } = await db
            .from('kpi_data')
            .delete()
            .eq('employee_id', employeeId);
        
        if (deleteError) {
            console.error('KPI delete error:', deleteError);
        }
        
        // Yeni KPI verilerini ekle
        const kpiTitles = [
            'İletilen Fırsat Sayısı',
            'Teklif Gönderildi & Değerlendirme Sürecinde',
            'Teklif Siparişe Dönüştü',
            'Yeni Müşteri Lead',
            'Telefonla Görüşme Süresi'
        ];
        
        const kpiRecords = kpis.map((kpi, index) => {
            const percentage = kpi.target > 0 ? (kpi.achieved / kpi.target) * 100 : 0;
            const unit = index === 4 ? 'dk' : '';
            
            return {
                employee_id: employeeId,
                kpi_index: index,
                kpi_title: kpiTitles[index],
                target_value: kpi.target,
                achieved_value: kpi.achieved,
                unit: unit,
                percentage: percentage
            };
        });
        
        const { error: insertError } = await db
            .from('kpi_data')
            .insert(kpiRecords);
        
        if (insertError) {
            console.error('KPI insert error:', insertError);
            throw insertError;
        }
    } catch (error) {
        console.error('KPI update error:', error);
        throw error;
    }
}
