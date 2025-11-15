/**
 * ConAdmin Chile - Main Application Script
 * Aplicación Principal de Administración de Condominios
 */

// ==============================================
// CLASE DE AUTENTICACIÓN
// ==============================================

class AuthManager {
    constructor() {
        this.storageKey = 'conadmin_auth';
        this.users = this.getDefaultUsers();
        this.currentUser = null;
    }

    getDefaultUsers() {
        return {
            'admin': {
                password: 'condo123',
                role: 'administrador',
                name: 'Administrador',
                email: 'admin@condominio.cl'
            }
        };
    }

    async login(username, password) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const user = this.users[username];
                if (user && user.password === password) {
                    const authData = {
                        username: username,
                        role: user.role,
                        name: user.name,
                        email: user.email,
                        loginTime: new Date().toISOString()
                    };
                    
                    localStorage.setItem(this.storageKey, JSON.stringify(authData));
                    this.currentUser = authData;
                    resolve(authData);
                } else {
                    reject(new Error('Usuario o contraseña incorrectos'));
                }
            }, 1000); // Simular delay de red
        });
    }

    logout() {
        localStorage.removeItem(this.storageKey);
        this.currentUser = null;
    }

    isAuthenticated() {
        if (this.currentUser) return true;
        
        const stored = localStorage.getItem(this.storageKey);
        if (stored) {
            this.currentUser = JSON.parse(stored);
            return true;
        }
        return false;
    }

    getCurrentUser() {
        if (!this.currentUser) {
            const stored = localStorage.getItem(this.storageKey);
            if (stored) {
                this.currentUser = JSON.parse(stored);
            }
        }
        return this.currentUser;
    }
}

// ==============================================
// CONFIGURACIÓN GLOBAL Y INICIALIZACIÓN
// ==============================================

class ConAdminApp {
    constructor() {
        this.currentSection = 'dashboard';
        this.isLoading = true;
        this.sidebarOpen = false;
        this.authManager = new AuthManager();
        
        // Datos de la aplicación (simulados)
        this.data = {
            residents: [],
            payments: [],
            maintenance: [],
            announcements: [],
            reservations: [],
            notifications: []
        };
        
        // Inicializar la aplicación
        this.init();
    }
    
    async init() {
        try {
            // Esperar a que Lucide icons se cargue
            await this.waitForLucide();
            
            // Verificar autenticación
            if (this.authManager.isAuthenticated()) {
                await this.initializeApp();
            } else {
                this.showLoginScreen();
            }
        } catch (error) {
            console.error('Error inicializando aplicación:', error);
            this.showError('Error al inicializar la aplicación');
        }
    }

    async initializeApp() {
        try {
            // Mostrar pantalla de carga
            this.showLoadingScreen();
            
            // Inicializar componentes
            this.initEventListeners();
            this.initNavigation();
            this.initModals();
            this.initForms();
            this.initStorage();
            this.loadInitialData();
            
            // Inicializar secciones
            this.initSections();
            
            // Actualizar UI
            this.updateUI();
            
            // Ocultar loading y mostrar app
            setTimeout(() => {
                this.hideLoadingScreen();
                this.showMainApp();
            }, 1500);
            
        } catch (error) {
            console.error('Error inicializando componentes:', error);
            this.showError('Error al cargar la aplicación');
        }
    }
            
            // Ocultar pantalla de carga
            this.hideLoadingScreen();
            
