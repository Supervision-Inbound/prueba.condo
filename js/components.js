/**
 * ConAdmin Chile - Components Management
 * Gestión de Componentes de Interfaz
 */

// ==============================================
// GESTIÓN DE TABLAS
// ==============================================

class TableManager {
    constructor() {
        this.tables = new Map();
    }
    
    /**
     * Crea una tabla HTML
     * @param {Object} config - Configuración de la tabla
     * @returns {HTMLElement} Elemento de tabla
     */
    createTable(config) {
        const {
            id,
            headers,
            data,
            actions = [],
            searchable = true,
            sortable = true,
            pagination = false,
            pageSize = 10
        } = config;
        
        const tableElement = this.createElement('div', { className: 'table-container' });
        
        // Crear tabla
        const table = this.createElement('table', { className: 'table', id: id });
        
        // Crear header
        const thead = this.createElement('thead');
        const headerRow = this.createElement('tr');
        
        headers.forEach(header => {
            const th = this.createElement('th');
            th.textContent = header.label;
            
            if (sortable && header.sortable !== false) {
                th.classList.add('sortable');
                th.addEventListener('click', () => {
                    this.sortTable(id, header.key);
                });
                
                const sortIcon = this.createElement('span', { className: 'sort-icon' });
                sortIcon.innerHTML = '↕';
                th.appendChild(sortIcon);
            }
            
            headerRow.appendChild(th);
        });
        
        if (actions.length > 0) {
            const actionsHeader = this.createElement('th');
            actionsHeader.textContent = 'Acciones';
            headerRow.appendChild(actionsHeader);
        }
        
        thead.appendChild(headerRow);
        table.appendChild(thead);
        
        // Crear body
        const tbody = this.createElement('tbody', { id: `${id}-body` });
        table.appendChild(tbody);
        
        tableElement.appendChild(table);
        
        // Agregar funcionalidades
        if (searchable) {
            this.addSearchFunctionality(tableElement, id);
        }
        
        if (pagination) {
            this.addPagination(tableElement, id, pageSize);
        }
        
        // Almacenar configuración
        this.tables.set(id, {
            element: tableElement,
            config: config,
            sortDirection: 'asc',
            sortKey: null
        });
        
        return tableElement;
    }
    
    /**
     * Actualiza los datos de una tabla
     * @param {string} tableId - ID de la tabla
     * @param {Array} data - Nuevos datos
     */
    updateTableData(tableId, data) {
        const tableInfo = this.tables.get(tableId);
        if (!tableInfo) return;
        
        const { config } = tableInfo;
        const tbody = document.getElementById(`${tableId}-body`);
        
        if (!tbody) return;
        
        // Limpiar tbody
        tbody.innerHTML = '';
        
        // Agregar filas
        data.forEach(rowData => {
            const row = this.createTableRow(config, rowData);
            tbody.appendChild(row);
        });
        
        // Actualizar información de paginación si existe
        const paginationInfo = document.getElementById(`${tableId}-pagination-info`);
        if (paginationInfo) {
            paginationInfo.textContent = `Mostrando ${data.length} registros`;
        }
    }
    
    /**
     * Crea una fila de tabla
     * @param {Object} config - Configuración de la tabla
     * @param {Object} rowData - Datos de la fila
     * @returns {HTMLElement} Fila de tabla
     */
    createTableRow(config, rowData) {
        const row = this.createElement('tr');
        
        config.headers.forEach(header => {
            const cell = this.createElement('td');
            
            let value = rowData[header.key];
            
            // Formatear valor según el tipo
            if (header.formatter) {
                value = header.formatter(value, rowData);
            } else {
                value = this.formatCellValue(value, header.type);
            }
            
            cell.textContent = value;
            row.appendChild(cell);
        });
        
        // Agregar acciones si existen
        if (config.actions && config.actions.length > 0) {
            const actionsCell = this.createElement('td');
            const actionsContainer = this.createElement('div', { className: 'actions-container' });
            
            config.actions.forEach(action => {
                const button = this.createElement('button', {
                    className: `btn btn-sm ${action.className || 'btn-secondary'}`,
                    'data-action': action.key,
                    'data-id': rowData.id
                });
                
                button.innerHTML = `<i data-lucide="${action.icon}"></i>`;
                button.title = action.label;
                
                button.addEventListener('click', () => {
                    if (action.handler) {
                        action.handler(rowData);
                    }
                });
                
                actionsContainer.appendChild(button);
            });
            
            actionsCell.appendChild(actionsContainer);
            row.appendChild(actionsCell);
        }
        
        return row;
    }
    
