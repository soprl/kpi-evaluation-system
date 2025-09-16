// KPI Değerlendirme JavaScript Kodu

// Konfigürasyon ve Veri Yönetimi
class KPIManager {
    constructor() {
        this.profileData = {
            fullName: "Ahmet Yılmaz",
            position: "Satış Temsilcisi"
        };
        
        this.kpiData = [
            { target: 25, achieved: 18, unit: "" },
            { target: 15, achieved: 12, unit: "" },
            { target: 10, achieved: 8, unit: "" },
            { target: 20, achieved: 16, unit: "" },
            { target: 120, achieved: 95, unit: "dk" }
        ];
        
        this.init();
    }
    
    init() {
        this.updateProfileInfo();
        this.createCharts();
        this.setupEventListeners();
    }
    
    // Profil bilgilerini güncelle
    updateProfileInfo() {
        const fullNameElement = document.getElementById('fullName');
        const positionElement = document.getElementById('position');
        
        if (fullNameElement) fullNameElement.textContent = this.profileData.fullName;
        if (positionElement) positionElement.textContent = this.profileData.position;
    }
    
    // Pasta grafikleri oluştur
    createCharts() {
        const charts = document.querySelectorAll('.pie-chart');
        
        charts.forEach((canvas, index) => {
            const target = parseInt(canvas.dataset.target);
            const achieved = parseInt(canvas.dataset.achieved);
            
            this.drawPieChart(canvas, target, achieved, index);
        });
    }
    
    // Geliştirilmiş pasta grafik çizimi
    drawPieChart(canvas, target, achieved, index) {
        const ctx = canvas.getContext('2d');
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = 45;
        
        // Canvas'ı temizle
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Başarı yüzdesini hesapla
        const percentage = target > 0 ? Math.min((achieved / target) * 100, 100) : 0;
        const achievedAngle = (percentage / 100) * 2 * Math.PI;
        
        // Gölge efekti
        ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
        ctx.shadowBlur = 10;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
        
        // Başarılı kısım (Yeşil gradyan)
        if (percentage > 0) {
            const gradient1 = ctx.createLinearGradient(centerX - radius, centerY - radius, centerX + radius, centerY + radius);
            gradient1.addColorStop(0, '#2ecc71');
            gradient1.addColorStop(1, '#27ae60');
            
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, -Math.PI / 2, -Math.PI / 2 + achievedAngle);
            ctx.lineTo(centerX, centerY);
            ctx.fillStyle = gradient1;
            ctx.fill();
        }
        
        // Kalan kısım (Turuncu gradyan)
        if (percentage < 100) {
            const gradient2 = ctx.createLinearGradient(centerX - radius, centerY - radius, centerX + radius, centerY + radius);
            gradient2.addColorStop(0, '#f39c12');
            gradient2.addColorStop(1, '#e67e22');
            
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, -Math.PI / 2 + achievedAngle, -Math.PI / 2 + 2 * Math.PI);
            ctx.lineTo(centerX, centerY);
            ctx.fillStyle = gradient2;
            ctx.fill();
        }
        
        // Gölgeyi kaldır
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        
        // Merkez daire (beyaz gradyan)
        const centerGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 20);
        centerGradient.addColorStop(0, '#ffffff');
        centerGradient.addColorStop(1, '#f8f9fa');
        
        ctx.beginPath();
        ctx.arc(centerX, centerY, 20, 0, 2 * Math.PI);
        ctx.fillStyle = centerGradient;
        ctx.fill();
        
        // Yüzde yazısı
        ctx.fillStyle = '#2c3e50';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(Math.round(percentage) + '%', centerX, centerY);
        
        // Dış çerçeve
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        ctx.strokeStyle = '#bdc3c7';
        ctx.lineWidth = 3;
        ctx.stroke();
        
        // İç çerçeve
        ctx.beginPath();
        ctx.arc(centerX, centerY, 20, 0, 2 * Math.PI);
        ctx.strokeStyle = '#ecf0f1';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Performans durumuna göre renk değişimi
        const kpiItem = canvas.closest('.kpi-item');
        if (kpiItem) {
            if (percentage >= 90) {
                kpiItem.style.borderTopColor = '#27ae60';
            } else if (percentage >= 70) {
                kpiItem.style.borderTopColor = '#f39c12';
            } else {
                kpiItem.style.borderTopColor = '#e74c3c';
            }
        }
    }
    
    // Event listener'ları ayarla
    setupEventListeners() {
        // Sayfa yüklendiğinde animasyonları başlat
        this.animateNumbers();
        
        // Resize olayında grafikleri yeniden çiz
        window.addEventListener('resize', () => {
            setTimeout(() => {
                this.createCharts();
            }, 100);
        });
    }
    
    // Sayı animasyonları
    animateNumbers() {
        const valueNumbers = document.querySelectorAll('.value-number');
        
        valueNumbers.forEach((element, index) => {
            const finalValue = element.textContent;
            const numericValue = parseInt(finalValue);
            
            if (!isNaN(numericValue)) {
                this.animateNumber(element, 0, numericValue, 1000, finalValue.includes('dk') ? 'dk' : '');
            }
        });
    }
    
    // Tek sayı animasyonu
    animateNumber(element, start, end, duration, unit = '') {
        const startTime = performance.now();
        
        const updateNumber = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function (ease-out)
            const easeOut = 1 - Math.pow(1 - progress, 3);
            const currentValue = Math.round(start + (end - start) * easeOut);
            
            element.textContent = currentValue + (unit ? ' ' + unit : '');
            
            if (progress < 1) {
                requestAnimationFrame(updateNumber);
            }
        };
        
        requestAnimationFrame(updateNumber);
    }
    
    // Profil bilgilerini güncelleme metodu (dışarıdan erişim için)
    updateProfile(fullName, position) {
        this.profileData.fullName = fullName;
        this.profileData.position = position;
        this.updateProfileInfo();
    }
    
    // KPI verilerini güncelleme metodu (dışarıdan erişim için)
    updateKPI(index, target, achieved, unit = '') {
        if (index >= 0 && index < this.kpiData.length) {
            this.kpiData[index] = { target, achieved, unit };
            
            // HTML'deki değerleri güncelle
            const kpiItems = document.querySelectorAll('.kpi-item');
            if (kpiItems[index]) {
                const targetElement = kpiItems[index].querySelector('.target');
                const achievedElement = kpiItems[index].querySelector('.achieved');
                const canvas = kpiItems[index].querySelector('.pie-chart');
                
                if (targetElement) targetElement.textContent = target + (unit ? ' ' + unit : '');
                if (achievedElement) achievedElement.textContent = achieved + (unit ? ' ' + unit : '');
                if (canvas) {
                    canvas.dataset.target = target;
                    canvas.dataset.achieved = achieved;
                    this.drawPieChart(canvas, target, achieved, index);
                }
            }
        }
    }
    
    // Tüm KPI verilerini toplu güncelleme
    updateAllKPIs(kpiArray) {
        kpiArray.forEach((kpi, index) => {
            this.updateKPI(index, kpi.target, kpi.achieved, kpi.unit || '');
        });
    }
}

