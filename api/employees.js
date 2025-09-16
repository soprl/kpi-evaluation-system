// Vercel Serverless Function - Çalışan API'si

// Supabase REST API kullanımı (paket olmadan)
async function supabaseRequest(endpoint, options = {}) {
    const supabaseUrl = process.env.SUPABASE_URL || 'https://icnacewrtnxttebqnejh.supabase.co';
    const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImljbmFjZXdydG54dHRlYnFuZWpoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwMTA4MDksImV4cCI6MjA3MzU4NjgwOX0.Toi-L1piGfK1O_t4HhCeHlSYS36h2Nb93rTz-elnD1Y';
    
    const url = `${supabaseUrl}/rest/v1/${endpoint}`;
    
    const response = await fetch(url, {
        method: options.method || 'GET',
        headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation',
            ...options.headers
        },
        body: options.body ? JSON.stringify(options.body) : undefined
    });
    
    if (!response.ok) {
        throw new Error(`Supabase error: ${response.status} ${response.statusText}`);
    }
    
    return response.json();
}

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
            // Basit test - tüm çalışanları getir
            const employees = await supabaseRequest('employees?select=*');
            res.json({ employees: employees || [] });
            
        } else if (req.method === 'POST') {
            // Çalışan kaydet
            const { full_name, position, department, evaluation_period } = req.body;
            
            if (!full_name) {
                return res.status(400).json({ error: 'Çalışan adı gerekli' });
            }
            
            const employee = await supabaseRequest('employees', {
                method: 'POST',
                body: { full_name, position, department, evaluation_period }
            });
            
            res.json({ success: true, employee: employee[0] });
            
        } else {
            res.status(405).json({ error: 'Method not allowed' });
        }
    } catch (error) {
        console.error('API Error:', error);
        res.status(500).json({ error: error.message || 'Internal server error' });
    }
}