    /**
     * Formatea el valor de una celda
     * @param {*} value - Valor a formatear
     * @param {string} type - Tipo de dato
     * @returns {string} Valor formateado
     */
    formatCellValue(value, type) {
        if (value === null || value === undefined) return '-';
        
        switch (type) {
            case 'currency':
                return window.ConAdminUtils.formatCurrency(value);
            case 'date':
                return window.ConAdminUtils.formatDate(value);
            case 'status':
                return window.ConAdminUtils.getStatusText(value);
            case 'boolean':
                return value ? 'Sí' : 'No';
            default:
                return value.toString();
        }
    }
    
    /**
     * Agrega funcionalidad de búsqueda
     * @param {HTMLElement} tableContainer - Contenedor de la tabla
     * @param {string} tableId - ID de la tabla
     */
    addSearchFunctionality(tableContainer, tableId) {
        const searchContainer = this.createElement('div', { className: 'table-search' });
        const searchInput = this.createElement('input', {
            className: 'input',
            placeholder: 'Buscar...',
            type: 'text'
        });
        
        searchContainer.appendChild(searchInput);
        tableContainer.insertBefore(searchContainer, tableContainer.firstChild);
        
        searchInput.addEventListener('input', (e) => {
            this.filterTable(tableId, e.target.value);
        });
    }
    
    /**
     * Filtra una tabla
     * @param {string} tableId - ID de la tabla
     * @param {string} searchTerm - Término de búsqueda
     */
    filterTable(tableId, searchTerm) {
        const tableInfo = this.tables.get(tableId);
        if (!tableInfo) return;
        
        const { config } = tableInfo;
        const tbody = document.getElementById(`${tableId}-body`);
        
        if (!tbody) return;
        
        const rows = tbody.querySelectorAll('tr');
        const searchFields = config.headers
            .filter(h => h.searchable !== false)
            .map(h => h.key);
        
        rows.forEach(row => {
            const rowData = this.getRowData(row, config.headers);
            const matches = window.ConAdminUtils.searchInArray([rowData], searchTerm, searchFields);
            row.style.display = matches.length > 0 ? '' : 'none';
        });
    }
    
    /**
     * Ordena una tabla
     * @param {string} tableId - ID de la tabla
     * @param {string} sortKey - Clave para ordenar
     */
    sortTable(tableId, sortKey) {
        const tableInfo = this.tables.get(tableId);
        if (!tableInfo) return;
        
        const { config } = tableInfo;
        const tbody = document.getElementById(`${tableId}-body`);
        
        if (!tbody) return;
        
        const rows = Array.from(tbody.querySelectorAll('tr'));
        
        // Determinar dirección de ordenamiento
        const direction = (tableInfo.sortKey === sortKey && tableInfo.sortDirection === 'asc') 
            ? 'desc' : 'asc';
        
        // Ordenar filas
        rows.sort((a, b) => {
            const dataA = this.getRowData(a, config.headers);
            const dataB = this.getRowData(b, config.headers);
            
            let valueA = dataA[sortKey];
            let valueB = dataB[sortKey];
            
            // Convertir a números si es necesario
            if (typeof valueA === 'number' && typeof valueB === 'number') {
                return direction === 'asc' ? valueA - valueB : valueB - valueA;
            }
            
            // Convertir a string para comparación
            valueA = valueA ? valueA.toString() : '';
            valueB = valueB ? valueB.toString() : '';
            
            const comparison = valueA.localeCompare(valueB);
            return direction === 'asc' ? comparison : -comparison;
        });
        
        // Reorganizar DOM
        rows.forEach(row => tbody.appendChild(row));
        
        // Actualizar estado
        tableInfo.sortKey = sortKey;
        tableInfo.sortDirection = direction;
        
        // Actualizar indicadores visuales
        this.updateSortIndicators(tableId, sortKey, direction);
    }
    