            console.log('ConAdmin Chile initialized successfully');
        } catch (error) {
            console.error('Error initializing ConAdmin:', error);
            this.showError('Error al inicializar la aplicación');
        }
    }
    
    waitForLucide() {
        return new Promise((resolve) => {
            const checkLucide = () => {
                if (typeof lucide !== 'undefined' && lucide.createIcons) {
                    // Crear iconos iniciales
                    lucide.createIcons();
                    resolve();
                } else {
                    setTimeout(checkLucide, 100);
                }
            };
            checkLucide();
        });
    }
    
    showLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.style.display = 'flex';
        }
    }
    
    hideLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            setTimeout(() => {
                loadingScreen.style.display = 'none';
                this.isLoading = false;
            }, 1000);
        }
    }
    
    showLoginScreen() {
        const loginScreen = document.getElementById('login-screen');
        const mainLayout = document.getElementById('main-layout');
        if (loginScreen) {
            loginScreen.style.display = 'flex';
        }
        if (mainLayout) {
            mainLayout.style.display = 'none';
        }
    }
    
    showMainApp() {
        const loginScreen = document.getElementById('login-screen');
        const mainLayout = document.getElementById('main-layout');
        if (loginScreen) {
            loginScreen.style.display = 'none';
        }
        if (mainLayout) {
            mainLayout.style.display = 'flex';
        }
    }
    
    async handleLogin(event) {
        event.preventDefault();
        
        const form = event.target;
        const submitBtn = form.querySelector('button[type="submit"]');
        const username = form.username.value.trim();
        const password = form.password.value;
        
        if (!username || !password) {
            this.showError('Por favor complete todos los campos');
            return;
        }
        
        // Mostrar estado de carga
        submitBtn.classList.add('loading');
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i data-lucide="loader"></i> Iniciando sesión...';
        
        try {
            await this.authManager.login(username, password);
            await this.initializeApp();
        } catch (error) {
            this.showError(error.message);
            
            // Restaurar botón
            submitBtn.classList.remove('loading');
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i data-lucide="log-in"></i> Iniciar Sesión';
            
            // Limpiar formulario
            form.password.value = '';
            form.password.focus();
        }
    }
    
    handleLogout() {
        this.authManager.logout();
        this.showLoginScreen();
        
        // Limpiar datos de la aplicación
        this.data = {
            residents: [],
            payments: [],
            maintenance: [],
            announcements: [],
            reservations: [],
            notifications: []
        };
    }
    
    showError(message) {
        // Crear notificación de error
        const notification = document.createElement('div');
        notification.className = 'notification error';
        notification.innerHTML = `
            <i data-lucide="alert-circle"></i>
            <span>${message}</span>
            <button class="notification-close">&times;</button>
        `;
        
        document.body.appendChild(notification);
        
        // Mostrar notificación
        setTimeout(() => notification.classList.add('show'), 100);
        
        // Auto-cerrar después de 5 segundos
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => document.body.removeChild(notification), 300);
        }, 5000);
        
        // Cerrar al hacer clic en X
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => {
            notification.classList.remove('show');
            setTimeout(() => document.body.removeChild(notification), 300);
        });
        
        console.error(message);
    }
}

// ==============================================
// GESTIÓN DE NAVEGACIÓN
// ==============================================

ConAdminApp.prototype.initNavigation = function() {
    // Event listeners para navegación
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const section = link.getAttribute('data-section');
            if (section) {
                this.navigateToSection(section);
            }
        });
    });
    
    // Mobile menu toggle
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenuOverlay = document.getElementById('mobile-menu-overlay');
    const sidebar = document.getElementById('sidebar');
    
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', () => {
            this.toggleMobileMenu();
        });
    }
    
    if (mobileMenuOverlay) {
        mobileMenuOverlay.addEventListener('click', () => {
            this.closeMobileMenu();
        });
    }
    
    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
        if (this.sidebarOpen && 
            !sidebar.contains(e.target) && 
            e.target !== mobileMenuBtn) {
            this.closeMobileMenu();
        }
    });
};

ConAdminApp.prototype.navigateToSection = function(sectionName) {
    // Update navigation active state
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('data-section') === sectionName) {
            link.classList.add('active');
        }
    });
    
    // Update page title
    const pageTitle = document.getElementById('page-title');
    if (pageTitle) {
        const titles = {
            'dashboard': 'Dashboard',
            'residents': 'Residentes',
            'finances': 'Finanzas',
            'maintenance': 'Mantenciones',
            'communications': 'Comunicaciones',
            'common-areas': 'Áreas Comunes',
            'reports': 'Reportes'
        };
        pageTitle.textContent = titles[sectionName] || 'Dashboard';
    }
    
    // Show/hide sections
    const sections = document.querySelectorAll('.content-section');
    sections.forEach(section => {
        section.classList.remove('active');
        if (section.id === `${sectionName}-section`) {
            section.classList.add('active');
        }
    });
    
    // Update current section
    this.currentSection = sectionName;
    
    // Close mobile menu on navigation
    if (window.innerWidth <= 767) {
        this.closeMobileMenu();
    }
    
    // Update specific section data
    this.updateSectionData(sectionName);
};

ConAdminApp.prototype.toggleMobileMenu = function() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('mobile-menu-overlay');
    
    if (this.sidebarOpen) {
        this.closeMobileMenu();
    } else {
        sidebar.classList.add('mobile-open');
        overlay.classList.add('active');
        this.sidebarOpen = true;
    }
};

