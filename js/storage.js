/**
 * ConAdmin Chile - Storage Management
 * Gestión de Almacenamiento de Datos
 */

// ==============================================
// CLASE DE GESTIÓN DE ALMACENAMIENTO
// ==============================================

class ConAdminStorage {
    constructor() {
        this.storageKey = 'conadmin_chile_data';
        this.version = '1.0.0';
        this.backupInterval = 300000; // 5 minutos
        this.init();
    }
    
    init() {
        this.createBackup();
        this.startAutoBackup();
    }
    
    // ==============================================
    // OPERACIONES BÁSICAS DE ALMACENAMIENTO
    // ==============================================
    
    /**
     * Guarda datos en localStorage
     * @param {string} key - Clave de almacenamiento
     * @param {*} data - Datos a guardar
     * @param {boolean} sync - Sincronizar inmediatamente
     */
    save(key, data, sync = true) {
        try {
            if (!this.data) {
                this.load();
            }
            
            this.data[key] = {
                value: data,
                timestamp: new Date().toISOString(),
                version: this.version
            };
            
            if (sync) {
                this.sync();
            }
            
            return true;
        } catch (error) {
            console.error('Error saving data:', error);
            this.showStorageError('Error al guardar datos');
            return false;
        }
    }
    
    /**
     * Carga datos desde localStorage
     * @param {string} key - Clave de almacenamiento
     * @param {*} defaultValue - Valor por defecto si no existe
     * @returns {*} Datos cargados
     */
    load(key = null, defaultValue = null) {
        try {
            if (!this.data) {
                this.data = {};
            }
            
            if (key === null) {
                // Cargar todos los datos
                const stored = localStorage.getItem(this.storageKey);
                if (stored) {
                    const parsed = JSON.parse(stored);
                    this.data = { ...this.data, ...parsed };
                }
                return this.data;
            }
            
            const item = this.data[key];
            if (item && item.value !== undefined) {
                return item.value;
            }
            
            return defaultValue;
        } catch (error) {
            console.error('Error loading data:', error);
            this.showStorageError('Error al cargar datos');
            return defaultValue;
        }
    }
    
    /**
     * Elimina datos del almacenamiento
     * @param {string} key - Clave a eliminar
     */
    remove(key) {
        try {
            if (this.data && this.data[key]) {
                delete this.data[key];
                this.sync();
            }
        } catch (error) {
            console.error('Error removing data:', error);
        }
    }
    
    /**
     * Limpia todo el almacenamiento
     */
    clear() {
        try {
            this.data = {};
            localStorage.removeItem(this.storageKey);
            console.log('Storage cleared');
        } catch (error) {
            console.error('Error clearing storage:', error);
        }
    }
    