    /**
     * Actualiza indicadores visuales de ordenamiento
     * @param {string} tableId - ID de la tabla
     * @param {string} sortKey - Clave ordenada
     * @param {string} direction - Dirección del ordenamiento
     */
    updateSortIndicators(tableId, sortKey, direction) {
        const table = document.getElementById(tableId);
        if (!table) return;
        
        const headers = table.querySelectorAll('th.sortable');
        headers.forEach(header => {
            const icon = header.querySelector('.sort-icon');
            if (!icon) return;
            
            if (header.textContent.trim() === this.getHeaderLabel(tableId, sortKey)) {
                icon.textContent = direction === 'asc' ? '↑' : '↓';
                header.classList.add('sorted');
            } else {
                icon.textContent = '↕';
                header.classList.remove('sorted');
            }
        });
    }
    
    /**
     * Obtiene la etiqueta de un header
     * @param {string} tableId - ID de la tabla
     * @param {string} sortKey - Clave del header
     * @returns {string} Etiqueta del header
     */
    getHeaderLabel(tableId, sortKey) {
        const tableInfo = this.tables.get(tableId);
        if (!tableInfo) return '';
        
        const header = tableInfo.config.headers.find(h => h.key === sortKey);
        return header ? header.label : '';
    }
    
    /**
     * Obtiene datos de una fila
     * @param {HTMLElement} row - Elemento de fila
     * @param {Array} headers - Headers de la tabla
     * @returns {Object} Datos de la fila
     */
    getRowData(row, headers) {
        const data = {};
        const cells = row.querySelectorAll('td');
        
        headers.forEach((header, index) => {
            data[header.key] = cells[index] ? cells[index].textContent : '';
        });
        
        return data;
    }
    
    /**
     * Crea un elemento HTML
     * @param {string} tag - Tag HTML
     * @param {Object} attributes - Atributos
     * @returns {HTMLElement} Elemento creado
     */
    createElement(tag, attributes = {}) {
        const element = document.createElement(tag);
        
        Object.entries(attributes).forEach(([key, value]) => {
            if (key === 'className') {
                element.className = value;
            } else {
                element.setAttribute(key, value);
            }
        });
        
        return element;
    }
}

// ==============================================
// GESTIÓN DE LISTAS
// ==============================================

class ListManager {
    constructor() {
        this.lists = new Map();
    }
    
    /**
     * Crea una lista HTML
     * @param {Object} config - Configuración de la lista
     * @returns {HTMLElement} Elemento de lista
     */
    createList(config) {
        const {
            id,
            items,
            itemTemplate,
            searchable = false,
            sortable = false,
            pagination = false
        } = config;
        
        const listElement = this.createElement('div', { 
            className: 'list-container',
            id: id
        });
        
        // Agregar búsqueda si es necesaria
        if (searchable) {
            const searchContainer = this.createElement('div', { className: 'list-search' });
            const searchInput = this.createElement('input', {
                className: 'input',
                placeholder: 'Buscar...',
                type: 'text'
            });
            searchContainer.appendChild(searchInput);
            listElement.appendChild(searchContainer);
            
            searchInput.addEventListener('input', (e) => {
                this.filterList(id, e.target.value);
            });
        }
        
        // Crear contenedor de items
        const itemsContainer = this.createElement('div', { 
            className: 'list-items',
            id: `${id}-items`
        });
        
        // Agregar items iniciales
        this.updateListItems(id, items, itemTemplate);
        
        listElement.appendChild(itemsContainer);
        
        // Almacenar configuración
        this.lists.set(id, {
            element: listElement,
            config: config,
            allItems: items || []
        });
        
        return listElement;
    }
    
