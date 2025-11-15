/**
 * ConAdmin Chile - Charts Management
 * Gestión de Gráficos y Visualizaciones
 */

// ==============================================
// CLASE DE GESTIÓN DE GRÁFICOS
// ==============================================

class ChartManager {
    constructor() {
        this.charts = new Map();
        this.chartLibrary = null;
        this.init();
    }
    
    async init() {
        // Cargar Chart.js dinámicamente
        await this.loadChartLibrary();
        this.setupChartStyles();
    }
    
    /**
     * Carga la librería de gráficos
     */
    async loadChartLibrary() {
        return new Promise((resolve, reject) => {
            // Verificar si Chart.js ya está cargado
            if (typeof Chart !== 'undefined') {
                this.chartLibrary = Chart;
                resolve();
                return;
            }
            
            // Cargar Chart.js desde CDN
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
            script.onload = () => {
                this.chartLibrary = Chart;
                resolve();
            };
            script.onerror = () => {
                console.warn('Chart.js no pudo ser cargado. Usando gráficos de respaldo.');
                this.createFallbackCharts();
                resolve();
            };
            
            document.head.appendChild(script);
        });
    }
    
    /**
     * Configura los estilos para los gráficos
     */
    setupChartStyles() {
        if (!this.chartLibrary) return;
        
        // Configurar colores globales
        this.chartLibrary.defaults.color = '#565E64';
        this.chartLibrary.defaults.backgroundColor = 'rgba(0, 123, 255, 0.1)';
        this.chartLibrary.defaults.borderColor = '#007BFF';
        this.chartLibrary.defaults.font.family = "'Inter', sans-serif";
    }
    
    /**
     * Crea gráficos de respaldo cuando Chart.js no está disponible
     */
    createFallbackCharts() {
        // Crear gráficos simples con CSS para mostrar datos básicos
        console.log('Creating fallback charts without Chart.js');
        this.createSimpleBarChart();
    }
    
    /**
     * Crea un gráfico de barras simple con CSS
     */
    createSimpleBarChart() {
        const container = document.querySelector('.chart-container');
        if (!container) return;
        
        const data = this.getFinancialData();
        const maxValue = Math.max(...data.values);
        
        const chartHTML = `
            <div class="simple-bar-chart">
                ${data.labels.map((label, index) => {
                    const percentage = (data.values[index] / maxValue) * 100;
                    return `
                        <div class="bar-item">
                            <div class="bar-label">${label}</div>
                            <div class="bar-container">
                                <div class="bar-fill" style="width: ${percentage}%"></div>
                            </div>
                            <div class="bar-value">$${(data.values[index] / 1000).toFixed(0)}k</div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
        
        container.innerHTML = chartHTML;
    }
    
    // ==============================================
    // GRÁFICO FINANCIERO PRINCIPAL
    // ==============================================
    
