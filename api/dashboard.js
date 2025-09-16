// Vercel Serverless Function - Dashboard API'si
const { createConnection } = require('../lib/database.js');

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
        const db = await createConnection();
        
        const queries = {
            totalEmployees: 'SELECT COUNT(*) as count FROM employees',
            avgPerformance: 'SELECT AVG(percentage) as avg FROM kpi_data',
            topPerformers: `SELECT e.full_name, e.position, AVG(k.percentage) as performance
                           FROM employees e 
                           JOIN kpi_data k ON e.id = k.employee_id 
                           GROUP BY e.id, e.full_name, e.position 
                           ORDER BY performance DESC 
                           LIMIT 5`,
            recentEvaluations: `SELECT e.full_name, e.position, e.updated_at
                               FROM employees e 
                               ORDER BY e.updated_at DESC 
                               LIMIT 10`
        };
        
        const results = {};
        
        // Toplam çalışan sayısı
        const totalResult = await db.query(queries.totalEmployees);
        results.totalEmployees = totalResult.rows[0].count || 0;
        
        // Ortalama performans
        const avgResult = await db.query(queries.avgPerformance);
        results.avgPerformance = Math.round(avgResult.rows[0].avg || 0);
        
        // En iyi performans gösterenler
        const topResult = await db.query(queries.topPerformers);
        results.topPerformers = topResult.rows;
        
        // Son değerlendirmeler
        const recentResult = await db.query(queries.recentEvaluations);
        results.recentEvaluations = recentResult.rows;
        
        res.json(results);
    } catch (error) {
        console.error('Dashboard API Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
