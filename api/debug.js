// Debug API - Test için
module.exports = async function handler(req, res) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    try {
        const debugInfo = {
            message: 'Debug API çalışıyor!',
            timestamp: new Date().toISOString(),
            method: req.method,
            url: req.url,
            employees_mock: [
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
            ]
        };
        
        res.status(200).json(debugInfo);
    } catch (error) {
        console.error('Debug API Error:', error);
        res.status(500).json({ error: error.message });
    }
};
