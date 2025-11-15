/**
 * ConAdmin Chile - Sections Management
 * Gestión de Secciones de la Aplicación
 */

// ==============================================
// CLASE BASE PARA SECCIONES
// ==============================================

class SectionManager {
    constructor() {
        this.sections = new Map();
        this.init();
    }
    
    init() {
        this.setupEventListeners();
    }
    
    /**
     * Registra una sección
     * @param {string} name - Nombre de la sección
     * @param {Function} handler - Función manejadora
     */
    register(name, handler) {
        this.sections.set(name, handler);
    }
    
    /**
     * Ejecuta el handler de una sección
     * @param {string} name - Nombre de la sección
     * @param {Object} data - Datos para la sección
     */
    execute(name, data = {}) {
        const handler = this.sections.get(name);
        if (handler) {
            handler(data);
        }
    }
    
    /**
     * Configura event listeners generales
     */
    setupEventListeners() {
        // Botones para agregar residentes
        const addResidentBtn = document.getElementById('add-resident-btn');
        if (addResidentBtn) {
            addResidentBtn.addEventListener('click', () => {
                this.showResidentModal();
            });
        }
        
        // Botones para agregar mantenciones
        const addMaintenanceBtn = document.getElementById('add-maintenance-btn');
        if (addMaintenanceBtn) {
            addMaintenanceBtn.addEventListener('click', () => {
                this.showMaintenanceModal();
            });
        }
        
        // Botones para nuevas reservas
        const newReservationBtn = document.getElementById('new-reservation-btn');
        if (newReservationBtn) {
            newReservationBtn.addEventListener('click', () => {
                this.showReservationModal();
            });
        }
        
        // Botones para nuevos anuncios
        const newAnnouncementBtn = document.getElementById('new-announcement-btn');
        if (newAnnouncementBtn) {
            newAnnouncementBtn.addEventListener('click', () => {
                this.showAnnouncementModal();
            });
        }
        
        // Búsqueda de residentes
        const residentSearch = document.getElementById('resident-search');
        if (residentSearch) {
            residentSearch.addEventListener('input', (e) => {
                this.filterResidents(e.target.value);
            });
        }
        
        // Filtros de residentes
        const residentStatusFilter = document.getElementById('resident-status-filter');
        if (residentStatusFilter) {
            residentStatusFilter.addEventListener('change', (e) => {
                this.filterResidentsByStatus(e.target.value);
            });
        }
        
        // Filtros de mantenciones
        const maintenanceStatusFilter = document.getElementById('maintenance-status-filter');
        if (maintenanceStatusFilter) {
            maintenanceStatusFilter.addEventListener('change', () => {
                this.updateMaintenanceList();
            });
        }
        
        const maintenancePriorityFilter = document.getElementById('maintenance-priority-filter');
        if (maintenancePriorityFilter) {
            maintenancePriorityFilter.addEventListener('change', () => {
                this.updateMaintenanceList();
            });
        }
    }
    
    // ==============================================
    // GESTIÓN DE RESIDENTES
    // ==============================================
    
    /**
     * Muestra el modal para agregar/editar residente
     * @param {Object} resident - Residente a editar (opcional)
     */
    showResidentModal(resident = null) {
        const modal = document.getElementById('resident-modal');
        const title = document.getElementById('resident-modal-title');
        const form = document.getElementById('resident-form');
        
        if (!modal || !form) return;
        
        // Configurar título y formulario
        if (resident) {
            title.textContent = 'Editar Residente';
            this.populateResidentForm(form, resident);
            form.dataset.editId = resident.id;
        } else {
            title.textContent = 'Agregar Residente';
            form.reset();
            delete form.dataset.editId;
        }
        
        window.ModalManager.openModal('resident-modal');
    }
    