    /**
     * Sincroniza datos con localStorage
     */
    sync() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.data));
        } catch (error) {
            console.error('Error syncing data:', error);
            this.handleStorageQuota(error);
        }
    }
    
    // ==============================================
    // GESTIÓN DE DATOS ESPECÍFICOS
    // ==============================================
    
    /**
     * Guarda lista de residentes
     * @param {Array} residents - Lista de residentes
     */
    saveResidents(residents) {
        this.save('residents', residents);
    }
    
    /**
     * Carga lista de residentes
     * @returns {Array} Lista de residentes
     */
    getResidents() {
        return this.load('residents', []);
    }
    
    /**
     * Agrega un nuevo residente
     * @param {Object} resident - Datos del residente
     */
    addResident(resident) {
        const residents = this.getResidents();
        resident.id = this.generateId();
        resident.createdAt = new Date().toISOString();
        resident.updatedAt = new Date().toISOString();
        
        residents.push(resident);
        this.saveResidents(residents);
        
        return resident;
    }
    
    /**
     * Actualiza un residente existente
     * @param {number} id - ID del residente
     * @param {Object} updates - Datos a actualizar
     */
    updateResident(id, updates) {
        const residents = this.getResidents();
        const index = residents.findIndex(r => r.id === id);
        
        if (index !== -1) {
            residents[index] = {
                ...residents[index],
                ...updates,
                updatedAt: new Date().toISOString()
            };
            
            this.saveResidents(residents);
            return residents[index];
        }
        
        return null;
    }
    
    /**
     * Elimina un residente
     * @param {number} id - ID del residente
     */
    deleteResident(id) {
        const residents = this.getResidents();
        const filtered = residents.filter(r => r.id !== id);
        this.saveResidents(filtered);
    }
    
    /**
     * Busca residentes por criterios
     * @param {Object} criteria - Criterios de búsqueda
     * @returns {Array} Resultados de búsqueda
     */
    searchResidents(criteria) {
        const residents = this.getResidents();
        return residents.filter(resident => {
            return Object.keys(criteria).every(key => {
                const value = criteria[key];
                if (value === '' || value === null || value === undefined) {
                    return true;
                }
                
                const residentValue = resident[key];
                if (typeof value === 'string') {
                    return residentValue && residentValue.toString().toLowerCase().includes(value.toLowerCase());
                }
                
                return residentValue === value;
            });
        });
    }
    
    // Métodos similares para otros tipos de datos...
    
    /**
     * Guarda lista de pagos
     * @param {Array} payments - Lista de pagos
     */
    savePayments(payments) {
        this.save('payments', payments);
    }
    
    /**
     * Carga lista de pagos
     * @returns {Array} Lista de pagos
     */
    getPayments() {
        return this.load('payments', []);
    }
    
    /**
     * Agrega un nuevo pago
     * @param {Object} payment - Datos del pago
     */
    addPayment(payment) {
        const payments = this.getPayments();
        payment.id = this.generateId();
        payment.createdAt = new Date().toISOString();
        
        payments.push(payment);
        this.savePayments(payments);
        
        // Actualizar deuda del residente
        this.updateResidentDebt(payment.residentId, payment.amount);
        
        return payment;
    }
    
    /**
     * Actualiza la deuda de un residente
     * @param {number} residentId - ID del residente
     * @param {number} amount - Monto del pago
     */
    updateResidentDebt(residentId, amount) {
        const residents = this.getResidents();
        const resident = residents.find(r => r.id === residentId);
        
        if (resident) {
            // Calcular deuda total
            const payments = this.getPayments()
                .filter(p => p.residentId === residentId && p.status === 'pagado');
            
            const monthlyFee = this.getMonthlyFees();
            const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
            const expectedTotal = monthlyFee * this.getMonthCount();
            
            resident.debt = Math.max(0, expectedTotal - totalPaid);
            this.saveResidents(residents);
        }
    }
    
    /**
     * Guarda lista de mantenciones
     * @param {Array} maintenance - Lista de mantenciones
     */
    saveMaintenance(maintenance) {
        this.save('maintenance', maintenance);
    }
    
    /**
     * Carga lista de mantenciones
     * @returns {Array} Lista de mantenciones
     */
    getMaintenance() {
        return this.load('maintenance', []);
    }
    
    /**
     * Agrega una nueva solicitud de mantención
     * @param {Object} maintenance - Datos de la mantención
     */
    addMaintenance(maintenance) {
        const maintenanceList = this.getMaintenance();
        maintenance.id = this.generateId();
        maintenance.createdAt = new Date().toISOString();
        maintenance.status = maintenance.status || 'pendiente';
        
        maintenanceList.push(maintenance);
        this.saveMaintenance(maintenanceList);
        
        return maintenance;
    }
    
    /**
     * Actualiza el estado de una mantención
     * @param {number} id - ID de la mantención
     * @param {Object} updates - Datos a actualizar
     */
    updateMaintenance(id, updates) {
        const maintenanceList = this.getMaintenance();
        const index = maintenanceList.findIndex(m => m.id === id);
        
        if (index !== -1) {
            maintenanceList[index] = {
                ...maintenanceList[index],
                ...updates,
                updatedAt: new Date().toISOString()
            };
            
            this.saveMaintenance(maintenanceList);
            return maintenanceList[index];
        }
        
        return null;
    }
    
    /**
     * Guarda lista de anuncios
     * @param {Array} announcements - Lista de anuncios
     */
    saveAnnouncements(announcements) {
        this.save('announcements', announcements);
    }
    
    /**
     * Carga lista de anuncios
     * @returns {Array} Lista de anuncios
     */
    getAnnouncements() {
        return this.load('announcements', []);
    }
    
    /**
     * Agrega un nuevo anuncio
     * @param {Object} announcement - Datos del anuncio
     */
    addAnnouncement(announcement) {
        const announcements = this.getAnnouncements();
        announcement.id = this.generateId();
        announcement.createdAt = new Date().toISOString();
        
        announcements.unshift(announcement); // Añadir al inicio
        this.saveAnnouncements(announcements);
        
        return announcement;
    }
    
    /**
     * Guarda lista de reservas
     * @param {Array} reservations - Lista de reservas
     */
    saveReservations(reservations) {
        this.save('reservations', reservations);
    }
    
    /**
     * Carga lista de reservas
     * @returns {Array} Lista de reservas
     */
    getReservations() {
        return this.load('reservations', []);
    }
    
    /**
     * Agrega una nueva reserva
     * @param {Object} reservation - Datos de la reserva
     */
    addReservation(reservation) {
        const reservations = this.getReservations();
        
        // Verificar conflictos de horario
        if (this.hasScheduleConflict(reservation)) {
            throw new Error('Existe un conflicto de horario con otra reserva');
        }
        
        reservation.id = this.generateId();
        reservation.createdAt = new Date().toISOString();
        reservation.status = 'confirmada';
        
        reservations.push(reservation);
        this.saveReservations(reservations);
        
        return reservation;
    }
    
    /**
     * Verifica si hay conflictos de horario
     * @param {Object} reservation - Reserva a verificar
     * @returns {boolean} true si hay conflicto
     */
    hasScheduleConflict(reservation) {
        const reservations = this.getReservations();
        const existing = reservations.filter(r => 
            r.area === reservation.area &&
            r.date === reservation.date &&
            r.id !== reservation.id
        );
        
        return existing.some(r => {
            const start1 = parseInt(reservation.start.replace(':', ''));
            const end1 = parseInt(reservation.end.replace(':', ''));
            const start2 = parseInt(r.start.replace(':', ''));
            const end2 = parseInt(r.end.replace(':', ''));
            
            return (start1 < end2 && end1 > start2);
        });
    }
    
    // ==============================================
    // CONFIGURACIÓN Y METADATOS
    // ==============================================
    
    /**
     * Guarda configuración de la aplicación
     * @param {Object} config - Configuración
     */
    saveConfig(config) {
        this.save('config', config);
    }
    
    /**
     * Carga configuración de la aplicación
     * @returns {Object} Configuración
     */
    getConfig() {
        return this.load('config', {
            monthlyFees: 85000,
            buildingName: 'Condominio',
            address: '',
            administrator: '',
            phone: '',
            email: '',
            currency: 'CLP'
        });
    }
    
    /**
     * Obtiene los gastos comunes mensuales
     * @returns {number} Monto mensual
     */
    getMonthlyFees() {
        const config = this.getConfig();
        return config.monthlyFees || 85000;
    }
    
    /**
     * Actualiza los gastos comunes mensuales
     * @param {number} amount - Nuevo monto
     */
    setMonthlyFees(amount) {
        const config = this.getConfig();
        config.monthlyFees = amount;
        this.saveConfig(config);
    }
    
    /**
     * Obtiene el número de meses desde el primer registro
     * @returns {number} Número de meses
     */
    getMonthCount() {
        const residents = this.getResidents();
        if (residents.length === 0) return 1;
        
        const oldest = Math.min(...residents.map(r => new Date(r.createdAt).getTime()));
        const now = new Date();
        const months = (now.getFullYear() - new Date(oldest).getFullYear()) * 12 + 
                      (now.getMonth() - new Date(oldest).getMonth()) + 1;
        
        return Math.max(1, months);
    }
    
    // ==============================================
    // RESPALDO Y RESTAURACIÓN
    // ==============================================
    
    /**
     * Crea un respaldo de los datos
     */
    createBackup() {
        try {
            const data = this.load();
            const backup = {
                timestamp: new Date().toISOString(),
                version: this.version,
                data: data
            };
            
            localStorage.setItem('conadmin_backup', JSON.stringify(backup));
            console.log('Backup created');
        } catch (error) {
            console.error('Error creating backup:', error);
        }
    }
    
    /**
     * Restaura datos desde un respaldo
     * @param {string} backupData - Datos del respaldo
     */
    restoreBackup(backupData) {
        try {
            const backup = JSON.parse(backupData);
            if (backup.data) {
                this.data = backup.data;
                this.sync();
                console.log('Backup restored');
                return true;
            }
        } catch (error) {
            console.error('Error restoring backup:', error);
        }
        return false;
    }
    
    /**
     * Inicia el respaldo automático
     */
    startAutoBackup() {
        setInterval(() => {
            this.createBackup();
        }, this.backupInterval);
    }
    
    /**
     * Exporta todos los datos como JSON
     * @returns {string} Datos exportados
     */
    exportData() {
        const data = this.load();
        return JSON.stringify({
            exportDate: new Date().toISOString(),
            version: this.version,
            data: data
        }, null, 2);
    }
    
    /**
     * Importa datos desde JSON
     * @param {string} jsonData - Datos en formato JSON
     * @returns {boolean} true si la importación fue exitosa
     */
    importData(jsonData) {
        try {
            const imported = JSON.parse(jsonData);
            if (imported.data) {
                this.data = { ...this.data, ...imported.data };
                this.sync();
                console.log('Data imported successfully');
                return true;
            }
        } catch (error) {
            console.error('Error importing data:', error);
            this.showStorageError('Error al importar datos. Verifique el formato del archivo.');
        }
        return false;
    }
    
    // ==============================================
    // ESTADÍSTICAS Y REPORTES
    // ==============================================
    
    /**
     * Obtiene estadísticas generales
     * @returns {Object} Estadísticas
     */
    getStatistics() {
        const residents = this.getResidents();
        const payments = this.getPayments();
        const maintenance = this.getMaintenance();
        
        const totalDebt = residents.reduce((sum, r) => sum + (r.debt || 0), 0);
        const occupancyRate = this.calculateOccupancyRate(residents);
        const monthlyIncome = this.getMonthlyFees() * residents.filter(r => r.status !== 'vacant').length;
        
        return {
            totalResidents: residents.length,
            occupancyRate: occupancyRate,
            totalDebt: totalDebt,
            monthlyIncome: monthlyIncome,
            pendingMaintenance: maintenance.filter(m => m.status === 'pendiente').length,
            pendingPayments: residents.filter(r => (r.debt || 0) > 0).length
        };
    }
    
    /**
     * Calcula la tasa de ocupación
     * @param {Array} residents - Lista de residentes
     * @returns {number} Porcentaje de ocupación
     */
    calculateOccupancyRate(residents) {
        const totalUnits = residents.length;
        const occupiedUnits = residents.filter(r => r.status !== 'vacant').length;
        
        return totalUnits > 0 ? Math.round((occupiedUnits / totalUnits) * 100) : 0;
    }
    
    /**
     * Obtiene datos para gráficos financieros
     * @returns {Object} Datos para gráficos
     */
    getFinancialChartData() {
        const payments = this.getPayments();
        const monthlyData = {};
        
        // Agrupar pagos por mes
        payments.forEach(payment => {
            if (payment.status === 'pagado') {
                const month = new Date(payment.date).toISOString().substring(0, 7); // YYYY-MM
                if (!monthlyData[month]) {
                    monthlyData[month] = 0;
                }
                monthlyData[month] += payment.amount;
            }
        });
        
        // Preparar datos para Chart.js
        const labels = Object.keys(monthlyData).sort();
        const data = labels.map(month => monthlyData[month]);
        
        return {
            labels: labels,
            datasets: [{
                label: 'Ingresos Mensuales',
                data: data,
                borderColor: '#007BFF',
                backgroundColor: 'rgba(0, 123, 255, 0.1)',
                tension: 0.4
            }]
        };
    }
    
    // ==============================================
    // UTILIDADES
    // ==============================================
    
    /**
     * Genera un ID único
     * @returns {string} ID único
     */
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
    }
    
    /**
     * Verifica el uso de almacenamiento
     * @returns {Object} Información de uso
     */
    getStorageInfo() {
        try {
            const used = new Blob([localStorage.getItem(this.storageKey)]).size;
            const total = 5 * 1024 * 1024; // 5MB típico de localStorage
            
            return {
                used: used,
                total: total,
                percentage: Math.round((used / total) * 100),
                available: total - used
            };
        } catch (error) {
            console.error('Error getting storage info:', error);
            return { used: 0, total: 0, percentage: 0, available: 0 };
        }
    }
    
    /**
     * Maneja errores de cuota de almacenamiento
     * @param {Error} error - Error de cuota
     */
    handleStorageQuota(error) {
        if (error.name === 'QuotaExceededError') {
            this.showStorageError('Espacio de almacenamiento lleno. Se eliminarán datos antiguos.');
            this.cleanupOldData();
        }
    }
    
    /**
     * Limpia datos antiguos para liberar espacio
     */
    cleanupOldData() {
        const maintenance = this.getMaintenance();
        const oldMaintenance = maintenance.filter(m => {
            const daysSinceCreated = (new Date() - new Date(m.createdAt)) / (1000 * 60 * 60 * 24);
            return daysSinceCreated > 365 && m.status === 'completado';
        });
        
        if (oldMaintenance.length > 0) {
            const updatedMaintenance = maintenance.filter(m => !oldMaintenance.includes(m));
            this.saveMaintenance(updatedMaintenance);
            console.log(`Cleaned up ${oldMaintenance.length} old maintenance records`);
        }
    }
    
    /**
     * Muestra un error de almacenamiento
     * @param {string} message - Mensaje de error
     */
    showStorageError(message) {
        console.error('Storage Error:', message);
        // Implementar notificación visual
        if (window.conAdminApp) {
            window.conAdminApp.showNotification(message, 'error');
        }
    }
    
    /**
     * Verifica la integridad de los datos
     * @returns {Object} Resultado de la verificación
     */
    verifyDataIntegrity() {
        const issues = [];
        
        try {
            const residents = this.getResidents();
            const payments = this.getPayments();
            
            // Verificar referencias huérfanas
            payments.forEach(payment => {
                if (!residents.find(r => r.id === payment.residentId)) {
                    issues.push(`Pago ${payment.id} hace referencia a residente inexistente ${payment.residentId}`);
                }
            });
            
            // Verificar deuda inconsistente
            residents.forEach(resident => {
                const residentPayments = payments.filter(p => 
                    p.residentId === resident.id && p.status === 'pagado'
                );
                
                const monthlyFee = this.getMonthlyFees();
                const totalExpected = monthlyFee * this.getMonthCount();
                const totalPaid = residentPayments.reduce((sum, p) => sum + p.amount, 0);
                const expectedDebt = Math.max(0, totalExpected - totalPaid);
                
                if (Math.abs(resident.debt - expectedDebt) > 1) {
                    issues.push(`Residente ${resident.id} tiene deuda inconsistente: ${resident.debt} vs ${expectedDebt}`);
                }
            });
            
        } catch (error) {
            issues.push(`Error al verificar integridad: ${error.message}`);
        }
        
        return {
            isValid: issues.length === 0,
            issues: issues
        };
    }
}

// ==============================================
// INICIALIZACIÓN
// ==============================================

// Crear instancia global del almacenamiento
window.ConAdminStorage = new ConAdminStorage();