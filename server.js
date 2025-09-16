const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname)));

// Veritabanı bağlantısı
const db = new sqlite3.Database('./kpi_database.db', (err) => {
    if (err) {
        console.error('Veritabanı bağlantı hatası:', err.message);
    } else {
        console.log('SQLite veritabanına bağlandı.');
        initializeDatabase();
    }
});

// Veritabanı tablolarını oluştur
function initializeDatabase() {
    // Çalışanlar tablosu
    db.run(`CREATE TABLE IF NOT EXISTS employees (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        full_name TEXT NOT NULL,
        position TEXT,
        department TEXT,
        evaluation_period TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // KPI verileri tablosu
    db.run(`CREATE TABLE IF NOT EXISTS kpi_data (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        employee_id INTEGER,
        kpi_index INTEGER,
        kpi_title TEXT,
        target_value REAL,
        achieved_value REAL,
        unit TEXT,
        percentage REAL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (employee_id) REFERENCES employees (id)
    )`);

    console.log('Veritabanı tabloları hazır.');
}

// Ana sayfa
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Admin paneli
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin.html'));
});

// Dashboard
app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'dashboard.html'));
});

// API Routes

// Tüm çalışanları getir
app.get('/api/employees', (req, res) => {
    const query = `
        SELECT e.*, 
               COUNT(k.id) as kpi_count,
               AVG(k.percentage) as avg_performance
        FROM employees e 
        LEFT JOIN kpi_data k ON e.id = k.employee_id 
        GROUP BY e.id 
        ORDER BY e.updated_at DESC
    `;
    
    db.all(query, [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ employees: rows });
    });
});

// Tek çalışanı getir
app.get('/api/employees/:id', (req, res) => {
    const employeeId = req.params.id;
    
    // Çalışan bilgileri
    db.get('SELECT * FROM employees WHERE id = ?', [employeeId], (err, employee) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        
        if (!employee) {
            res.status(404).json({ error: 'Çalışan bulunamadı' });
            return;
        }
        
        // KPI verileri
        db.all('SELECT * FROM kpi_data WHERE employee_id = ? ORDER BY kpi_index', 
               [employeeId], (err, kpis) => {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            
            res.json({
                employee: employee,
                kpis: kpis
            });
        });
    });
});

// Çalışan kaydet/güncelle
app.post('/api/employees', (req, res) => {
    const { id, full_name, position, department, evaluation_period, kpis } = req.body;
    
    if (!full_name) {
        res.status(400).json({ error: 'Çalışan adı gerekli' });
        return;
    }
    
    const now = new Date().toISOString();
    
    if (id) {
        // Güncelleme
        const updateEmployee = `UPDATE employees 
                               SET full_name = ?, position = ?, department = ?, 
                                   evaluation_period = ?, updated_at = ?
                               WHERE id = ?`;
        
        db.run(updateEmployee, [full_name, position, department, evaluation_period, now, id], 
               function(err) {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            
            // KPI verilerini güncelle
            updateKPIData(id, kpis, res);
        });
    } else {
        // Yeni kayıt
        const insertEmployee = `INSERT INTO employees 
                               (full_name, position, department, evaluation_period, created_at, updated_at) 
                               VALUES (?, ?, ?, ?, ?, ?)`;
        
        db.run(insertEmployee, [full_name, position, department, evaluation_period, now, now], 
               function(err) {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            
            const employeeId = this.lastID;
            updateKPIData(employeeId, kpis, res);
        });
    }
});

// KPI verilerini güncelle
function updateKPIData(employeeId, kpis, res) {
    // Eski KPI verilerini sil
    db.run('DELETE FROM kpi_data WHERE employee_id = ?', [employeeId], (err) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        
        // Yeni KPI verilerini ekle
        const kpiTitles = [
            'İletilen Fırsat Sayısı',
            'Teklif Gönderildi & Değerlendirme Sürecinde',
            'Teklif Siparişe Dönüştü',
            'Yeni Müşteri Lead',
            'Telefonla Görüşme Süresi'
        ];
        
        const insertKPI = `INSERT INTO kpi_data 
                          (employee_id, kpi_index, kpi_title, target_value, achieved_value, unit, percentage) 
                          VALUES (?, ?, ?, ?, ?, ?, ?)`;
        
        let completed = 0;
        const total = kpis.length;
        
        if (total === 0) {
            res.json({ success: true, employee_id: employeeId });
            return;
        }
        
        kpis.forEach((kpi, index) => {
            const percentage = kpi.target > 0 ? (kpi.achieved / kpi.target) * 100 : 0;
            const unit = index === 4 ? 'dk' : '';
            
            db.run(insertKPI, [
                employeeId, 
                index, 
                kpiTitles[index], 
                kpi.target, 
                kpi.achieved, 
                unit, 
                percentage
            ], (err) => {
                if (err) {
                    res.status(500).json({ error: err.message });
                    return;
                }
                
                completed++;
                if (completed === total) {
                    res.json({ success: true, employee_id: employeeId });
                }
            });
        });
    });
}

// Çalışan sil
app.delete('/api/employees/:id', (req, res) => {
    const employeeId = req.params.id;
    
    // Önce KPI verilerini sil
    db.run('DELETE FROM kpi_data WHERE employee_id = ?', [employeeId], (err) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        
        // Sonra çalışanı sil
        db.run('DELETE FROM employees WHERE id = ?', [employeeId], function(err) {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            
            if (this.changes === 0) {
                res.status(404).json({ error: 'Çalışan bulunamadı' });
                return;
            }
            
            res.json({ success: true });
        });
    });
});

// Dashboard istatistikleri
app.get('/api/dashboard/stats', (req, res) => {
    const queries = {
        totalEmployees: 'SELECT COUNT(*) as count FROM employees',
        avgPerformance: 'SELECT AVG(percentage) as avg FROM kpi_data',
        topPerformers: `SELECT e.full_name, e.position, AVG(k.percentage) as performance
                       FROM employees e 
                       JOIN kpi_data k ON e.id = k.employee_id 
                       GROUP BY e.id 
                       ORDER BY performance DESC 
                       LIMIT 5`,
        recentEvaluations: `SELECT e.full_name, e.position, e.updated_at
                           FROM employees e 
                           ORDER BY e.updated_at DESC 
                           LIMIT 10`
    };
    
    const results = {};
    let completed = 0;
    const total = Object.keys(queries).length;
    
    Object.keys(queries).forEach(key => {
        if (key === 'topPerformers' || key === 'recentEvaluations') {
            db.all(queries[key], [], (err, rows) => {
                if (err) {
                    results[key] = [];
                } else {
                    results[key] = rows;
                }
                
                completed++;
                if (completed === total) {
                    res.json(results);
                }
            });
        } else {
            db.get(queries[key], [], (err, row) => {
                if (err) {
                    results[key] = 0;
                } else {
                    results[key] = key === 'avgPerformance' ? 
                                  Math.round(row.avg || 0) : 
                                  row.count || 0;
                }
                
                completed++;
                if (completed === total) {
                    res.json(results);
                }
            });
        }
    });
});

// Sunucuyu başlat
app.listen(PORT, () => {
    console.log(`🚀 KPI Sunucusu http://localhost:${PORT} adresinde çalışıyor`);
    console.log(`📊 Admin Panel: http://localhost:${PORT}/admin`);
    console.log(`📈 Dashboard: http://localhost:${PORT}/dashboard`);
});

// Sunucu kapatılırken veritabanını kapat
process.on('SIGINT', () => {
    db.close((err) => {
        if (err) {
            console.error(err.message);
        }
        console.log('Veritabanı bağlantısı kapatıldı.');
        process.exit(0);
    });
});