    /**
     * Llena el formulario de residente con datos
     * @param {HTMLFormElement} form - Formulario
     * @param {Object} resident - Datos del residente
     */
    populateResidentForm(form, resident) {
        Object.entries(resident).forEach(([key, value]) => {
            const element = form.querySelector(`[name="${key}"], #resident-${key}`);
            if (element) {
                if (element.type === 'checkbox' || element.type === 'radio') {
                    element.checked = value;
                } else {
                    element.value = value;
                }
            }
        });
    }
    
    /**
     * Maneja el envío del formulario de residente
     * @param {Event} event - Evento del formulario
     */
    handleResidentSubmit(event) {
        event.preventDefault();
        
        const form = event.target;
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        
        // Validar datos
        if (!this.validateResidentData(data)) {
            return;
        }
        
        const editId = form.dataset.editId;
        
        try {
            if (editId) {
                // Actualizar residente existente
                const updated = window.ConAdminStorage.updateResident(parseInt(editId), data);
                if (updated) {
                    window.NotificationManager.success('Residente actualizado correctamente');
                }
            } else {
                // Agregar nuevo residente
                window.ConAdminStorage.addResident(data);
                window.NotificationManager.success('Residente agregado correctamente');
            }
            
            // Cerrar modal y actualizar UI
            window.ModalManager.closeModal('resident-modal');
            this.updateResidentsTable();
            this.updateDashboard();
            
        } catch (error) {
            window.NotificationManager.error('Error al guardar el residente: ' + error.message);
        }
    }
    
    /**
     * Valida los datos del residente
     * @param {Object} data - Datos a validar
     * @returns {boolean} true si los datos son válidos
     */
    validateResidentData(data) {
        if (!data.name || data.name.trim() === '') {
            window.NotificationManager.error('El nombre es obligatorio');
            return false;
        }
        
        if (!data.rut || !window.ConAdminUtils.validateRUT(data.rut)) {
            window.NotificationManager.error('El RUT no es válido');
            return false;
        }
        
        if (!data.apartment || data.apartment.trim() === '') {
            window.NotificationManager.error('El departamento es obligatorio');
            return false;
        }
        
        return true;
    }
    
    /**
     * Actualiza la tabla de residentes
     */
    updateResidentsTable() {
        const tbody = document.getElementById('residents-table-body');
        if (!tbody) return;
        
        const residents = window.ConAdminStorage.getResidents();
        
        // Limpiar tbody
        tbody.innerHTML = '';
        
        // Agregar filas
        residents.forEach(resident => {
            const row = this.createResidentRow(resident);
            tbody.appendChild(row);
        });
    }
    
    /**
     * Crea una fila de residente para la tabla
     * @param {Object} resident - Datos del residente
     * @returns {HTMLElement} Fila de la tabla
     */
    createResidentRow(resident) {
        const row = document.createElement('tr');
        
        // Departamento
        const deptCell = document.createElement('td');
        deptCell.textContent = resident.apartment;
        row.appendChild(deptCell);
        
        // Nombre
        const nameCell = document.createElement('td');
        nameCell.textContent = resident.name;
        row.appendChild(nameCell);
        
        // RUT
        const rutCell = document.createElement('td');
        rutCell.textContent = resident.rut;
        row.appendChild(rutCell);
        
        // Teléfono
        const phoneCell = document.createElement('td');
        phoneCell.textContent = resident.phone || '-';
        row.appendChild(phoneCell);
        
        // Estado
        const statusCell = document.createElement('td');
        const statusBadge = document.createElement('span');
        statusBadge.className = `badge badge-${window.ConAdminUtils.getStatusColor(resident.status)}`;
        statusBadge.textContent = window.ConAdminUtils.getStatusText(resident.status);
        statusCell.appendChild(statusBadge);
        row.appendChild(statusCell);
        
        // Deuda
        const debtCell = document.createElement('td');
        debtCell.textContent = window.ConAdminUtils.formatCurrency(resident.debt || 0);
        if (resident.debt > 0) {
            debtCell.className = 'text-danger';
        }
        row.appendChild(debtCell);
        
        // Acciones
        const actionsCell = document.createElement('td');
        const actionsContainer = document.createElement('div');
        actionsContainer.className = 'actions-container';
        
        const editBtn = document.createElement('button');
        editBtn.className = 'btn btn-sm btn-secondary';
        editBtn.title = 'Editar';
        editBtn.innerHTML = '<i data-lucide="edit"></i>';
        editBtn.addEventListener('click', () => {
            this.showResidentModal(resident);
        });
        
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'btn btn-sm btn-danger';
        deleteBtn.title = 'Eliminar';
        deleteBtn.innerHTML = '<i data-lucide="trash-2"></i>';
        deleteBtn.addEventListener('click', () => {
            this.deleteResident(resident.id);
        });
        
        actionsContainer.appendChild(editBtn);
        actionsContainer.appendChild(deleteBtn);
        actionsCell.appendChild(actionsContainer);
        row.appendChild(actionsCell);
        
        return row;
    }
    