ConAdminApp.prototype.closeMobileMenu = function() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('mobile-menu-overlay');
    
    sidebar.classList.remove('mobile-open');
    overlay.classList.remove('active');
    this.sidebarOpen = false;
};

// ==============================================
// GESTIÓN DE EVENTOS
// ==============================================

ConAdminApp.prototype.initEventListeners = function() {
    // Login form handler
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            this.handleLogin(e);
        });
    }
    
    // Window resize
    window.addEventListener('resize', () => {
        this.handleResize();
    });
    
    // Header buttons
    const notificationBtn = document.getElementById('notification-btn');
    if (notificationBtn) {
        notificationBtn.addEventListener('click', () => {
            this.showNotificationsModal();
        });
    }
    
    const settingsBtn = document.getElementById('settings-btn');
    if (settingsBtn) {
        settingsBtn.addEventListener('click', () => {
            // Implementar modal de configuración
            console.log('Settings clicked');
        });
    }
    
    // Logout button
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            if (confirm('¿Está seguro que desea cerrar sesión?')) {
                this.handleLogout();
            }
        });
    }
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        this.handleKeyboardShortcuts(e);
    });
};

ConAdminApp.prototype.handleResize = function() {
    // Close mobile menu on resize to desktop
    if (window.innerWidth > 767 && this.sidebarOpen) {
        this.closeMobileMenu();
    }
};

ConAdminApp.prototype.handleKeyboardShortcuts = function(e) {
    // Ctrl/Cmd + 1-7: Navigate to sections
    if ((e.ctrlKey || e.metaKey) && !e.shiftKey && !e.altKey) {
        const shortcuts = {
            '1': 'dashboard',
            '2': 'residents',
            '3': 'finances',
            '4': 'maintenance',
            '5': 'communications',
            '6': 'common-areas',
            '7': 'reports'
        };
        
        if (shortcuts[e.key]) {
            e.preventDefault();
            this.navigateToSection(shortcuts[e.key]);
        }
    }
    
    // Escape: Close modals
    if (e.key === 'Escape') {
        this.closeAllModals();
    }
};

// ==============================================
// GESTIÓN DE MODALES
// ==============================================

ConAdminApp.prototype.initModals = function() {
    // Modal close buttons
    const modalCloseButtons = document.querySelectorAll('.modal-close');
    modalCloseButtons.forEach(button => {
        button.addEventListener('click', () => {
            const modalId = button.getAttribute('data-modal');
            this.closeModal(modalId);
        });
    });
    
    // Modal cancel buttons
    const modalCancelButtons = document.querySelectorAll('[data-modal]');
    modalCancelButtons.forEach(button => {
        if (button.textContent.includes('Cancelar')) {
            button.addEventListener('click', () => {
                const modalId = button.getAttribute('data-modal');
                this.closeModal(modalId);
            });
        }
    });
    
    // Click outside to close modal
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeModal(modal.id);
            }
        });
    });
};

ConAdminApp.prototype.openModal = function(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // Focus first input if exists
        const firstInput = modal.querySelector('input, select, textarea');
        if (firstInput) {
            setTimeout(() => firstInput.focus(), 100);
        }
    }
};

ConAdminApp.prototype.closeModal = function(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
        
        // Reset form if exists
        const form = modal.querySelector('form');
        if (form) {
            form.reset();
        }
    }
};

ConAdminApp.prototype.closeAllModals = function() {
    const modals = document.querySelectorAll('.modal.active');
    modals.forEach(modal => {
        modal.classList.remove('active');
    });
    document.body.style.overflow = '';
};

// ==============================================
// GESTIÓN DE FORMULARIOS
// ==============================================

ConAdminApp.prototype.initForms = function() {
    // RUT formatting
    this.initRUTFormatting();
    
    // Form submissions
    this.initFormSubmissions();
    
    // Amount formatting
    this.initAmountFormatting();
};

ConAdminApp.prototype.initRUTFormatting = function() {
    const rutInputs = document.querySelectorAll('input[id*="rut"], input[placeholder*="RUT"]');
    rutInputs.forEach(input => {
        input.addEventListener('input', (e) => {
            let value = e.target.value.replace(/[^\d]/g, '');
            if (value.length > 0) {
                // Format RUT Chilean style
                if (value.length <= 7) {
                    value = value.replace(/(\d{1})(\d{3})(\d{0,3})/, '$1.$2.$3');
                } else {
                    value = value.replace(/(\d{1})(\d{3})(\d{3})(\d{0,1})/, '$1.$2.$3-$4');
                }
                e.target.value = value;
            }
        });
    });
};