    /**
     * Crea el gráfico financiero principal
     */
    createFinancialChart() {
        const canvas = document.getElementById('financial-chart');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        const data = this.getFinancialChartData();
        
        // Destruir gráfico existente si existe
        if (this.charts.has('financial')) {
            this.charts.get('financial').destroy();
        }
        
        if (!this.chartLibrary) {
            this.createFallbackCharts();
            return;
        }
        
        const config = {
            type: 'line',
            data: {
                labels: data.labels,
                datasets: [{
                    label: 'Ingresos Mensuales',
                    data: data.datasets[0].data,
                    borderColor: '#007BFF',
                    backgroundColor: 'rgba(0, 123, 255, 0.1)',
                    tension: 0.4,
                    fill: true,
                    pointBackgroundColor: '#007BFF',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2,
                    pointRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    intersect: false,
                    mode: 'index'
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: 'rgba(23, 26, 28, 0.9)',
                        titleColor: '#ffffff',
                        bodyColor: '#ffffff',
                        borderColor: '#007BFF',
                        borderWidth: 1,
                        cornerRadius: 8,
                        displayColors: false,
                        callbacks: {
                            title: (context) => {
                                const date = new Date(context[0].label);
                                return date.toLocaleDateString('es-CL', { 
                                    year: 'numeric', 
                                    month: 'long' 
                                });
                            },
                            label: (context) => {
                                return `Ingresos: ${window.ConAdminUtils.formatCurrency(context.parsed.y)}`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            callback: (value, index) => {
                                const label = data.labels[index];
                                return new Date(label).toLocaleDateString('es-CL', { month: 'short' });
                            }
                        }
                    },
                    y: {
                        grid: {
                            color: 'rgba(217, 223, 228, 0.3)'
                        },
                        ticks: {
                            callback: (value) => {
                                return window.ConAdminUtils.formatCurrency(value);
                            }
                        }
                    }
                },
                elements: {
                    point: {
                        hoverRadius: 8
                    }
                }
            }
        };
        
        const chart = new this.chartLibrary(ctx, config);
        this.charts.set('financial', chart);
    }
    
    /**
     * Obtiene datos para el gráfico financiero
     * @returns {Object} Datos del gráfico
     */
    getFinancialChartData() {
        const payments = window.ConAdminStorage ? 
            window.ConAdminStorage.getPayments().filter(p => p.status === 'pagado') : 
            [];
        
        // Agrupar pagos por mes
        const monthlyData = {};
        payments.forEach(payment => {
            const month = new Date(payment.date).toISOString().substring(0, 7);
            if (!monthlyData[month]) {
                monthlyData[month] = 0;
            }
            monthlyData[month] += payment.amount;
        });
        
        // Generar últimos 6 meses
        const labels = [];
        const data = [];
        const now = new Date();
        
        for (let i = 5; i >= 0; i--) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const monthKey = date.toISOString().substring(0, 7);
            const monthName = date.toLocaleDateString('es-CL', { month: 'long', year: 'numeric' });
            
            labels.push(monthKey);
            data.push(monthlyData[monthKey] || 0);
        }
        
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
    
    /**
     * Obtiene datos simplificados para gráficos de respaldo
     * @returns {Object} Datos simplificados
     */
    getFinancialData() {
        const data = this.getFinancialChartData();
        return {
            labels: data.labels.map(label => {
                return new Date(label).toLocaleDateString('es-CL', { month: 'short' });
            }),
            values: data.datasets[0].data
        };
    }
    
    // ==============================================
    // GRÁFICO DE ESTADO DE PAGOS
    // ==============================================
    
    /**
     * Crea el gráfico de estado de pagos
     * @param {string} canvasId - ID del canvas
     */
    createPaymentStatusChart(canvasId = 'payment-status-chart') {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        const data = this.getPaymentStatusData();
        
        if (!this.chartLibrary) {
            this.createPaymentStatusFallback(canvasId);
            return;
        }
        
        // Destruir gráfico existente si existe
        if (this.charts.has('payment-status')) {
            this.charts.get('payment-status').destroy();
        }
        
        const config = {
            type: 'doughnut',
            data: {
                labels: ['Al día', 'Pendiente', 'Atrasado'],
                datasets: [{
                    data: [data.alDia, data.pendiente, data.atrasado],
                    backgroundColor: [
                        '#28a745',
                        '#ffc107',
                        '#dc3545'
                    ],
                    borderColor: '#ffffff',
                    borderWidth: 3,
                    hoverOffset: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 20,
                            usePointStyle: true,
                            pointStyle: 'circle'
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(23, 26, 28, 0.9)',
                        titleColor: '#ffffff',
                        bodyColor: '#ffffff',
                        borderColor: '#007BFF',
                        borderWidth: 1,
                        cornerRadius: 8,
                        callbacks: {
                            label: (context) => {
                                const label = context.label || '';
                                const value = context.parsed;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
                                return `${label}: ${value} (${percentage}%)`;
                            }
                        }
                    }
                },
                cutout: '60%'
            }
        };
        
        const chart = new this.chartLibrary(ctx, config);
        this.charts.set('payment-status', chart);
    }
    
    /**
     * Obtiene datos de estado de pagos
     * @returns {Object} Datos de estado
     */
    getPaymentStatusData() {
        const residents = window.ConAdminStorage ? window.ConAdminStorage.getResidents() : [];
        
        const alDia = residents.filter(r => (r.debt || 0) === 0 && r.status !== 'vacant').length;
        const pendiente = residents.filter(r => (r.debt || 0) > 0 && (r.debt || 0) <= 100000).length;
        const atrasado = residents.filter(r => (r.debt || 0) > 100000).length;
        
        return { alDia, pendiente, atrasado };
    }
    
    /**
     * Crea gráfico de respaldo para estado de pagos
     * @param {string} canvasId - ID del canvas
     */
    createPaymentStatusFallback(canvasId) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;
        
        const data = this.getPaymentStatusData();
        const total = data.alDia + data.pendiente + data.atrasado;
        
        const chartHTML = `
            <div class="pie-chart-fallback">
                <div class="pie-legend">
                    <div class="legend-item">
                        <span class="legend-color" style="background-color: #28a745;"></span>
                        <span>Al día: ${data.alDia}</span>
                    </div>
                    <div class="legend-item">
                        <span class="legend-color" style="background-color: #ffc107;"></span>
                        <span>Pendiente: ${data.pendiente}</span>
                    </div>
                    <div class="legend-item">
                        <span class="legend-color" style="background-color: #dc3545;"></span>
                        <span>Atrasado: ${data.atrasado}</span>
                    </div>
                </div>
                <div class="pie-visual">
                    <div class="pie-segment" style="background: conic-gradient(#28a745 0% ${data.alDia/total*100}%, #ffc107 ${data.alDia/total*100}% ${(data.alDia+data.pendiente)/total*100}%, #dc3545 ${(data.alDia+data.pendiente)/total*100}% 100%);"></div>
                </div>
            </div>
        `;
        
        canvas.parentNode.innerHTML = chartHTML;
    }
    