    /**
     * Filtra residentes por texto
     * @param {string} searchTerm - Término de búsqueda
     */
    filterResidents(searchTerm) {
        const tbody = document.getElementById('residents-table-body');
        if (!tbody) return;
        
        const rows = tbody.querySelectorAll('tr');
        const residents = window.ConAdminStorage.getResidents();
        const filteredResidents = window.ConAdminUtils.searchInArray(
            residents,
            searchTerm,
            ['name', 'rut', 'apartment', 'phone', 'email']
        );
        
        // Mostrar/ocultar filas
        rows.forEach(row => {
            const apartment = row.cells[0]?.textContent || '';
            const matches = filteredResidents.some(r => r.apartment === apartment);
            row.style.display = matches ? '' : 'none';
        });
    }
    
    /**
     * Filtra residentes por estado
     * @param {string} status - Estado a filtrar
     */
    filterResidentsByStatus(status) {
        const tbody = document.getElementById('residents-table-body');
        if (!tbody) return;
        
        const rows = tbody.querySelectorAll('tr');
        const statusIndex = 4; // Índice de la columna de estado
        
        rows.forEach(row => {
            if (status === '') {
                row.style.display = '';
            } else {
                const rowStatus = row.cells[statusIndex]?.querySelector('.badge')?.textContent || '';
                const matches = window.ConAdminUtils.getStatusText(status) === rowStatus;
                row.style.display = matches ? '' : 'none';
            }
        });
    }
    
    /**
     * Elimina un residente
     * @param {number} id - ID del residente
     */
    deleteResident(id) {
        if (confirm('¿Estás seguro de que quieres eliminar este residente?')) {
            try {
                window.ConAdminStorage.deleteResident(id);
                this.updateResidentsTable();
                this.updateDashboard();
                window.NotificationManager.success('Residente eliminado correctamente');
            } catch (error) {
                window.NotificationManager.error('Error al eliminar el residente');
            }
        }
    }
    
    // ==============================================
    // GESTIÓN DE FINANZAS
    // ==============================================
    
    /**
     * Actualiza la tabla de pagos
     */
    updatePaymentsTable() {
        const tbody = document.getElementById('payments-table-body');
        if (!tbody) return;
        
        const payments = window.ConAdminStorage.getPayments();
        
        // Limpiar tbody
        tbody.innerHTML = '';
        
        // Agregar filas
        payments.forEach(payment => {
            const row = this.createPaymentRow(payment);
            tbody.appendChild(row);
        });
    }
    