    /**
     * Actualiza los items de una lista
     * @param {string} listId - ID de la lista
     * @param {Array} items - Nuevos items
     * @param {Function} itemTemplate - Plantilla para cada item
     */
    updateListItems(listId, items, itemTemplate) {
        const listInfo = this.lists.get(listId);
        if (!listInfo) return;
        
        const itemsContainer = document.getElementById(`${listId}-items`);
        if (!itemsContainer) return;
        
        // Limpiar contenedor
        itemsContainer.innerHTML = '';
        
        // Agregar nuevos items
        items.forEach(item => {
            const itemElement = itemTemplate ? itemTemplate(item) : this.createDefaultListItem(item);
            itemsContainer.appendChild(itemElement);
        });
        
        // Actualizar lista de items completos
        listInfo.allItems = items;
    }
    
    /**
     * Crea un item de lista por defecto
     * @param {Object} item - Datos del item
     * @returns {HTMLElement} Elemento del item
     */
    createDefaultListItem(item) {
        const itemElement = this.createElement('div', { className: 'list-item' });
        itemElement.textContent = item.name || item.title || item.toString();
        return itemElement;
    }
    
    /**
     * Filtra una lista
     * @param {string} listId - ID de la lista
     * @param {string} searchTerm - Término de búsqueda
     */
    filterList(listId, searchTerm) {
        const itemsContainer = document.getElementById(`${listId}-items`);
        if (!itemsContainer) return;
        
        const items = itemsContainer.querySelectorAll('.list-item');
        
        items.forEach(item => {
            const matches = item.textContent.toLowerCase().includes(searchTerm.toLowerCase());
            item.style.display = matches ? '' : 'none';
        });
    }
    
    createElement(tag, attributes = {}) {
        const element = document.createElement(tag);
        
        Object.entries(attributes).forEach(([key, value]) => {
            if (key === 'className') {
                element.className = value;
            } else {
                element.setAttribute(key, value);
            }
        });
        
        return element;
    }
}

// ==============================================
// GESTIÓN DE MODALES
// ==============================================

class ModalManager {
    constructor() {
        this.activeModal = null;
    }
    
    /**
     * Abre un modal
     * @param {string} modalId - ID del modal
     * @param {Object} data - Datos para el modal
     */
    openModal(modalId, data = null) {
        const modal = document.getElementById(modalId);
        if (!modal) return;
        
        // Llenar datos si se proporcionan
        if (data) {
            this.populateModalData(modal, data);
        }
        
        // Mostrar modal
        modal.classList.add('active');
        this.activeModal = modalId;
        document.body.style.overflow = 'hidden';
        
        // Enfocar primer input
        const firstInput = modal.querySelector('input, select, textarea, button');
        if (firstInput) {
            setTimeout(() => firstInput.focus(), 100);
        }
        
        // Configurar eventos
        this.setupModalEvents(modal);
    }
    
    /**
     * Cierra un modal
     * @param {string} modalId - ID del modal (opcional)
     */
    closeModal(modalId = null) {
        const modalToClose = modalId ? document.getElementById(modalId) : this.getActiveModal();
        
        if (modalToClose) {
            modalToClose.classList.remove('active');
            
            // Limpiar formulario si existe
            const form = modalToClose.querySelector('form');
            if (form) {
                form.reset();
            }
        }
        
        this.activeModal = null;
        document.body.style.overflow = '';
    }
    
    /**
     * Obtiene el modal activo
     * @returns {HTMLElement|null} Modal activo
     */
    getActiveModal() {
        if (!this.activeModal) return null;
        return document.getElementById(this.activeModal);
    }
    