    // ==============================================
    // GRÁFICO DE OCCUPANCY
    // ==============================================
    
    /**
     * Crea el gráfico de ocupación
     * @param {string} canvasId - ID del canvas
     */
    createOccupancyChart(canvasId = 'occupancy-chart') {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        const data = this.getOccupancyData();
        
        if (!this.chartLibrary) {
            this.createOccupancyFallback(canvasId);
            return;
        }
        
        // Destruir gráfico existente si existe
        if (this.charts.has('occupancy')) {
            this.charts.get('occupancy').destroy();
        }
        
        const config = {
            type: 'doughnut',
            data: {
                labels: ['Ocupado', 'Vacante'],
                datasets: [{
                    data: [data.occupied, data.vacant],
                    backgroundColor: [
                        '#007BFF',
                        '#D9DFE4'
                    ],
                    borderColor: '#ffffff',
                    borderWidth: 3,
                    hoverOffset: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 20,
                            usePointStyle: true,
                            pointStyle: 'circle'
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(23, 26, 28, 0.9)',
                        titleColor: '#ffffff',
                        bodyColor: '#ffffff',
                        borderColor: '#007BFF',
                        borderWidth: 1,
                        cornerRadius: 8,
                        callbacks: {
                            label: (context) => {
                                const label = context.label || '';
                                const value = context.parsed;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
                                return `${label}: ${value} (${percentage}%)`;
                            }
                        }
                    }
                },
                cutout: '70%'
            }
        };
        
        const chart = new this.chartLibrary(ctx, config);
        this.charts.set('occupancy', chart);
    }
    
    /**
     * Obtiene datos de ocupación
     * @returns {Object} Datos de ocupación
     */
    getOccupancyData() {
        const residents = window.ConAdminStorage ? window.ConAdminStorage.getResidents() : [];
        
        const total = residents.length;
        const occupied = residents.filter(r => r.status !== 'vacant').length;
        const vacant = total - occupied;
        
        return { total, occupied, vacant };
    }
    
    /**
     * Crea gráfico de respaldo para ocupación
     * @param {string} canvasId - ID del canvas
     */
    createOccupancyFallback(canvasId) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;
        
        const data = this.getOccupancyData();
        const total = data.total;
        const occupiedPercent = total > 0 ? (data.occupied / total) * 100 : 0;
        
        const chartHTML = `
            <div class="occupancy-fallback">
                <div class="occupancy-percentage">
                    <div class="percentage-circle">
                        <div class="percentage-text">${occupiedPercent.toFixed(0)}%</div>
                    </div>
                </div>
                <div class="occupancy-details">
                    <div class="detail-item">
                        <span class="detail-label">Ocupado:</span>
                        <span class="detail-value">${data.occupied} de ${total}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Vacante:</span>
                        <span class="detail-value">${data.vacant}</span>
                    </div>
                </div>
            </div>
        `;
        