    /**
     * Crea una fila de pago para la tabla
     * @param {Object} payment - Datos del pago
     * @returns {HTMLElement} Fila de la tabla
     */
    createPaymentRow(payment) {
        const row = document.createElement('tr');
        
        // Departamento
        const deptCell = document.createElement('td');
        deptCell.textContent = payment.apartment;
        row.appendChild(deptCell);
        
        // Residente
        const residentCell = document.createElement('td');
        residentCell.textContent = payment.residentName;
        row.appendChild(residentCell);
        
        // Monto
        const amountCell = document.createElement('td');
        amountCell.textContent = window.ConAdminUtils.formatCurrency(payment.amount);
        row.appendChild(amountCell);
        
        // Fecha de pago
        const dateCell = document.createElement('td');
        dateCell.textContent = payment.date ? window.ConAdminUtils.formatDate(payment.date) : '-';
        row.appendChild(dateCell);
        
        // Estado
        const statusCell = document.createElement('td');
        const statusBadge = document.createElement('span');
        statusBadge.className = `badge badge-${window.ConAdminUtils.getStatusColor(payment.status)}`;
        statusBadge.textContent = window.ConAdminUtils.getStatusText(payment.status);
        statusCell.appendChild(statusBadge);
        row.appendChild(statusCell);
        
        // Acciones
        const actionsCell = document.createElement('td');
        const actionsContainer = document.createElement('div');
        actionsContainer.className = 'actions-container';
        
        if (payment.status === 'pendiente') {
            const markPaidBtn = document.createElement('button');
            markPaidBtn.className = 'btn btn-sm btn-success';
            markPaidBtn.title = 'Marcar como pagado';
            markPaidBtn.innerHTML = '<i data-lucide="check"></i>';
            markPaidBtn.addEventListener('click', () => {
                this.markPaymentAsPaid(payment.id);
            });
            actionsContainer.appendChild(markPaidBtn);
        }
        
        actionsCell.appendChild(actionsContainer);
        row.appendChild(actionsCell);
        
        return row;
    }
    
    /**
     * Marca un pago como pagado
     * @param {number} paymentId - ID del pago
     */
    markPaymentAsPaid(paymentId) {
        try {
            const payments = window.ConAdminStorage.getPayments();
            const payment = payments.find(p => p.id === paymentId);
            
            if (payment) {
                payment.status = 'pagado';
                payment.date = new Date().toISOString();
                
                window.ConAdminStorage.save('payments', payments);
                this.updatePaymentsTable();
                this.updateDashboard();
                this.updatePaymentStatusSummary();
                
                window.NotificationManager.success('Pago marcado como pagado');
            }
        } catch (error) {
            window.NotificationManager.error('Error al actualizar el pago');
        }
    }
    
    /**
     * Actualiza el resumen de estado de pagos
     */
    updatePaymentStatusSummary() {
        const summaryContainer = document.getElementById('payment-status-summary');
        if (!summaryContainer) return;
        
        const residents = window.ConAdminStorage.getResidents();
        
        const alDia = residents.filter(r => (r.debt || 0) === 0 && r.status !== 'vacant').length;
        const pendiente = residents.filter(r => (r.debt || 0) > 0).length;
        const atrasado = residents.filter(r => (r.debt || 0) > 100000).length;
        
        summaryContainer.innerHTML = `
            <div class="status-item">
                <span class="status-dot success"></span>
                <span>Al día: <strong>${alDia}</strong></span>
            </div>
            <div class="status-item">
                <span class="status-dot warning"></span>
                <span>Pendiente: <strong>${pendiente}</strong></span>
            </div>
            <div class="status-item">
                <span class="status-dot error"></span>
                <span>Atrasado: <strong>${atrasado}</strong></span>
            </div>
        `;
    }
    
    // ==============================================
    // GESTIÓN DE MANTENCIONES
    // ==============================================
    
    /**
     * Muestra el modal para agregar mantención
     * @param {Object} maintenance - Mantención a editar (opcional)
     */
    showMaintenanceModal(maintenance = null) {
        const modal = document.getElementById('maintenance-modal');
        const title = document.getElementById('maintenance-modal-title');
        const form = document.getElementById('maintenance-form');
        
        if (!modal || !form) return;
        
        // Configurar título y formulario
        if (maintenance) {
            title.textContent = 'Editar Solicitud de Mantención';
            this.populateMaintenanceForm(form, maintenance);
            form.dataset.editId = maintenance.id;
        } else {
            title.textContent = 'Nueva Solicitud de Mantención';
            form.reset();
            delete form.dataset.editId;
        }
        
        window.ModalManager.openModal('maintenance-modal');
    }
    