    /**
     * Llena un modal con datos
     * @param {HTMLElement} modal - Elemento del modal
     * @param {Object} data - Datos a llenar
     */
    populateModalData(modal, data) {
        Object.entries(data).forEach(([key, value]) => {
            const element = modal.querySelector(`[name="${key}"], #${key}`);
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
     * Configura eventos del modal
     * @param {HTMLElement} modal - Elemento del modal
     */
    setupModalEvents(modal) {
        // Cerrar con ESC
        const handleEsc = (e) => {
            if (e.key === 'Escape') {
                this.closeModal(modal.id);
                document.removeEventListener('keydown', handleEsc);
            }
        };
        document.addEventListener('keydown', handleEsc);
        
        // Cerrar al hacer clic fuera
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeModal(modal.id);
            }
        });
    }
    
    /**
     * Crea un modal dinámico
     * @param {Object} config - Configuración del modal
     * @returns {HTMLElement} Modal creado
     */
    createDynamicModal(config) {
        const {
            title,
            content,
            size = 'medium', // small, medium, large
            closable = true
        } = config;
        
        const modal = this.createElement('div', { className: 'modal' });
        const modalContent = this.createElement('div', { className: `modal-content modal-${size}` });
        
        // Header
        const header = this.createElement('div', { className: 'modal-header' });
        const titleElement = this.createElement('h3');
        titleElement.textContent = title;
        header.appendChild(titleElement);
        
        if (closable) {
            const closeBtn = this.createElement('button', { 
                className: 'modal-close',
                'data-action': 'close-modal'
            });
            closeBtn.innerHTML = '<i data-lucide="x"></i>';
            header.appendChild(closeBtn);
        }
        
        // Body
        const body = this.createElement('div', { className: 'modal-body' });
        if (typeof content === 'string') {
            body.innerHTML = content;
        } else {
            body.appendChild(content);
        }
        
        modalContent.appendChild(header);
        modalContent.appendChild(body);
        modal.appendChild(modalContent);
        
        // Agregar al DOM
        document.body.appendChild(modal);
        
        return modal;
    }
    
    createElement(tag, attributes = {}) {
        const element = document.createElement(tag);
        
        Object.entries(attributes).forEach(([key, value]) => {
            if (key === 'className') {
                element.className = value;
            } else {
                element.setAttribute(key, value);
            }
        });
        
        return element;
    }
}

// ==============================================
// GESTIÓN DE NOTIFICACIONES
// ==============================================

class NotificationManager {
    constructor() {
        this.notifications = [];
        this.container = null;
        this.init();
    }
    
    init() {
        this.createContainer();
    }
    
    /**
     * Crea el contenedor de notificaciones
     */
    createContainer() {
        this.container = this.createElement('div', {
            id: 'notification-container',
            className: 'notification-container'
        });
        
        document.body.appendChild(this.container);
    }
    
    /**
     * Muestra una notificación
     * @param {Object} options - Opciones de la notificación
     */
    show(options) {
        const {
            title = '',
            message = '',
            type = 'info', // info, success, warning, error
            duration = 5000,
            closable = true,
            actions = []
        } = options;
        
        const notification = this.createNotification({
            title,
            message,
            type,
            closable,
            actions
        });
        
        this.container.appendChild(notification);
        this.notifications.push(notification);
        
        // Auto-remove
        if (duration > 0) {
            setTimeout(() => {
                this.remove(notification);
            }, duration);
        }
        
        // Animar entrada
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        return notification;
    }
    
