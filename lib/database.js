// Veritabanı bağlantı modülü - Supabase için optimize edilmiş
const { createClient } = require('@supabase/supabase-js');

let supabase;

// Supabase bağlantısı
async function createConnection() {
    if (!supabase) {
        const supabaseUrl = process.env.SUPABASE_URL || 'https://icnacewrtnxttebqnejh.supabase.co';
        const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImljbmFjZXdydG54dHRlYnFuZWpoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwMTA4MDksImV4cCI6MjA3MzU4NjgwOX0.Toi-L1piGfK1O_t4HhCeHlSYS36h2Nb93rTz-elnD1Y';
        
        supabase = createClient(supabaseUrl, supabaseKey);
    }
    
    return supabase;
}

module.exports = { createConnection };

// Veritabanı tablolarını oluştur
async function initializeDatabase(db) {
    try {
        // Çalışanlar tablosu
        await db.query(`
            CREATE TABLE IF NOT EXISTS employees (
                id SERIAL PRIMARY KEY,
                full_name TEXT NOT NULL,
                position TEXT,
                department TEXT,
                evaluation_period TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // KPI verileri tablosu
        await db.query(`
            CREATE TABLE IF NOT EXISTS kpi_data (
                id SERIAL PRIMARY KEY,
                employee_id INTEGER REFERENCES employees(id),
                kpi_index INTEGER,
                kpi_title TEXT,
                target_value REAL,
                achieved_value REAL,
                unit TEXT,
                percentage REAL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        
        // İndeksler
        await db.query(`
            CREATE INDEX IF NOT EXISTS idx_kpi_employee_id ON kpi_data(employee_id)
        `);
        
        await db.query(`
            CREATE INDEX IF NOT EXISTS idx_employees_updated_at ON employees(updated_at)
        `);
        
        console.log('Veritabanı tabloları hazır.');
    } catch (error) {
        console.error('Veritabanı başlatma hatası:', error);
        throw error;
    }
}

// Alternatif: MongoDB bağlantısı (MongoDB Atlas için)
export async function createMongoConnection() {
    const { MongoClient } = require('mongodb');
    
    if (!process.env.MONGODB_URI) {
        throw new Error('MONGODB_URI environment variable is not set');
    }
    
    const client = new MongoClient(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
    
    await client.connect();
    return client.db('kpi_system');
}

// Supabase alternatifi
export async function createSupabaseConnection() {
    const { createClient } = require('@supabase/supabase-js');
    
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
        throw new Error('Supabase environment variables are not set');
    }
    
    return createClient(supabaseUrl, supabaseKey);
}