ConAdminApp.prototype.initAmountFormatting = function() {
    const amountInputs = document.querySelectorAll('.amount-input');
    amountInputs.forEach(input => {
        input.addEventListener('input', (e) => {
            let value = e.target.value.replace(/[^\d]/g, '');
            if (value) {
                // Format as Chilean currency
                const formatted = new Intl.NumberFormat('es-CL').format(parseInt(value));
                e.target.value = formatted;
            }
        });
        
        input.addEventListener('focus', (e) => {
            // Remove formatting on focus
            e.target.value = e.target.value.replace(/[^\d]/g, '');
        });
        
        input.addEventListener('blur', (e) => {
            // Add formatting on blur
            if (e.target.value) {
                const formatted = new Intl.NumberFormat('es-CL').format(parseInt(e.target.value));
                e.target.value = formatted;
            }
        });
    });
};

ConAdminApp.prototype.initFormSubmissions = function() {
    // Resident form
    const residentForm = document.getElementById('resident-form');
    if (residentForm) {
        residentForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleResidentSubmit();
        });
    }
    
    // Maintenance form
    const maintenanceForm = document.getElementById('maintenance-form');
    if (maintenanceForm) {
        maintenanceForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleMaintenanceSubmit();
        });
    }
    
    // Reservation form
    const reservationForm = document.getElementById('reservation-form');
    if (reservationForm) {
        reservationForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleReservationSubmit();
        });
    }
    
    // Communication form
    const communicationForm = document.getElementById('communication-form');
    if (communicationForm) {
        communicationForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleCommunicationSubmit();
        });
    }
};

// ==============================================
// GESTIÓN DE ALMACENAMIENTO
// ==============================================

ConAdminApp.prototype.initStorage = function() {
    // Initialize localStorage
    if (!localStorage.getItem('conadmin_data')) {
        this.saveToStorage();
    } else {
        this.loadFromStorage();
    }
    
    // Auto-save every 30 seconds
    setInterval(() => {
        this.saveToStorage();
    }, 30000);
};

ConAdminApp.prototype.saveToStorage = function() {
    try {
        localStorage.setItem('conadmin_data', JSON.stringify(this.data));
    } catch (error) {
        console.error('Error saving to storage:', error);
    }
};

ConAdminApp.prototype.loadFromStorage = function() {
    try {
        const stored = localStorage.getItem('conadmin_data');
        if (stored) {
            this.data = { ...this.data, ...JSON.parse(stored) };
        }
    } catch (error) {
        console.error('Error loading from storage:', error);
    }
};

ConAdminApp.prototype.loadInitialData = function() {
    // Load sample data if no data exists
    if (this.data.residents.length === 0) {
        this.loadSampleData();
    }
};