    /**
     * Llena el formulario de mantención con datos
     * @param {HTMLFormElement} form - Formulario
     * @param {Object} maintenance - Datos de la mantención
     */
    populateMaintenanceForm(form, maintenance) {
        Object.entries(maintenance).forEach(([key, value]) => {
            const element = form.querySelector(`[name="${key}"], #maintenance-${key}`);
            if (element) {
                if (element.type === 'checkbox' || element.type === 'radio') {
                    element.checked = value;
                } else {
                    element.value = value;
                }
            }
        });
    }
    
    /**
     * Maneja el envío del formulario de mantención
     * @param {Event} event - Evento del formulario
     */
    handleMaintenanceSubmit(event) {
        event.preventDefault();
        
        const form = event.target;
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        
        // Validar datos
        if (!data.title || data.title.trim() === '') {
            window.NotificationManager.error('El título es obligatorio');
            return;
        }
        
        if (!data.description || data.description.trim() === '') {
            window.NotificationManager.error('La descripción es obligatoria');
            return;
        }
        
        const editId = form.dataset.editId;
        
        try {
            if (editId) {
                // Actualizar mantención existente
                const updated = window.ConAdminStorage.updateMaintenance(parseInt(editId), data);
                if (updated) {
                    window.NotificationManager.success('Mantención actualizada correctamente');
                }
            } else {
                // Agregar nueva mantención
                window.ConAdminStorage.addMaintenance(data);
                window.NotificationManager.success('Solicitud de mantención creada correctamente');
            }
            
            // Cerrar modal y actualizar UI
            window.ModalManager.closeModal('maintenance-modal');
            this.updateMaintenanceList();
            this.updateDashboard();
            
        } catch (error) {
            window.NotificationManager.error('Error al guardar la mantención: ' + error.message);
        }
    }
    
    /**
     * Actualiza la lista de mantenciones
     */
    updateMaintenanceList() {
        const container = document.getElementById('maintenance-list');
        if (!container) return;
        
        let maintenanceList = window.ConAdminStorage.getMaintenance();
        
        // Aplicar filtros
        const statusFilter = document.getElementById('maintenance-status-filter')?.value;
        const priorityFilter = document.getElementById('maintenance-priority-filter')?.value;
        
        if (statusFilter) {
            maintenanceList = maintenanceList.filter(m => m.status === statusFilter);
        }
        
        if (priorityFilter) {
            maintenanceList = maintenanceList.filter(m => m.priority === priorityFilter);
        }
        
        // Limpiar container
        container.innerHTML = '';
        
        // Agregar mantenciones
        maintenanceList.forEach(maintenance => {
            const item = this.createMaintenanceItem(maintenance);
            container.appendChild(item);
        });
    }
    
