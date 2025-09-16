# 🚀 Vercel'e Deploy Etme Kılavuzu

Bu KPI Değerlendirme Sistemi'ni Vercel'e deploy etmek için aşağıdaki adımları takip edin.

## 📋 Gereksinimler

1. **Vercel Hesabı**: [vercel.com](https://vercel.com) üzerinden ücretsiz hesap açın
2. **GitHub Deposu**: Projeyi GitHub'a yükleyin
3. **Veritabanı**: PostgreSQL veritabanı (Supabase, Railway, PlanetScale vb.)

## 🛠️ Adım Adım Deploy Süreci

### 1. Veritabanı Kurulumu

#### Seçenek A: Supabase (Önerilen - Ücretsiz)
```bash
# 1. https://supabase.com adresine gidin
# 2. "Start your project" ile yeni proje oluşturun
# 3. Database bölümünden SQL Editor'ı açın
# 4. Aşağıdaki SQL kodunu çalıştırın:

CREATE TABLE employees (
    id SERIAL PRIMARY KEY,
    full_name TEXT NOT NULL,
    position TEXT,
    department TEXT,
    evaluation_period TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE kpi_data (
    id SERIAL PRIMARY KEY,
    employee_id INTEGER REFERENCES employees(id),
    kpi_index INTEGER,
    kpi_title TEXT,
    target_value REAL,
    achieved_value REAL,
    unit TEXT,
    percentage REAL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_kpi_employee_id ON kpi_data(employee_id);
CREATE INDEX idx_employees_updated_at ON employees(updated_at);
```

#### Seçenek B: Railway
```bash
# 1. https://railway.app adresine gidin
# 2. "Start a New Project" > "Provision PostgreSQL"
# 3. Database URL'ini kopyalayın
```

#### Seçenek C: PlanetScale
```bash
# 1. https://planetscale.com adresine gidin
# 2. Yeni veritabanı oluşturun
# 3. Connection string'i alın
```

### 2. GitHub'a Yükleme

```bash
# Projeyi GitHub'a yükleyin
git init
git add .
git commit -m "KPI Evaluation System - Initial commit"
git branch -M main
git remote add origin https://github.com/KULLANICI_ADI/kpi-system.git
git push -u origin main
```

### 3. Vercel'de Deploy

1. **Vercel'e Giriş**: [vercel.com](https://vercel.com) adresinde GitHub ile giriş yapın

2. **Proje İmport**: "New Project" > GitHub deposunu seçin

3. **Konfigürasyon**:
   - Framework Preset: `Other`
   - Root Directory: `./`
   - Build Command: `npm run build`
   - Output Directory: `public` (boş bırakın)

4. **Environment Variables** (Çevre Değişkenleri):
   ```
   DATABASE_URL=postgresql://user:pass@host:5432/dbname
   NODE_ENV=production
   ALLOWED_ORIGINS=https://your-app.vercel.app
   ```

5. **Deploy**: "Deploy" butonuna tıklayın

### 4. Domain Ayarları

```bash
# Özel domain eklemek için (opsiyonel)
# Vercel Dashboard > Settings > Domains
# your-domain.com ekleyin ve DNS ayarlarını yapın
```

## 🔧 Dosya Yapısı (Vercel İçin)

```
kpı/
├── api/                    # Serverless functions
│   ├── employees.js       # Çalışan API'si
│   └── dashboard.js       # Dashboard API'si
├── lib/                   # Yardımcı kütüphaneler
│   └── database.js        # Veritabanı bağlantısı
├── public/                # Statik dosyalar (opsiyonel)
├── index.html            # Ana sayfa
├── admin.html            # Admin paneli
├── dashboard.html        # Dashboard
├── *.css                 # Stil dosyaları
├── *.js                  # JavaScript dosyaları
├── vercel.json          # Vercel konfigürasyonu
├── package.json         # NPM bağımlılıkları
└── README.md            # Dokümantasyon
```

## 🌐 URL Yapısı

Deploy sonrası erişim adresleri:

```
https://your-app.vercel.app/           # Ana KPI görüntüleme sayfası
https://your-app.vercel.app/admin      # Yönetim paneli
https://your-app.vercel.app/dashboard  # Dashboard
https://your-app.vercel.app/api/employees  # API endpoint'i
```

## 📊 Veritabanı Alternatifleri

### Supabase (Önerilen)
```javascript
// lib/database.js içinde
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### MongoDB Atlas
```javascript
// Alternative MongoDB kullanımı
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/kpi_system
```

## 🚨 Önemli Notlar

1. **Ücretsiz Limitler**:
   - Vercel: 100GB bandwidth/ay, 12 serverless function'a kadar
   - Supabase: 500MB database, 2GB bandwidth/ay

2. **Performance**:
   - Serverless function'lar soğuk başlangıç yapabilir
   - Connection pooling kullanın
   - Database sorguları optimize edin

3. **Güvenlik**:
   - Environment variables'ı Vercel dashboard'dan ekleyin
   - API rate limiting ekleyin (production için)
   - CORS ayarlarını doğru yapın

## 🔍 Hata Giderme

### Yaygın Hatalar:

1. **Database Connection Error**:
   ```bash
   # DATABASE_URL'i kontrol edin
   # SSL ayarlarını kontrol edin
   ```

2. **Module Not Found**:
   ```bash
   # package.json'da "type": "module" olduğundan emin olun
   # Import/export syntax'ını kontrol edin
   ```

3. **CORS Hatası**:
   ```bash
   # API fonksiyonlarında CORS header'ları ekleyin
   # ALLOWED_ORIGINS environment variable'ını ayarlayın
   ```

## 📱 Mobil Uyumluluk

Sistem tamamen responsive olarak tasarlandı:
- iPhone/Android uyumlu
- Tablet desteği
- PWA (Progressive Web App) özelliği eklenebilir

## 🔄 Güncellemeler

```bash
# Kod değişikliklerini deploy etmek için:
git add .
git commit -m "Update: açıklama"
git push origin main
# Vercel otomatik olarak yeniden deploy eder
```

## 📞 Destek

Sorun yaşarsanız:
1. Vercel logs'ları kontrol edin
2. Browser console'da hataları kontrol edin
3. Database connection'ını test edin

Deploy işlemi tamamlandıktan sonra sisteminiz canlı olacak! 🎉
