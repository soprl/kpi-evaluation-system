// Vercel Serverless Function - Dashboard API'si
const { createClient } = require('@supabase/supabase-js');

// Supabase bağlantısı
function getSupabase() {
    const supabaseUrl = process.env.SUPABASE_URL || 'https://icnacewrtnxttebqnejh.supabase.co';
    const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImljbmFjZXdydG54dHRlYnFuZWpoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwMTA4MDksImV4cCI6MjA3MzU4NjgwOX0.Toi-L1piGfK1O_t4HhCeHlSYS36h2Nb93rTz-elnD1Y';
    return createClient(supabaseUrl, supabaseKey);
}

module.exports = async function handler(req, res) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const db = getSupabase();
        
        const results = {};
        
        // Toplam çalışan sayısı
        const { count: totalEmployees } = await db
            .from('employees')
            .select('*', { count: 'exact', head: true });
        results.totalEmployees = totalEmployees || 0;
        
        // Ortalama performans
        const { data: kpiData } = await db
            .from('kpi_data')
            .select('percentage');
        
        if (kpiData && kpiData.length > 0) {
            const avgPerformance = kpiData.reduce((sum, item) => sum + (item.percentage || 0), 0) / kpiData.length;
            results.avgPerformance = Math.round(avgPerformance);
        } else {
            results.avgPerformance = 0;
        }
        
        // En iyi performans gösterenler
        const { data: employees } = await db
            .from('employees')
            .select('id, full_name, position');
        
        if (employees) {
            const topPerformers = [];
            for (const emp of employees) {
                const { data: empKpis } = await db
                    .from('kpi_data')
                    .select('percentage')
                    .eq('employee_id', emp.id);
                
                if (empKpis && empKpis.length > 0) {
                    const avgPerf = empKpis.reduce((sum, kpi) => sum + (kpi.percentage || 0), 0) / empKpis.length;
                    topPerformers.push({
                        full_name: emp.full_name,
                        position: emp.position,
                        performance: avgPerf
                    });
                }
            }
            
            results.topPerformers = topPerformers
                .sort((a, b) => b.performance - a.performance)
                .slice(0, 5);
        } else {
            results.topPerformers = [];
        }
        
        // Son değerlendirmeler
        const { data: recentEvaluations } = await db
            .from('employees')
            .select('full_name, position, updated_at')
            .order('updated_at', { ascending: false })
            .limit(10);
        
        results.recentEvaluations = recentEvaluations || [];
        
        res.json(results);
    } catch (error) {
        console.error('Dashboard API Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