        canvas.parentNode.innerHTML = chartHTML;
    }
    
    // ==============================================
    // GRÁFICO DE MANTENCIONES
    // ==============================================
    
    /**
     * Crea el gráfico de mantenciones
     * @param {string} canvasId - ID del canvas
     */
    createMaintenanceChart(canvasId = 'maintenance-chart') {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        const data = this.getMaintenanceData();
        
        if (!this.chartLibrary) {
            this.createMaintenanceFallback(canvasId);
            return;
        }
        
        // Destruir gráfico existente si existe
        if (this.charts.has('maintenance')) {
            this.charts.get('maintenance').destroy();
        }
        
        const config = {
            type: 'bar',
            data: {
                labels: ['Pendiente', 'En Proceso', 'Completado'],
                datasets: [{
                    label: 'Mantenciones',
                    data: [data.pendiente, data.enProceso, data.completado],
                    backgroundColor: [
                        '#ffc107',
                        '#17a2b8',
                        '#28a745'
                    ],
                    borderColor: [
                        '#ffc107',
                        '#17a2b8',
                        '#28a745'
                    ],
                    borderWidth: 1,
                    borderRadius: 4,
                    borderSkipped: false
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: 'rgba(23, 26, 28, 0.9)',
                        titleColor: '#ffffff',
                        bodyColor: '#ffffff',
                        borderColor: '#007BFF',
                        borderWidth: 1,
                        cornerRadius: 8,
                        callbacks: {
                            label: (context) => {
                                return `${context.label}: ${context.parsed.y} mantenciones`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: {
                            display: false
                        }
                    },
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(217, 223, 228, 0.3)'
                        },
                        ticks: {
                            stepSize: 1
                        }
                    }
                }
            }
        };
        
        const chart = new this.chartLibrary(ctx, config);
        this.charts.set('maintenance', chart);
    }
    
    /**
     * Obtiene datos de mantenciones
     * @returns {Object} Datos de mantenciones
     */
    getMaintenanceData() {
        const maintenance = window.ConAdminStorage ? window.ConAdminStorage.getMaintenance() : [];
        
        return {
            pendiente: maintenance.filter(m => m.status === 'pendiente').length,
            enProceso: maintenance.filter(m => m.status === 'en_proceso').length,
            completado: maintenance.filter(m => m.status === 'completado').length
        };
    }
    
    /**
     * Crea gráfico de respaldo para mantenciones
     * @param {string} canvasId - ID del canvas
     */
    createMaintenanceFallback(canvasId) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;
        
        const data = this.getMaintenanceData();
        const maxValue = Math.max(data.pendiente, data.enProceso, data.completado, 1);
        
        const chartHTML = `
            <div class="bar-chart-fallback">
                ${Object.entries(data).map(([key, value]) => {
                    const percentage = (value / maxValue) * 100;
                    const colors = {
                        pendiente: '#ffc107',
                        enProceso: '#17a2b8',
                        completado: '#28a745'
                    };
                    const labels = {
                        pendiente: 'Pendiente',
                        enProceso: 'En Proceso',
                        completado: 'Completado'
                    };
                    
                    return `
                        <div class="bar-item-fallback">
                            <div class="bar-label-fallback">${labels[key]}</div>
                            <div class="bar-container-fallback">
                                <div class="bar-fill-fallback" style="width: ${percentage}%; background-color: ${colors[key]}"></div>
                            </div>
                            <div class="bar-value-fallback">${value}</div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
        
        canvas.parentNode.innerHTML = chartHTML;
    }
    
    // ==============================================
    // ACTUALIZACIÓN DE GRÁFICOS
    // ==============================================
    
    /**
     * Actualiza todos los gráficos
     */
    updateAllCharts() {
        this.createFinancialChart();
        
        // Solo actualizar gráficos adicionales si existen en la página
        const paymentStatusChart = document.getElementById('payment-status-chart');
        if (paymentStatusChart) {
            this.createPaymentStatusChart();
        }
        
        const occupancyChart = document.getElementById('occupancy-chart');
        if (occupancyChart) {
            this.createOccupancyChart();
        }
        
        const maintenanceChart = document.getElementById('maintenance-chart');
        if (maintenanceChart) {
            this.createMaintenanceChart();
        }
    }
    
    /**
     * Redimensiona todos los gráficos
     */
    resizeAllCharts() {
        this.charts.forEach((chart, key) => {
            try {
                chart.resize();
            } catch (error) {
                console.warn(`Error resizing chart ${key}:`, error);
            }
        });
    }
    
    /**
     * Destruye todos los gráficos
     */
    destroyAllCharts() {
        this.charts.forEach((chart, key) => {
            try {
                chart.destroy();
            } catch (error) {
                console.warn(`Error destroying chart ${key}:`, error);
            }
        });
        this.charts.clear();
    }
}

