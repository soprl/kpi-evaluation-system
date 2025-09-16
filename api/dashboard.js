// Vercel Serverless Function - Dashboard API'si

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
        // Basit test verisi
        const results = {
            totalEmployees: 2,
            avgPerformance: 85,
            topPerformers: [
                { full_name: 'Ayşe Kaya', position: 'Pazarlama Uzmanı', performance: 92 },
                { full_name: 'Ahmet Yılmaz', position: 'Satış Temsilcisi', performance: 78 }
            ],
            recentEvaluations: [
                { full_name: 'Ayşe Kaya', position: 'Pazarlama Uzmanı', updated_at: new Date().toISOString() },
                { full_name: 'Ahmet Yılmaz', position: 'Satış Temsilcisi', updated_at: new Date().toISOString() }
            ]
        };
        
        res.json(results);
    } catch (error) {
        console.error('Dashboard API Error:', error);
        res.status(500).json({ error: error.message || 'Internal server error' });
    }
}