// URL parametrelerinden veri yükle
function loadDataFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    
    if (urlParams.has('name')) {
        const profileData = {
            fullName: urlParams.get('name') || 'Ahmet Yılmaz',
            position: urlParams.get('position') || 'Satış Temsilcisi'
        };
        
        const kpiData = [];
        for (let i = 1; i <= 5; i++) {
            const target = parseInt(urlParams.get(`kpi${i}_target`)) || 0;
            const achieved = parseInt(urlParams.get(`kpi${i}_achieved`)) || 0;
            kpiData.push({ target, achieved, unit: i === 5 ? 'dk' : '' });
        }
        
        // Profil bilgilerini güncelle
        if (window.kpiManager) {
            window.kpiManager.profileData = profileData;
            window.kpiManager.kpiData = kpiData;
            window.kpiManager.updateProfileInfo();
            window.kpiManager.updateKPIValues();
            window.kpiManager.createCharts();
        }
    }
}

// KPI değerlerini HTML'de güncelle
KPIManager.prototype.updateKPIValues = function() {
    const kpiItems = document.querySelectorAll('.kpi-item');
    
    kpiItems.forEach((item, index) => {
        if (index < this.kpiData.length) {
            const kpi = this.kpiData[index];
            const targetElement = item.querySelector('.target');
            const achievedElement = item.querySelector('.achieved');
            const percentageElement = item.querySelector('.percentage-value');
            
            if (targetElement) {
                targetElement.textContent = kpi.target + (kpi.unit ? ' ' + kpi.unit : '');
            }
            if (achievedElement) {
                achievedElement.textContent = kpi.achieved + (kpi.unit ? ' ' + kpi.unit : '');
            }
            if (percentageElement) {
                const percentage = kpi.target > 0 ? Math.round((kpi.achieved / kpi.target) * 100) : 0;
                percentageElement.textContent = '%' + percentage;
            }
            
            // Canvas verilerini güncelle
            const canvas = item.querySelector('.pie-chart');
            if (canvas) {
                canvas.dataset.target = kpi.target;
                canvas.dataset.achieved = kpi.achieved;
            }
        }
    });
};

// Sayfa yüklendiğinde KPI Manager'ı başlat
document.addEventListener('DOMContentLoaded', () => {
    window.kpiManager = new KPIManager();
    
    // URL'den veri varsa yükle
    setTimeout(() => {
        loadDataFromURL();
    }, 100);
});

// Global fonksiyonlar (konsol üzerinden kolay erişim için)
function updateProfile(fullName, position) {
    if (window.kpiManager) {
        window.kpiManager.updateProfile(fullName, position);
    }
}

function updateKPI(index, target, achieved, unit = '') {
    if (window.kpiManager) {
        window.kpiManager.updateKPI(index, target, achieved, unit);
    }
}

function updateAllKPIs(kpiArray) {
    if (window.kpiManager) {
        window.kpiManager.updateAllKPIs(kpiArray);
    }
}

// Örnek kullanım fonksiyonları (konsol üzerinden test için)
function exampleUsage() {
    console.log(`
    === KPI Değerlendirme Sistemi Kullanım Örnekleri ===
    
    1. Profil bilgilerini güncelleme:
    updateProfile("Mehmet Öztürk", "Bölge Müdürü");
    
    2. Tek KPI güncelleme (index, hedef, yapılan, birim):
    updateKPI(0, 30, 25);  // İlk KPI'ı güncelle
    updateKPI(4, 150, 120, "dk");  // Son KPI'ı güncelle (dakika birimi ile)
    
    3. Tüm KPI'ları toplu güncelleme:
    updateAllKPIs([
        {target: 30, achieved: 25},
        {target: 18, achieved: 15},
        {target: 12, achieved: 10},
        {target: 25, achieved: 20},
        {target: 150, achieved: 130, unit: "dk"}
    ]);
    
    4. Mevcut verileri görüntüleme:
    console.log(window.kpiManager.profileData);
    console.log(window.kpiManager.kpiData);
    `);
}

// Hata yakalama ve debugging
window.addEventListener('error', (e) => {
    console.error('KPI Sistemi Hatası:', e.error);
});

// Canvas desteği kontrolü
if (!document.createElement('canvas').getContext) {
    console.warn('Bu tarayıcı Canvas API\'sini desteklemiyor. Grafikler görüntülenemeyebilir.');
}