// ==============================================
// ESTILOS CSS PARA GRÁFICOS DE RESPALDO
// ==============================================

const fallbackChartStyles = `
    .simple-bar-chart {
        padding: 1rem;
    }
    
    .bar-item {
        display: flex;
        align-items: center;
        margin-bottom: 0.75rem;
        gap: 0.75rem;
    }
    
    .bar-label {
        width: 60px;
        font-size: 0.875rem;
        font-weight: 500;
        color: #565E64;
        flex-shrink: 0;
    }
    
    .bar-container {
        flex: 1;
        height: 20px;
        background-color: #F0F3F5;
        border-radius: 10px;
        overflow: hidden;
    }
    
    .bar-fill {
        height: 100%;
        background-color: #007BFF;
        transition: width 0.3s ease;
    }
    
    .bar-value {
        width: 50px;
        font-size: 0.875rem;
        font-weight: 600;
        color: #171A1C;
        text-align: right;
    }
    
    .pie-chart-fallback {
        display: flex;
        align-items: center;
        justify-content: space-around;
        padding: 1rem;
        flex-wrap: wrap;
        gap: 1rem;
    }
    
    .pie-visual {
        width: 120px;
        height: 120px;
        border-radius: 50%;
        background: conic-gradient(#28a745 0% 60%, #ffc107 60% 85%, #dc3545 85% 100%);
    }
    
    .pie-legend {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }
    
    .legend-item {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.875rem;
    }
    
    .legend-color {
        width: 12px;
        height: 12px;
        border-radius: 50%;
    }
    
    .occupancy-fallback {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 1rem;
        gap: 1rem;
    }
    
    .percentage-circle {
        width: 100px;
        height: 100px;
        border-radius: 50%;
        background: conic-gradient(#007BFF 0% 85%, #D9DFE4 85% 100%);
        display: flex;
        align-items: center;
        justify-content: center;
    }
    
    .percentage-text {
        font-size: 1.5rem;
        font-weight: 700;
        color: #007BFF;
    }
    
    .occupancy-details {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
        text-align: center;
    }
    
    .detail-item {
        display: flex;
        justify-content: space-between;
        gap: 1rem;
        font-size: 0.875rem;
    }
    
    .detail-label {
        color: #565E64;
    }
    
    .detail-value {
        font-weight: 600;
        color: #171A1C;
    }
    
    .bar-chart-fallback {
        padding: 1rem;
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
    }
    
    .bar-item-fallback {
        display: flex;
        align-items: center;
        gap: 0.75rem;
    }
    
    .bar-label-fallback {
        width: 80px;
        font-size: 0.875rem;
        font-weight: 500;
        color: #565E64;
        flex-shrink: 0;
    }
    
    .bar-container-fallback {
        flex: 1;
        height: 24px;
        background-color: #F0F3F5;
        border-radius: 4px;
        overflow: hidden;
    }
    
    .bar-fill-fallback {
        height: 100%;
        transition: width 0.3s ease;
    }
    
    .bar-value-fallback {
        width: 30px;
        text-align: center;
        font-size: 0.875rem;
        font-weight: 600;
        color: #171A1C;
    }
`;

// ==============================================
// INICIALIZACIÓN
// ==============================================

// Crear instancia global del manager de gráficos
window.ChartManager = new ChartManager();

// Función para actualizar gráficos cuando los datos cambien
window.updateCharts = function() {
    if (window.ChartManager) {
        window.ChartManager.updateAllCharts();
    }
};

// Función para redimensionar gráficos
window.resizeCharts = function() {
    if (window.ChartManager) {
        window.ChartManager.resizeAllCharts();
    }
};

// Agregar estilos de gráficos de respaldo
const styleSheet = document.createElement('style');
styleSheet.textContent = fallbackChartStyles;
document.head.appendChild(styleSheet);

// Redimensionar gráficos cuando la ventana cambie de tamaño
window.addEventListener('resize', window.resizeCharts);