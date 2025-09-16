// Vercel Serverless Function - Çalışan API'si

module.exports = async function handler(req, res) {
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
        if (req.method === 'GET') {
            // Test verisi - gerçek Supabase bağlantısı yerine
            const employees = [
                {
                    id: 1,
                    full_name: 'Ahmet Yılmaz',
                    position: 'Satış Temsilcisi',
                    department: 'Satış',
                    evaluation_period: 'Ocak 2025',
                    avg_performance: 78,
                    kpi_count: 5
                },
                {
                    id: 2,
                    full_name: 'Ayşe Kaya',
                    position: 'Pazarlama Uzmanı',
                    department: 'Pazarlama',
                    evaluation_period: 'Ocak 2025',
                    avg_performance: 92,
                    kpi_count: 5
                }
            ];
            
            res.json({ employees: employees });
            
        } else if (req.method === 'POST') {
            // Çalışan kaydet (test)
            const { full_name, position, department, evaluation_period } = req.body;
            
            if (!full_name) {
                return res.status(400).json({ error: 'Çalışan adı gerekli' });
            }
            
            const newEmployee = {
                id: Date.now(),
                full_name,
                position,
                department,
                evaluation_period,
                created_at: new Date().toISOString()
            };
            
            res.json({ success: true, employee_id: newEmployee.id, employee: newEmployee });
            
        } else {
            res.status(405).json({ error: 'Method not allowed' });
        }
    } catch (error) {
        console.error('API Error:', error);
        res.status(500).json({ error: error.message || 'Internal server error' });
    }
}
