// Basit test API fonksiyonu
module.exports = async function handler(req, res) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    try {
        res.status(200).json({ 
            message: 'API çalışıyor!', 
            timestamp: new Date().toISOString(),
            method: req.method,
            url: req.url
        });
    } catch (error) {
        console.error('Test API Error:', error);
        res.status(500).json({ error: error.message });
    }
};