    /**
     * Crea un item de mantención
     * @param {Object} maintenance - Datos de la mantención
     * @returns {HTMLElement} Item de la lista
     */
    createMaintenanceItem(maintenance) {
        const item = document.createElement('div');
        item.className = 'maintenance-item';
        
        // Header
        const header = document.createElement('div');
        header.className = 'maintenance-header';
        
        const title = document.createElement('h4');
        title.className = 'maintenance-title';
        title.textContent = maintenance.title;
        
        const priority = document.createElement('span');
        priority.className = `maintenance-priority ${maintenance.priority}`;
        priority.textContent = window.ConAdminUtils.getStatusText(maintenance.priority);
        
        header.appendChild(title);
        header.appendChild(priority);
        
        // Description
        const description = document.createElement('p');
        description.className = 'maintenance-description';
        description.textContent = maintenance.description;
        
        // Meta
        const meta = document.createElement('div');
        meta.className = 'maintenance-meta';
        
        const location = document.createElement('span');
        location.textContent = maintenance.apartment || 'Área Común';
        
        const status = document.createElement('span');
        status.className = `badge badge-${window.ConAdminUtils.getStatusColor(maintenance.status)}`;
        status.textContent = window.ConAdminUtils.getStatusText(maintenance.status);
        
        const date = document.createElement('span');
        date.textContent = window.ConAdminUtils.formatDate(maintenance.created);
        
        meta.appendChild(location);
        meta.appendChild(status);
        meta.appendChild(date);
        
        // Actions
        const actions = document.createElement('div');
        actions.className = 'maintenance-actions';
        
        if (maintenance.status === 'pendiente') {
            const startBtn = document.createElement('button');
            startBtn.className = 'btn btn-sm btn-warning';
            startBtn.textContent = 'Iniciar';
            startBtn.addEventListener('click', () => {
                this.updateMaintenanceStatus(maintenance.id, 'en_proceso');
            });
            actions.appendChild(startBtn);
        }
        
        if (maintenance.status === 'en_proceso') {
            const completeBtn = document.createElement('button');
            completeBtn.className = 'btn btn-sm btn-success';
            completeBtn.textContent = 'Completar';
            completeBtn.addEventListener('click', () => {
                this.updateMaintenanceStatus(maintenance.id, 'completado');
            });
            actions.appendChild(completeBtn);
        }
        
        const editBtn = document.createElement('button');
        editBtn.className = 'btn btn-sm btn-secondary';
        editBtn.textContent = 'Editar';
        editBtn.addEventListener('click', () => {
            this.showMaintenanceModal(maintenance);
        });
        actions.appendChild(editBtn);
        
        // Assemblar item
        item.appendChild(header);
        item.appendChild(description);
        item.appendChild(meta);
        item.appendChild(actions);
        
        return item;
    }
    
    /**
     * Actualiza el estado de una mantención
     * @param {number} id - ID de la mantención
     * @param {string} status - Nuevo estado
     */
    updateMaintenanceStatus(id, status) {
        try {
            const updates = { status };
            if (status === 'completado') {
                updates.resolved = new Date().toISOString();
            }
            
            const updated = window.ConAdminStorage.updateMaintenance(id, updates);
            if (updated) {
                this.updateMaintenanceList();
                this.updateDashboard();
                window.NotificationManager.success('Estado de mantención actualizado');
            }
        } catch (error) {
            window.NotificationManager.error('Error al actualizar el estado');
        }
    }
    
    // ==============================================
    // GESTIÓN DE COMUNICACIONES
    // ==============================================
    
    /**
     * Actualiza la lista de anuncios
     */
    updateAnnouncements() {
        const container = document.getElementById('announcements-list');
        if (!container) return;
        
        const announcements = window.ConAdminStorage.getAnnouncements();
        
        // Limpiar container
        container.innerHTML = '';
        
        // Agregar anuncios
        announcements.forEach(announcement => {
            const item = this.createAnnouncementItem(announcement);
            container.appendChild(item);
        });
    }
    
    /**
     * Crea un item de anuncio
     * @param {Object} announcement - Datos del anuncio
     * @returns {HTMLElement} Item del anuncio
     */
    createAnnouncementItem(announcement) {
        const item = document.createElement('div');
        item.className = 'announcement-item';
        
        const title = document.createElement('div');
        title.className = 'announcement-title';
        title.textContent = announcement.title;
        
        const content = document.createElement('div');
        content.className = 'announcement-content';
        content.textContent = announcement.content;
        
        const date = document.createElement('div');
        date.className = 'announcement-date';
        date.textContent = window.ConAdminUtils.formatDate(announcement.createdAt);
        
        item.appendChild(title);
        item.appendChild(content);
        item.appendChild(date);
        
        return item;
    }
    
