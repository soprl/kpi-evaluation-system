# KPI Değerlendirme Şablonu

Modern, responsive bir KPI (Key Performance Indicator) değerlendirme web uygulaması.

## 🚀 Özellikler

- **Modern Tasarım**: Temiz, beyaz arka plan üzerine turuncu ve yeşil renk paleti
- **Responsive**: Mobil ve masaüstü cihazlarda mükemmel görünüm
- **Dinamik Grafikler**: HTML5 Canvas ile çizilen pasta grafikleri
- **Animasyonlar**: Sayılar ve grafikler için yumuşak animasyonlar
- **Kolay Güncelleme**: JavaScript API ile kolay veri yönetimi

## 📁 Dosya Yapısı

```
kpı/
├── index.html      # Ana HTML dosyası
├── styles.css      # CSS stilleri
├── script.js       # JavaScript kodu
└── README.md       # Bu dosya
```

## 🎯 Kullanım

### Temel Kullanım
Dosyaları web sunucusuna yükleyin ve `index.html` dosyasını açın.

### Veri Güncelleme

#### 1. Profil Bilgilerini Güncelleme
```javascript
updateProfile("Yeni Ad Soyad", "Yeni Unvan");
```

#### 2. Tek KPI Güncelleme
```javascript
// updateKPI(index, hedef, yapılan, birim)
updateKPI(0, 30, 25);           // İlk KPI
updateKPI(4, 150, 120, "dk");   // Son KPI (dakika birimi ile)
```

#### 3. Tüm KPI'ları Toplu Güncelleme
```javascript
updateAllKPIs([
    {target: 30, achieved: 25},
    {target: 18, achieved: 15},
    {target: 12, achieved: 10},
    {target: 25, achieved: 20},
    {target: 150, achieved: 130, unit: "dk"}
]);
```

### KPI İndeksleri
- **0**: İletilen Fırsat Sayısı
- **1**: Teklif Gönderildi & Değerlendirme Sürecinde
- **2**: Teklif Siparişe Dönüştü
- **3**: Yeni Müşteri Lead
- **4**: Telefonla Görüşme Süresi

## 🎨 Tasarım Özellikleri

- **Renk Paleti**:
  - Turuncu: `#ff8c00` (hedef değerler)
  - Yeşil: `#28a745` (yapılan değerler)
  - Beyaz: `#ffffff` (arka plan)

- **Responsive Breakpoint'ler**:
  - Mobil: < 768px
  - Küçük Mobil: < 480px

- **Animasyonlar**:
  - Sayı animasyonları (1 saniye)
  - Hover efektleri
  - Sayfa yüklenme animasyonları

## 🔧 Özelleştirme

### CSS Değişkenleri
Ana renkleri değiştirmek için `styles.css` dosyasında aşağıdaki değerleri güncelleyin:
- `#ff8c00` → Turuncu renk
- `#28a745` → Yeşil renk

### Yeni KPI Ekleme
1. `index.html` dosyasına yeni KPI item'ı ekleyin
2. `script.js` dosyasında `kpiData` dizisine yeni veri ekleyin
3. CSS grid otomatik olarak yeni item'ı konumlandıracaktır

## 📱 Tarayıcı Desteği

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## 🛠️ Geliştirme

### Debugging
Konsol üzerinden `exampleUsage()` fonksiyonunu çalıştırarak kullanım örneklerini görebilirsiniz.

### Hata Ayıklama
Tüm hatalar konsola loglanır. F12 ile Developer Tools'u açıp Console sekmesini kontrol edin.

## 📄 Lisans

Bu proje MIT lisansı altında dağıtılmaktadır.
