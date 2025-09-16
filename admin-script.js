// KPI Yönetim Paneli JavaScript Kodu

class KPIAdminManager {
    constructor() {
        this.employees = this.loadEmployees();
        this.currentEmployeeId = null;
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.updateEmployeeSelect();
        this.calculatePercentages();
    }
    
    // Event listener'ları ayarla
    setupEventListeners() {
        // KPI input değişikliklerini dinle
        for (let i = 1; i <= 5; i++) {
            const targetInput = document.getElementById(`kpi${i}_target`);
            const achievedInput = document.getElementById(`kpi${i}_achieved`);
            
            if (targetInput && achievedInput) {
                targetInput.addEventListener('input', () => this.calculatePercentage(i));
                achievedInput.addEventListener('input', () => this.calculatePercentage(i));
            }
        }
        
        // Profil input'larını dinle
        ['fullName', 'position', 'department', 'evaluationPeriod'].forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('input', () => this.calculateOverallPerformance());
            }
        });
    }
    
    // Tek KPI yüzdesini hesapla
    calculatePercentage(kpiIndex) {
        const targetInput = document.getElementById(`kpi${kpiIndex}_target`);
        const achievedInput = document.getElementById(`kpi${kpiIndex}_achieved`);
        const percentageDisplay = document.getElementById(`kpi${kpiIndex}_percentage`);
        
        if (targetInput && achievedInput && percentageDisplay) {
            const target = parseFloat(targetInput.value) || 0;
            const achieved = parseFloat(achievedInput.value) || 0;
            const percentage = target > 0 ? Math.round((achieved / target) * 100) : 0;
            
            percentageDisplay.textContent = `%${percentage}`;
            
            // Renk değişimi
            percentageDisplay.className = 'percentage-display';
            if (percentage >= 90) {
                percentageDisplay.classList.add('excellent');
            } else if (percentage >= 70) {
                percentageDisplay.classList.add('good');
            } else {
                percentageDisplay.classList.add('poor');
            }
        }
        
        this.calculateOverallPerformance();
    }
    
    // Tüm yüzdeleri hesapla
    calculatePercentages() {
        for (let i = 1; i <= 5; i++) {
            this.calculatePercentage(i);
        }
    }
    
    // Genel performansı hesapla
    calculateOverallPerformance() {
        let totalPercentage = 0;
        let validKPIs = 0;
        
        for (let i = 1; i <= 5; i++) {
            const targetInput = document.getElementById(`kpi${i}_target`);
            const achievedInput = document.getElementById(`kpi${i}_achieved`);
            
            if (targetInput && achievedInput) {
                const target = parseFloat(targetInput.value) || 0;
                const achieved = parseFloat(achievedInput.value) || 0;
                
                if (target > 0) {
                    totalPercentage += (achieved / target) * 100;
                    validKPIs++;
                }
            }
        }
        
        const overallPercentage = validKPIs > 0 ? Math.round(totalPercentage / validKPIs) : 0;
        const overallElement = document.getElementById('overallPercentage');
        const statusElement = document.getElementById('overallStatus');
        
        if (overallElement && statusElement) {
            overallElement.textContent = `%${overallPercentage}`;
            
            if (overallPercentage >= 90) {
                statusElement.textContent = 'Mükemmel Performans';
                statusElement.style.color = '#2ecc71';
            } else if (overallPercentage >= 80) {
                statusElement.textContent = 'İyi Performans';
                statusElement.style.color = '#f39c12';
            } else if (overallPercentage >= 70) {
                statusElement.textContent = 'Orta Performans';
                statusElement.style.color = '#e67e22';
            } else if (overallPercentage > 0) {
                statusElement.textContent = 'Geliştirilmesi Gereken';
                statusElement.style.color = '#e74c3c';
            } else {
                statusElement.textContent = 'Veri Girilmedi';
                statusElement.style.color = '#95a5a6';
            }
        }
    }
    
    // API Base URL - production'da otomatik değişecek
    getApiUrl() {
        return window.location.hostname === 'localhost' ? 
               'http://localhost:3000' : 
               window.location.origin;
    }
    
    // Çalışan verilerini API'den yükle
    async loadEmployees() {
        try {
            const response = await fetch(`${this.getApiUrl()}/api/employees`);
            const data = await response.json();
            
            if (data.employees) {
                const employees = {};
                data.employees.forEach(emp => {
                    employees[emp.id] = {
                        id: emp.id,
                        fullName: emp.full_name,
                        position: emp.position,
                        department: emp.department,
                        evaluationPeriod: emp.evaluation_period,
                        avgPerformance: Math.round(emp.avg_performance || 0),
                        kpiCount: emp.kpi_count || 0
                    };
                });
                return employees;
            }
            return {};
        } catch (error) {
            console.error('Çalışanlar yüklenirken hata:', error);
            // Fallback olarak localStorage'ı dene
            const saved = localStorage.getItem('kpi_employees');
            return saved ? JSON.parse(saved) : {};
        }
    }
    
    // Çalışan verilerini API'ye kaydet
    async saveEmployees() {
        // Bu metod artık saveData() içinde kullanılıyor
        return true;
    }
    
    // Çalışan select'ini güncelle
    updateEmployeeSelect() {
        const select = document.getElementById('employeeSelect');
        if (!select) return;
        
        // Mevcut seçenekleri temizle (ilk seçenek hariç)
        while (select.children.length > 1) {
            select.removeChild(select.lastChild);
        }
        
        // Çalışanları ekle
        Object.keys(this.employees).forEach(id => {
            const option = document.createElement('option');
            option.value = id;
            option.textContent = this.employees[id].fullName || 'İsimsiz Çalışan';
            select.appendChild(option);
        });
    }
    
    // Yeni çalışan ekle
    addNewEmployee() {
        const employeeId = 'emp_' + Date.now();
        this.currentEmployeeId = employeeId;
        
        // Form'u temizle
        this.clearForm();
        
        // Select'i güncelle
        const select = document.getElementById('employeeSelect');
        if (select) {
            select.value = '';
        }
        
        // Sil butonunu gizle
        const deleteBtn = document.getElementById('deleteBtn');
        if (deleteBtn) {
            deleteBtn.style.display = 'none';
        }
        
        this.showMessage('Yeni çalışan formu hazırlandı. Bilgileri doldurup kaydedin.', 'success');
    }
    
    // Çalışan verilerini yükle
    loadEmployeeData() {
        const select = document.getElementById('employeeSelect');
        if (!select || !select.value) {
            this.clearForm();
            this.currentEmployeeId = null;
            
            const deleteBtn = document.getElementById('deleteBtn');
            if (deleteBtn) {
                deleteBtn.style.display = 'none';
            }
            return;
        }
        
        this.currentEmployeeId = select.value;
        const employee = this.employees[this.currentEmployeeId];
        
        if (employee) {
            // Profil bilgilerini yükle
            document.getElementById('fullName').value = employee.fullName || '';
            document.getElementById('position').value = employee.position || '';
            document.getElementById('department').value = employee.department || '';
            document.getElementById('evaluationPeriod').value = employee.evaluationPeriod || '';
            
            // KPI verilerini yükle
            for (let i = 1; i <= 5; i++) {
                const kpi = employee.kpis && employee.kpis[i - 1];
                if (kpi) {
                    document.getElementById(`kpi${i}_target`).value = kpi.target || '';
                    document.getElementById(`kpi${i}_achieved`).value = kpi.achieved || '';
                }
            }
            
            // Yüzdeleri hesapla
            this.calculatePercentages();
            
            // Sil butonunu göster
            const deleteBtn = document.getElementById('deleteBtn');
            if (deleteBtn) {
                deleteBtn.style.display = 'inline-flex';
            }
        }
    }
    
    // Form'u temizle
    clearForm() {
        const inputs = document.querySelectorAll('input[type="text"], input[type="number"]');
        inputs.forEach(input => input.value = '');
        
        // Yüzdeleri sıfırla
        for (let i = 1; i <= 5; i++) {
            const percentageDisplay = document.getElementById(`kpi${i}_percentage`);
            if (percentageDisplay) {
                percentageDisplay.textContent = '%0';
                percentageDisplay.className = 'percentage-display';
            }
        }
        
        this.calculateOverallPerformance();
    }
    
    // Verileri kaydet
    async saveData() {
        const fullName = document.getElementById('fullName').value.trim();
        if (!fullName) {
            this.showMessage('Lütfen çalışan adını girin!', 'error');
            return;
        }
        
        // Loading göster
        this.showMessage('Veriler kaydediliyor...', 'info');
        
        // Verileri topla
        const employeeData = {
            id: this.currentEmployeeId || null,
            full_name: fullName,
            position: document.getElementById('position').value.trim(),
            department: document.getElementById('department').value.trim(),
            evaluation_period: document.getElementById('evaluationPeriod').value.trim(),
            kpis: []
        };
        
        // KPI verilerini topla
        for (let i = 1; i <= 5; i++) {
            const target = parseFloat(document.getElementById(`kpi${i}_target`).value) || 0;
            const achieved = parseFloat(document.getElementById(`kpi${i}_achieved`).value) || 0;
            employeeData.kpis.push({ target, achieved });
        }
        
        try {
            // API'ye kaydet
            const response = await fetch(`${this.getApiUrl()}/api/employees`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(employeeData)
            });
            
            const result = await response.json();
            
            if (response.ok && result.success) {
                this.currentEmployeeId = result.employee_id;
                
                // Çalışan listesini yenile
                this.employees = await this.loadEmployees();
                this.updateEmployeeSelect();
                
                // Select'te seç
                const select = document.getElementById('employeeSelect');
                if (select) {
                    select.value = this.currentEmployeeId;
                }
                
                // Sil butonunu göster
                const deleteBtn = document.getElementById('deleteBtn');
                if (deleteBtn) {
                    deleteBtn.style.display = 'inline-flex';
                }
                
                this.showMessage('Veriler başarıyla kaydedildi!', 'success');
            } else {
                throw new Error(result.error || 'Kaydetme hatası');
            }
        } catch (error) {
            console.error('Kaydetme hatası:', error);
            
            // Fallback: localStorage'a kaydet
            if (!this.currentEmployeeId) {
                this.currentEmployeeId = 'emp_' + Date.now();
            }
            
            const legacyData = {
                fullName: employeeData.full_name,
                position: employeeData.position,
                department: employeeData.department,
                evaluationPeriod: employeeData.evaluation_period,
                kpis: employeeData.kpis,
                savedAt: new Date().toISOString()
            };
            
            this.employees[this.currentEmployeeId] = legacyData;
            localStorage.setItem('kpi_employees', JSON.stringify(this.employees));
            
            this.showMessage('Veriler yerel olarak kaydedildi. Sunucu bağlantısı kontrol edilecek.', 'info');
        }
    }
    
    // Çalışan sil
    deleteEmployee() {
        if (!this.currentEmployeeId) return;
        
        const employee = this.employees[this.currentEmployeeId];
        const employeeName = employee ? employee.fullName : 'Bu çalışan';
        
        if (confirm(`${employeeName} isimli çalışanı silmek istediğinizden emin misiniz?`)) {
            delete this.employees[this.currentEmployeeId];
            this.saveEmployees();
            this.updateEmployeeSelect();
            this.clearForm();
            this.currentEmployeeId = null;
            
            const deleteBtn = document.getElementById('deleteBtn');
            if (deleteBtn) {
                deleteBtn.style.display = 'none';
            }
            
            this.showMessage('Çalışan başarıyla silindi.', 'success');
        }
    }
    
    // Raporu görüntüle
    viewReport() {
        if (!this.currentEmployeeId) {
            this.showMessage('Lütfen önce bir çalışan seçin veya yeni veri girin!', 'error');
            return;
        }
        
        // Verileri kaydet
        this.saveData();
        
        // Yeni pencerede raporu aç
        const reportData = this.employees[this.currentEmployeeId];
        const reportUrl = `index.html?employee=${this.currentEmployeeId}`;
        
        // URL'ye veri parametrelerini ekle
        const params = new URLSearchParams({
            name: reportData.fullName,
            position: reportData.position,
            kpi1_target: reportData.kpis[0]?.target || 0,
            kpi1_achieved: reportData.kpis[0]?.achieved || 0,
            kpi2_target: reportData.kpis[1]?.target || 0,
            kpi2_achieved: reportData.kpis[1]?.achieved || 0,
            kpi3_target: reportData.kpis[2]?.target || 0,
            kpi3_achieved: reportData.kpis[2]?.achieved || 0,
            kpi4_target: reportData.kpis[3]?.target || 0,
            kpi4_achieved: reportData.kpis[3]?.achieved || 0,
            kpi5_target: reportData.kpis[4]?.target || 0,
            kpi5_achieved: reportData.kpis[4]?.achieved || 0
        });
        
        window.open(`index.html?${params.toString()}`, '_blank');
    }
    
    // PDF'e dönüştür
    exportToPDF() {
        if (!this.currentEmployeeId) {
            this.showMessage('Lütfen önce bir çalışan seçin!', 'error');
            return;
        }
        
        const employee = this.employees[this.currentEmployeeId];
        if (!employee) return;
        
        // jsPDF kullanarak PDF oluştur
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        // Türkçe karakter desteği için font ayarları
        doc.setFont('helvetica');
        
        // Başlık
        doc.setFontSize(20);
        doc.setTextColor(255, 140, 0);
        doc.text('KPI DEĞERLENDIRME RAPORU', 20, 30);
        
        // Çizgi
        doc.setDrawColor(255, 140, 0);
        doc.setLineWidth(1);
        doc.line(20, 35, 190, 35);
        
        // Profil bilgileri
        doc.setFontSize(14);
        doc.setTextColor(0, 0, 0);
        doc.text(`Ad Soyad: ${employee.fullName}`, 20, 50);
        doc.text(`Unvan: ${employee.position}`, 20, 60);
        doc.text(`Departman: ${employee.department}`, 20, 70);
        doc.text(`Değerlendirme Dönemi: ${employee.evaluationPeriod}`, 20, 80);
        
        // KPI başlıkları
        const kpiTitles = [
            'İletilen Fırsat Sayısı',
            'Teklif Gönderildi & Değerlendirme Sürecinde',
            'Teklif Siparişe Dönüştü',
            'Yeni Müşteri Lead',
            'Telefonla Görüşme Süresi'
        ];
        
        let yPos = 100;
        doc.setFontSize(16);
        doc.setTextColor(40, 167, 69);
        doc.text('KPI SONUÇLARI', 20, yPos);
        yPos += 15;
        
        // KPI detayları
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        
        let totalPercentage = 0;
        let validKPIs = 0;
        
        employee.kpis.forEach((kpi, index) => {
            const percentage = kpi.target > 0 ? Math.round((kpi.achieved / kpi.target) * 100) : 0;
            if (kpi.target > 0) {
                totalPercentage += percentage;
                validKPIs++;
            }
            
            doc.text(`${index + 1}. ${kpiTitles[index]}`, 20, yPos);
            doc.text(`Hedef: ${kpi.target}${index === 4 ? ' dk' : ''}`, 30, yPos + 10);
            doc.text(`Yapılan: ${kpi.achieved}${index === 4 ? ' dk' : ''}`, 30, yPos + 20);
            doc.text(`Başarı Oranı: %${percentage}`, 30, yPos + 30);
            
            // Başarı durumuna göre renk
            if (percentage >= 90) {
                doc.setTextColor(46, 204, 113);
            } else if (percentage >= 70) {
                doc.setTextColor(243, 156, 18);
            } else {
                doc.setTextColor(231, 76, 60);
            }
            doc.text(`(${percentage >= 90 ? 'Mükemmel' : percentage >= 70 ? 'İyi' : 'Geliştirilmeli'})`, 120, yPos + 30);
            doc.setTextColor(0, 0, 0);
            
            yPos += 45;
            
            // Sayfa sonu kontrolü
            if (yPos > 250) {
                doc.addPage();
                yPos = 30;
            }
        });
        
        // Genel başarı oranı
        const overallPercentage = validKPIs > 0 ? Math.round(totalPercentage / validKPIs) : 0;
        
        yPos += 10;
        doc.setFontSize(16);
        doc.setTextColor(52, 152, 219);
        doc.text('GENEL BAŞARI ORANI', 20, yPos);
        
        doc.setFontSize(24);
        doc.setTextColor(overallPercentage >= 90 ? 46 : overallPercentage >= 70 ? 243 : 231, 
                        overallPercentage >= 90 ? 204 : overallPercentage >= 70 ? 156 : 76, 
                        overallPercentage >= 90 ? 113 : overallPercentage >= 70 ? 18 : 60);
        doc.text(`%${overallPercentage}`, 20, yPos + 20);
        
        // Tarih
        doc.setFontSize(10);
        doc.setTextColor(128, 128, 128);
        doc.text(`Rapor Tarihi: ${new Date().toLocaleDateString('tr-TR')}`, 20, 280);
        
        // PDF'i kaydet
        const fileName = `KPI_Raporu_${employee.fullName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
        doc.save(fileName);
        
        this.showMessage('PDF raporu başarıyla indirildi!', 'success');
    }
    
    // Mesaj göster
    showMessage(message, type = 'info') {
        const modal = document.getElementById('messageModal');
        const messageDiv = document.getElementById('modalMessage');
        
        if (modal && messageDiv) {
            messageDiv.innerHTML = `
                <div class="message ${type}">
                    <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
                    <span>${message}</span>
                </div>
            `;
            modal.style.display = 'block';
            
            // 3 saniye sonra otomatik kapat
            setTimeout(() => {
                modal.style.display = 'none';
            }, 3000);
        }
    }
}

// Modal'ı kapat
function closeModal() {
    const modal = document.getElementById('messageModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Global fonksiyonlar
let adminManager;

function addNewEmployee() {
    if (adminManager) adminManager.addNewEmployee();
}

function loadEmployeeData() {
    if (adminManager) adminManager.loadEmployeeData();
}

function deleteEmployee() {
    if (adminManager) adminManager.deleteEmployee();
}

function saveData() {
    if (adminManager) adminManager.saveData();
}

function viewReport() {
    if (adminManager) adminManager.viewReport();
}

function exportToPDF() {
    if (adminManager) adminManager.exportToPDF();
}

// Sayfa yüklendiğinde başlat
document.addEventListener('DOMContentLoaded', () => {
    adminManager = new KPIAdminManager();
});

// Modal dışına tıklandığında kapat
window.addEventListener('click', (event) => {
    const modal = document.getElementById('messageModal');
    if (event.target === modal) {
        modal.style.display = 'none';
    }
});