    /**
     * Maneja el envío del formulario de comunicación
     * @param {Event} event - Evento del formulario
     */
    handleCommunicationSubmit(event) {
        event.preventDefault();
        
        const form = event.target;
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        
        // Validar datos
        if (!data.subject || data.subject.trim() === '') {
            window.NotificationManager.error('El asunto es obligatorio');
            return;
        }
        
        if (!data.message || data.message.trim() === '') {
            window.NotificationManager.error('El mensaje es obligatorio');
            return;
        }
        
        try {
            // Crear anuncio
            window.ConAdminStorage.addAnnouncement({
                title: data.subject,
                content: data.message,
                target: data.target
            });
            
            // Cerrar modal y actualizar UI
            form.reset();
            this.updateAnnouncements();
            window.NotificationManager.success('Comunicación enviada correctamente');
            
        } catch (error) {
            window.NotificationManager.error('Error al enviar la comunicación');
        }
    }
    
    // ==============================================
    // GESTIÓN DE ÁREAS COMUNES
    // ==============================================
    
    /**
     * Actualiza las reservas de áreas comunes
     */
    updateReservations() {
        this.updateAreaSchedule('salon-multiuso');
        this.updateAreaSchedule('quincho');
        this.updateAreaSchedule('piscina');
    }
    
    /**
     * Actualiza el horario de un área específica
     * @param {string} areaId - ID del área
     */
    updateAreaSchedule(areaId) {
        const container = document.getElementById(`${areaId}-schedule`);
        if (!container) return;
        
        const reservations = window.ConAdminStorage.getReservations();
        const areaReservations = reservations.filter(r => r.area === areaId);
        
        // Limpiar container
        container.innerHTML = '';
        
        // Mostrar reservas próximas
        const upcoming = areaReservations
            .filter(r => new Date(r.date) >= new Date())
            .slice(0, 3);
        
        if (upcoming.length === 0) {
            const noReservations = document.createElement('div');
            noReservations.className = 'no-reservations';
            noReservations.textContent = 'No hay reservas próximas';
            container.appendChild(noReservations);
        } else {
            upcoming.forEach(reservation => {
                const item = this.createScheduleItem(reservation);
                container.appendChild(item);
            });
        }
    }
    
    /**
     * Crea un item de horario
     * @param {Object} reservation - Reserva
     * @returns {HTMLElement} Item de horario
     */
    createScheduleItem(reservation) {
        const item = document.createElement('div');
        item.className = 'schedule-item';
        
        const info = document.createElement('div');
        const area = reservation.apartment;
        const time = `${reservation.start} - ${reservation.end}`;
        
        info.innerHTML = `
            <strong>Dept. ${area}</strong><br>
            <small>${time}</small>
        `;
        
        item.appendChild(info);
        
        return item;
    }
    
    /**
     * Muestra el modal para nueva reserva
     */
    showReservationModal() {
        window.ModalManager.openModal('reservation-modal');
        
        // Configurar fecha mínima como hoy
        const dateInput = document.getElementById('reservation-date');
        if (dateInput) {
            dateInput.min = new Date().toISOString().split('T')[0];
        }
    }
    
    /**
     * Maneja el envío del formulario de reserva
     * @param {Event} event - Evento del formulario
     */
    handleReservationSubmit(event) {
        event.preventDefault();
        
        const form = event.target;
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        
        // Validar que la hora de fin sea posterior a la de inicio
        if (data.start >= data.end) {
            window.NotificationManager.error('La hora de fin debe ser posterior a la hora de inicio');
            return;
        }
        
        try {
            // Crear reserva
            window.ConAdminStorage.addReservation(data);
            
            // Cerrar modal y actualizar UI
            window.ModalManager.closeModal('reservation-modal');
            this.updateReservations();
            window.NotificationManager.success('Reserva creada correctamente');
            
        } catch (error) {
            window.NotificationManager.error('Error al crear la reserva: ' + error.message);
        }
    }
    
    // ==============================================
    // DASHBOARD
    // ==============================================
    