    /**
     * Crea una notificación
     * @param {Object} config - Configuración de la notificación
     * @returns {HTMLElement} Elemento de notificación
     */
    createNotification(config) {
        const notification = this.createElement('div', {
            className: `notification notification-${config.type}`
        });
        
        // Icon
        const icon = this.createElement('div', { className: 'notification-icon' });
        icon.innerHTML = this.getNotificationIcon(config.type);
        notification.appendChild(icon);
        
        // Content
        const content = this.createElement('div', { className: 'notification-content' });
        
        if (config.title) {
            const title = this.createElement('div', { className: 'notification-title' });
            title.textContent = config.title;
            content.appendChild(title);
        }
        
        if (config.message) {
            const message = this.createElement('div', { className: 'notification-message' });
            message.textContent = config.message;
            content.appendChild(message);
        }
        
        notification.appendChild(content);
        
        // Actions
        if (config.actions.length > 0) {
            const actions = this.createElement('div', { className: 'notification-actions' });
            config.actions.forEach(action => {
                const button = this.createElement('button', {
                    className: `btn btn-sm ${action.className || 'btn-primary'}`,
                    'data-action': action.key
                });
                button.textContent = action.label;
                
                button.addEventListener('click', () => {
                    if (action.handler) {
                        action.handler();
                    }
                    this.remove(notification);
                });
                
                actions.appendChild(button);
            });
            notification.appendChild(actions);
        }
        
        // Close button
        if (config.closable) {
            const closeBtn = this.createElement('button', {
                className: 'notification-close',
                'data-action': 'close'
            });
            closeBtn.innerHTML = '×';
            
            closeBtn.addEventListener('click', () => {
                this.remove(notification);
            });
            
            notification.appendChild(closeBtn);
        }
        
        return notification;
    }
    
    /**
     * Obtiene el icono para el tipo de notificación
     * @param {string} type - Tipo de notificación
     * @returns {string} HTML del icono
     */
    getNotificationIcon(type) {
        const icons = {
            info: '<i data-lucide="info"></i>',
            success: '<i data-lucide="check-circle"></i>',
            warning: '<i data-lucide="alert-triangle"></i>',
            error: '<i data-lucide="x-circle"></i>'
        };
        
        return icons[type] || icons.info;
    }
    
    /**
     * Elimina una notificación
     * @param {HTMLElement} notification - Elemento de notificación
     */
    remove(notification) {
        notification.classList.remove('show');
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
            
            const index = this.notifications.indexOf(notification);
            if (index > -1) {
                this.notifications.splice(index, 1);
            }
        }, 300);
    }
    
    /**
     * Elimina todas las notificaciones
     */
    clear() {
        this.notifications.forEach(notification => {
            this.remove(notification);
        });
    }
    
    /**
     * Muestra notificación de éxito
     * @param {string} message - Mensaje
     * @param {Object} options - Opciones adicionales
     */
    success(message, options = {}) {
        return this.show({
            type: 'success',
            message,
            ...options
        });
    }
    
    /**
     * Muestra notificación de error
     * @param {string} message - Mensaje
     * @param {Object} options - Opciones adicionales
     */
    error(message, options = {}) {
        return this.show({
            type: 'error',
            message,
            ...options
        });
    }
    
    /**
     * Muestra notificación de advertencia
     * @param {string} message - Mensaje
     * @param {Object} options - Opciones adicionales
     */
    warning(message, options = {}) {
        return this.show({
            type: 'warning',
            message,
            ...options
        });
    }
    
    /**
     * Muestra notificación informativa
     * @param {string} message - Mensaje
     * @param {Object} options - Opciones adicionales
     */
    info(message, options = {}) {
        return this.show({
            type: 'info',
            message,
            ...options
        });
    }
    
    createElement(tag, attributes = {}) {
        const element = document.createElement(tag);
        
        Object.entries(attributes).forEach(([key, value]) => {
            if (key === 'className') {
                element.className = value;
            } else {
                element.setAttribute(key, value);
            }
        });
        
        return element;
    }
}

// ==============================================
// INICIALIZACIÓN
// ==============================================

// Crear instancias globales
window.TableManager = new TableManager();
window.ListManager = new ListManager();
window.ModalManager = new ModalManager();
window.NotificationManager = new NotificationManager();