ConAdminApp.prototype.loadSampleData = function() {
    // Sample residents data
    this.data.residents = [
        {
            id: 1,
            name: 'Juan Pérez González',
            rut: '12.345.678-9',
            phone: '+56 9 1234 5678',
            email: 'juan.perez@email.com',
            apartment: '101',
            status: 'propietario',
            debt: 0,
            notes: ''
        },
        {
            id: 2,
            name: 'María Rodríguez Silva',
            rut: '98.765.432-1',
            phone: '+56 9 8765 4321',
            email: 'maria.rodriguez@email.com',
            apartment: '102',
            status: 'arrendatario',
            debt: 45000,
            notes: 'Dueño: Carlos Silva M.'
        },
        {
            id: 3,
            name: 'Carlos López Martínez',
            rut: '15.678.901-2',
            phone: '+56 2 2345 6789',
            email: 'carlos.lopez@email.com',
            apartment: '201',
            status: 'propietario',
            debt: 0,
            notes: ''
        }
    ];
    
    // Sample payments data
    this.data.payments = [
        {
            id: 1,
            residentId: 1,
            apartment: '101',
            residentName: 'Juan Pérez González',
            amount: 85000,
            date: new Date().toISOString(),
            status: 'pagado'
        },
        {
            id: 2,
            residentId: 2,
            apartment: '102',
            residentName: 'María Rodríguez Silva',
            amount: 85000,
            date: null,
            status: 'pendiente'
        }
    ];
    
    // Sample maintenance data
    this.data.maintenance = [
        {
            id: 1,
            title: 'Fuga de agua en baño',
            description: 'Hay una fuga en el grifo del baño del área común del segundo piso',
            apartment: 'Área Común',
            area: 'comun',
            priority: 'alta',
            status: 'pendiente',
            created: new Date().toISOString(),
            resolved: null
        }
    ];
    
    // Sample announcements
    this.data.announcements = [
        {
            id: 1,
            title: 'Mantenimiento de ascensores',
            content: 'El día viernes se realizará mantenimiento preventivo de los ascensores de 9:00 a 12:00 hrs.',
            date: new Date().toISOString(),
            target: 'todos'
        }
    ];
    
    // Sample reservations
    this.data.reservations = [
        {
            id: 1,
            area: 'salon-multiuso',
            apartment: '101',
            date: new Date(Date.now() + 86400000).toISOString(),
            start: '18:00',
            end: '22:00',
            purpose: 'Cumpleaños familiar',
            status: 'confirmada'
        }
    ];
    
    // Sample notifications
    this.data.notifications = [
        {
            id: 1,
            title: 'Pago pendiente',
            message: 'María Rodríguez tiene un pago pendiente de $45.000 CLP',
            date: new Date().toISOString(),
            read: false,
            type: 'payment'
        },
        {
            id: 2,
            title: 'Mantenimiento programado',
            message: 'Mañana se realizará mantenimiento de ascensores',
            date: new Date().toISOString(),
            read: false,
            type: 'maintenance'
        },
        {
            id: 3,
            title: 'Nueva reserva',
            message: 'Juan Pérez ha reservado el salón multiuso para mañana',
            date: new Date().toISOString(),
            read: false,
            type: 'reservation'
        }
    ];
};

// ==============================================
// ACTUALIZACIÓN DE UI
// ==============================================

ConAdminApp.prototype.updateUI = function() {
    this.updateDashboard();
    this.updateResidentsTable();
    this.updatePaymentsTable();
    this.updateMaintenanceList();
    this.updateAnnouncements();
    this.updateNotificationsBadge();
    this.updateReservations();
};

ConAdminApp.prototype.updateDashboard = function() {
    // Update KPI values
    const totalResidents = this.data.residents.length;
    const pendingPayments = this.data.residents.filter(r => r.debt > 0).length;
    const totalDebt = this.data.residents.reduce((sum, r) => sum + r.debt, 0);
    const pendingMaintenance = this.data.maintenance.filter(m => m.status === 'pendiente').length;
    
    const kpiElements = {
        'kpi-total-residents': totalResidents,
        'kpi-pending-payments': pendingPayments,
        'kpi-pending-maintenance': pendingMaintenance
    };
    
    Object.entries(kpiElements).forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
        }
    });
    
    // Update payment status summary
    this.updatePaymentStatusSummary();
};

ConAdminApp.prototype.updateSectionData = function(sectionName) {
    switch (sectionName) {
        case 'residents':
            this.updateResidentsTable();
            break;
        case 'finances':
            this.updatePaymentsTable();
            this.updatePaymentStatusSummary();
            break;
        case 'maintenance':
            this.updateMaintenanceList();
            break;
        case 'communications':
            this.updateAnnouncements();
            break;
        case 'common-areas':
            this.updateReservations();
            break;
        case 'dashboard':
            this.updateDashboard();
            break;
    }
};

// ==============================================
// UTILIDADES
// ==============================================

ConAdminApp.prototype.formatCurrency = function(amount) {
    return new Intl.NumberFormat('es-CL', {
        style: 'currency',
        currency: 'CLP'
    }).format(amount);
};

ConAdminApp.prototype.formatDate = function(dateString) {
    return new Date(dateString).toLocaleDateString('es-CL');
};

ConAdminApp.prototype.generateId = function() {
    return Date.now() + Math.random().toString(36).substr(2, 9);
};

ConAdminApp.prototype.showNotification = function(message, type = 'info') {
    // Simple notification system
    console.log(`${type.toUpperCase()}: ${message}`);
    // Implement actual notification system
};

// ==============================================
// INICIALIZACIÓN
// ==============================================

// Wait for DOM to be ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.conAdminApp = new ConAdminApp();
    });
} else {
    window.conAdminApp = new ConAdminApp();
}