    /**
     * Actualiza los datos del dashboard
     */
    updateDashboard() {
        if (!window.conAdminApp) return;
        
        const statistics = window.ConAdminStorage.getStatistics();
        
        // Actualizar KPIs
        const kpiElements = {
            'kpi-total-residents': statistics.totalResidents,
            'kpi-pending-payments': statistics.pendingPayments,
            'kpi-pending-maintenance': statistics.pendingMaintenance
        };
        
        Object.entries(kpiElements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = value;
            }
        });
        
        // Actualizar gastos comunes
        const monthlyFees = window.ConAdminStorage.getMonthlyFees();
        const monthlyFeesInput = document.getElementById('monthly-fees-input');
        if (monthlyFeesInput) {
            monthlyFeesInput.value = window.ConAdminUtils.formatNumber(monthlyFees);
        }
        
        // Actualizar resumen de estados
        this.updatePaymentStatusSummary();
        
        // Actualizar reservas próximas
        this.updateUpcomingReservations();
    }
    
    /**
     * Actualiza las reservas próximas en el dashboard
     */
    updateUpcomingReservations() {
        const container = document.getElementById('reservation-list');
        if (!container) return;
        
        const reservations = window.ConAdminStorage.getReservations();
        const upcoming = reservations
            .filter(r => new Date(r.date) >= new Date())
            .sort((a, b) => new Date(a.date) - new Date(b.date))
            .slice(0, 5);
        
        // Limpiar container
        container.innerHTML = '';
        
        // Agregar reservas
        upcoming.forEach(reservation => {
            const item = this.createDashboardReservationItem(reservation);
            container.appendChild(item);
        });
        
        if (upcoming.length === 0) {
            const noReservations = document.createElement('div');
            noReservations.className = 'no-reservations text-center text-muted';
            noReservations.textContent = 'No hay reservas próximas';
            container.appendChild(noReservations);
        }
    }
    
    /**
     * Crea un item de reserva para el dashboard
     * @param {Object} reservation - Reserva
     * @returns {HTMLElement} Item de reserva
     */
    createDashboardReservationItem(reservation) {
        const item = document.createElement('div');
        item.className = 'reservation-item';
        
        const info = document.createElement('div');
        info.className = 'reservation-info';
        
        const areaNames = {
            'salon-multiuso': 'Salón Multiuso',
            'quincho': 'Quincho',
            'piscina': 'Piscina'
        };
        
        const area = document.createElement('div');
        area.className = 'reservation-area';
        area.textContent = areaNames[reservation.area] || reservation.area;
        
        const time = document.createElement('div');
        time.className = 'reservation-time';
        time.textContent = `${window.ConAdminUtils.formatDate(reservation.date)} ${reservation.start} - ${reservation.end}`;
        
        const resident = document.createElement('div');
        resident.className = 'reservation-resident';
        resident.textContent = `Dept. ${reservation.apartment}`;
        
        info.appendChild(area);
        info.appendChild(time);
        info.appendChild(resident);
        
        item.appendChild(info);
        
        return item;
    }
    
    // ==============================================
    // INICIALIZACIÓN
    // ==============================================
    
    /**
     * Muestra modal de anuncio
     */
    showAnnouncementModal() {
        // Implementar modal para nuevo anuncio
        window.NotificationManager.info('Funcionalidad de anuncios próximamente');
    }
}

// ==============================================
// INICIALIZACIÓN
// ==============================================

// Crear instancia global del manager de secciones
window.SectionManager = new SectionManager();

// Conectar métodos de la aplicación principal
window.ConAdminApp.prototype.updateSectionData = function(sectionName) {
    window.SectionManager.execute(sectionName);
};

window.ConAdminApp.prototype.handleResidentSubmit = function(event) {
    window.SectionManager.handleResidentSubmit(event);
};

window.ConAdminApp.prototype.handleMaintenanceSubmit = function(event) {
    window.SectionManager.handleMaintenanceSubmit(event);
};

window.ConAdminApp.prototype.handleReservationSubmit = function(event) {
    window.SectionManager.handleReservationSubmit(event);
};

window.ConAdminApp.prototype.handleCommunicationSubmit = function(event) {
    window.SectionManager.handleCommunicationSubmit(event);
};