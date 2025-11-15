/**
 * ConAdmin Chile - Utility Functions
 * Funciones de Utilidad y Herramientas Comunes
 */

// ==============================================
// FORMATEO Y VALIDACIÓN
// ==============================================

/**
 * Formatea un RUT chileno
 * @param {string} rut - RUT sin formato
 * @returns {string} RUT formateado
 */
function formatRUT(rut) {
    if (!rut) return '';
    
    // Remover caracteres no numéricos excepto K/k
    rut = rut.replace(/[^\dkK]/g, '');
    
    if (rut.length < 2) return rut;
    
    // Separar cuerpo y dígito verificador
    const body = rut.slice(0, -1);
    const dv = rut.slice(-1).toLowerCase();
    
    // Formatear con puntos y guión
    let formatted = body;
    if (body.length > 6) {
        formatted = body.slice(0, -6) + '.' + body.slice(-6, -3) + '.' + body.slice(-3);
    } else if (body.length > 3) {
        formatted = body.slice(0, -3) + '.' + body.slice(-3);
    }
    
    return `${formatted}-${dv}`;
}

/**
 * Valida un RUT chileno
 * @param {string} rut - RUT a validar
 * @returns {boolean} true si es válido
 */
function validateRUT(rut) {
    if (!rut) return false;
    
    // Formatear para validación
    rut = rut.replace(/[^\dkK]/g, '').toLowerCase();
    
    if (rut.length < 2) return false;
    
    const body = rut.slice(0, -1);
    const dv = rut.slice(-1);
    
    // Calcular dígito verificador
    let sum = 0;
    let multiplier = 2;
    
    for (let i = body.length - 1; i >= 0; i--) {
        sum += parseInt(body[i]) * multiplier;
        multiplier = multiplier === 7 ? 2 : multiplier + 1;
    }
    
    const calculatedDV = 11 - (sum % 11);
    const expectedDV = calculatedDV === 11 ? '0' : 
                      calculatedDV === 10 ? 'k' : 
                      calculatedDV.toString();
    
    return dv === expectedDV;
}

/**
 * Formatea un número como moneda chilena
 * @param {number} amount - Cantidad a formatear
 * @returns {string} Cantidad formateada
 */
function formatCurrency(amount) {
    if (amount === null || amount === undefined) return '$0';
    
    return new Intl.NumberFormat('es-CL', {
        style: 'currency',
        currency: 'CLP',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
}

/**
 * Formatea un número con separadores de miles
 * @param {number} num - Número a formatear
 * @returns {string} Número formateado
 */
function formatNumber(num) {
    if (num === null || num === undefined) return '0';
    
    return new Intl.NumberFormat('es-CL').format(num);
}

/**
 * Formatea una fecha para mostrar
 * @param {string|Date} date - Fecha a formatear
 * @param {boolean} includeTime - Si incluir la hora
 * @returns {string} Fecha formateada
 */
function formatDate(date, includeTime = false) {
    if (!date) return '';
    
    const dateObj = new Date(date);
    const options = {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    };
    
    if (includeTime) {
        options.hour = '2-digit';
        options.minute = '2-digit';
    }
    
    return dateObj.toLocaleDateString('es-CL', options);
}

/**
 * Formatea una fecha relativa (hace X tiempo)
 * @param {string|Date} date - Fecha a formatear
 * @returns {string} Fecha relativa
 */
function formatRelativeDate(date) {
    if (!date) return '';
    
    const now = new Date();
    const dateObj = new Date(date);
    const diffMs = now - dateObj;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    
    if (diffMinutes < 1) return 'Ahora mismo';
    if (diffMinutes < 60) return `Hace ${diffMinutes} min`;
    if (diffHours < 24) return `Hace ${diffHours}h`;
    if (diffDays < 7) return `Hace ${diffDays}d`;
    
    return formatDate(date);
}

/**
 * Capitaliza la primera letra de cada palabra
 * @param {string} str - String a capitalizar
 * @returns {string} String capitalizado
 */
function capitalize(str) {
    if (!str) return '';
    
    return str.toLowerCase()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

/**
 * Trunca un texto a una longitud específica
 * @param {string} text - Texto a truncar
 * @param {number} maxLength - Longitud máxima
 * @returns {string} Texto truncado
 */
function truncateText(text, maxLength = 50) {
    if (!text || text.length <= maxLength) return text;
    
    return text.substring(0, maxLength) + '...';
}

// ==============================================
// OPERACIONES CON FECHAS
// ==============================================

/**
 * Obtiene el primer día del mes actual
 * @returns {Date} Primer día del mes
 */
function getFirstDayOfMonth() {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
}

/**
 * Obtiene el último día del mes actual
 * @returns {Date} Último día del mes
 */
function getLastDayOfMonth() {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth() + 1, 0);
}

/**
 * Obtiene el primer día del año actual
 * @returns {Date} Primer día del año
 */
function getFirstDayOfYear() {
    const now = new Date();
    return new Date(now.getFullYear(), 0, 1);
}

/**
 * Calcula la diferencia en días entre dos fechas
 * @param {Date} date1 - Primera fecha
 * @param {Date} date2 - Segunda fecha
 * @returns {number} Diferencia en días
 */
function getDaysDifference(date1, date2) {
    const msPerDay = 24 * 60 * 60 * 1000;
    return Math.round((date2 - date1) / msPerDay);
}

/**
 * Verifica si una fecha está en el rango especificado
 * @param {Date} date - Fecha a verificar
 * @param {Date} startDate - Fecha de inicio
 * @param {Date} endDate - Fecha de fin
 * @returns {boolean} true si está en el rango
 */
function isDateInRange(date, startDate, endDate) {
    const dateObj = new Date(date);
    return dateObj >= startDate && dateObj <= endDate;
}

/**
 * Suma días a una fecha
 * @param {Date} date - Fecha base
 * @param {number} days - Días a sumar
 * @returns {Date} Nueva fecha
 */
function addDays(date, days) {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
}

/**
 * Obtiene el nombre del mes en español
 * @param {number} monthIndex - Índice del mes (0-11)
 * @returns {string} Nombre del mes
 */
function getMonthName(monthIndex) {
    const months = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    
    return months[monthIndex] || '';
}

// ==============================================
// OPERACIONES CON ARRAYS Y OBJETOS
// ==============================================

/**
 * Filtra un array de objetos por múltiples criterios
 * @param {Array} array - Array a filtrar
 * @param {Object} filters - Criterios de filtrado
 * @returns {Array} Array filtrado
 */
function filterByMultipleCriteria(array, filters) {
    return array.filter(item => {
        return Object.keys(filters).every(key => {
            const filterValue = filters[key];
            const itemValue = item[key];
            
            if (filterValue === '' || filterValue === null || filterValue === undefined) {
                return true;
            }
            
            if (typeof filterValue === 'string') {
                return itemValue.toString().toLowerCase().includes(filterValue.toLowerCase());
            }
            
            return itemValue === filterValue;
        });
    });
}

/**
 * Agrupa un array de objetos por una propiedad específica
 * @param {Array} array - Array a agrupar
 * @param {string} property - Propiedad para agrupar
 * @returns {Object} Objeto agrupado
 */
function groupBy(array, property) {
    return array.reduce((groups, item) => {
        const value = item[property];
        if (!groups[value]) {
            groups[value] = [];
        }
        groups[value].push(item);
        return groups;
    }, {});
}

/**
 * Ordena un array de objetos por múltiples criterios
 * @param {Array} array - Array a ordenar
 * @param {Array} sortCriteria - Criterios de ordenamiento
 * @returns {Array} Array ordenado
 */
function sortByMultipleCriteria(array, sortCriteria) {
    return array.sort((a, b) => {
        for (let criteria of sortCriteria) {
            const { property, direction = 'asc' } = criteria;
            
            let valueA = a[property];
            let valueB = b[property];
            
            // Manejar valores nulos/undefined
            if (valueA == null && valueB == null) continue;
            if (valueA == null) return direction === 'asc' ? 1 : -1;
            if (valueB == null) return direction === 'asc' ? -1 : 1;
            
            // Comparación
            let comparison = 0;
            if (typeof valueA === 'string') {
                comparison = valueA.localeCompare(valueB);
            } else {
                comparison = valueA - valueB;
            }
            
            if (comparison !== 0) {
                return direction === 'asc' ? comparison : -comparison;
            }
        }
        return 0;
    });
}

/**
 * Obtiene valores únicos de una propiedad en un array
 * @param {Array} array - Array a procesar
 * @param {string} property - Propiedad a obtener
 * @returns {Array} Valores únicos
 */
function getUniqueValues(array, property) {
    return [...new Set(array.map(item => item[property]))];
}

/**
 * Busca en un array de objetos por texto libre
 * @param {Array} array - Array a buscar
 * @param {string} searchTerm - Término de búsqueda
 * @param {Array} searchFields - Campos donde buscar
 * @returns {Array} Resultados de búsqueda
 */
function searchInArray(array, searchTerm, searchFields) {
    if (!searchTerm || searchTerm.trim() === '') {
        return array;
    }
    
    const term = searchTerm.toLowerCase().trim();
    
    return array.filter(item => {
        return searchFields.some(field => {
            const value = item[field];
            return value && value.toString().toLowerCase().includes(term);
        });
    });
}

// ==============================================
// UTILIDADES DE UI
// ==============================================

/**
 * Crea un elemento HTML con atributos
 * @param {string} tag - Tag HTML
 * @param {Object} attributes - Atributos del elemento
 * @param {string|Array} content - Contenido del elemento
 * @returns {HTMLElement} Elemento creado
 */
function createElement(tag, attributes = {}, content = '') {
    const element = document.createElement(tag);
    
    Object.entries(attributes).forEach(([key, value]) => {
        if (key === 'className') {
            element.className = value;
        } else if (key === 'dataset') {
            Object.entries(value).forEach(([dataKey, dataValue]) => {
                element.dataset[dataKey] = dataValue;
            });
        } else {
            element.setAttribute(key, value);
        }
    });
    
    if (Array.isArray(content)) {
        content.forEach(child => element.appendChild(child));
    } else if (content instanceof Node) {
        element.appendChild(content);
    } else {
        element.innerHTML = content;
    }
    
    return element;
}

/**
 * Escape HTML para prevenir XSS
 * @param {string} text - Texto a escapar
 * @returns {string} Texto escapado
 */
function escapeHtml(text) {
    if (!text) return '';
    
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    
    return text.toString().replace(/[&<>"']/g, m => map[m]);
}

/**
 * Obtiene el color de estado basado en el valor
 * @param {string|number} value - Valor a evaluar
 * @returns {string} Clase de color
 */
function getStatusColor(value) {
    if (typeof value === 'number') {
        if (value === 0) return 'success';
        if (value > 0) return 'error';
    }
    
    const statusMap = {
        'pagado': 'success',
        'al_dia': 'success',
        'pendiente': 'warning',
        'en_proceso': 'warning',
        'atrasado': 'error',
        'completado': 'success',
        'disponible': 'success',
        'ocupado': 'error',
        'urgente': 'error'
    };
    
    return statusMap[value] || 'neutral';
}

/**
 * Obtiene el texto del estado en español
 * @param {string} status - Estado en inglés
 * @returns {string} Estado en español
 */
function getStatusText(status) {
    const statusTextMap = {
        'propietario': 'Propietario',
        'arrendatario': 'Arrendatario',
        'vacant': 'Vacante',
        'pagado': 'Pagado',
        'pendiente': 'Pendiente',
        'atrasado': 'Atrasado',
        'en_proceso': 'En Proceso',
        'completado': 'Completado',
        'disponible': 'Disponible',
        'ocupado': 'Ocupado',
        'confirmada': 'Confirmada',
        'baja': 'Baja',
        'media': 'Media',
        'alta': 'Alta',
        'urgente': 'Urgente'
    };
    
    return statusTextMap[status] || status;
}

/**
 * Calcula el porcentaje de ocupación
 * @param {number} total - Total de unidades
 * @param {number} occupied - Unidades ocupadas
 * @returns {number} Porcentaje de ocupación
 */
function calculateOccupancyPercentage(total, occupied) {
    if (total === 0) return 0;
    return Math.round((occupied / total) * 100);
}

// ==============================================
// UTILIDADES DE DATOS
// ==============================================

/**
 * Genera un ID único
 * @returns {string} ID único
 */
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * Clona un objeto profundamente
 * @param {Object} obj - Objeto a clonar
 * @returns {Object} Objeto clonado
 */
function deepClone(obj) {
    if (obj === null || typeof obj !== 'object') return obj;
    if (obj instanceof Date) return new Date(obj.getTime());
    if (obj instanceof Array) return obj.map(item => deepClone(item));
    if (obj instanceof Object) {
        const cloned = {};
        Object.keys(obj).forEach(key => {
            cloned[key] = deepClone(obj[key]);
        });
        return cloned;
    }
}

/**
 * Verifica si un objeto está vacío
 * @param {Object} obj - Objeto a verificar
 * @returns {boolean} true si está vacío
 */
function isEmpty(obj) {
    if (obj == null) return true;
    if (Array.isArray(obj) || typeof obj === 'string') return obj.length === 0;
    if (typeof obj === 'object') return Object.keys(obj).length === 0;
    return false;
}

/**
 * Obtiene estadísticas básicas de un array numérico
 * @param {Array} numbers - Array de números
 * @returns {Object} Estadísticas
 */
function getBasicStats(numbers) {
    if (!numbers || numbers.length === 0) {
        return { count: 0, sum: 0, average: 0, min: 0, max: 0 };
    }
    
    const sorted = [...numbers].sort((a, b) => a - b);
    const sum = numbers.reduce((acc, num) => acc + num, 0);
    
    return {
        count: numbers.length,
        sum: sum,
        average: sum / numbers.length,
        min: sorted[0],
        max: sorted[sorted.length - 1],
        median: sorted.length % 2 === 0 
            ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
            : sorted[Math.floor(sorted.length / 2)]
    };
}

// ==============================================
// VALIDACIONES
// ==============================================

/**
 * Valida un email
 * @param {string} email - Email a validar
 * @returns {boolean} true si es válido
 */
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Valida un teléfono chileno
 * @param {string} phone - Teléfono a validar
 * @returns {boolean} true si es válido
 */
function validateChileanPhone(phone) {
    // Formato: +56912345678, 912345678, 56912345678
    const phoneRegex = /^(\+56)?[9][0-9]{8}$/;
    return phoneRegex.test(phone.replace(/\s|-/g, ''));
}

/**
 * Valida que una fecha sea válida
 * @param {string|Date} date - Fecha a validar
 * @returns {boolean} true si es válida
 */
function isValidDate(date) {
    if (date instanceof Date) {
        return !isNaN(date.getTime());
    }
    
    const dateObj = new Date(date);
    return !isNaN(dateObj.getTime());
}

/**
 * Valida que un campo no esté vacío
 * @param {*} value - Valor a validar
 * @returns {boolean} true si no está vacío
 */
function isNotEmpty(value) {
    return value !== null && value !== undefined && value.toString().trim() !== '';
}

// ==============================================
// EXPORTAR FUNCIONES
// ==============================================

// Hacer disponibles las funciones globalmente
window.ConAdminUtils = {
    // Formateo
    formatRUT,
    validateRUT,
    formatCurrency,
    formatNumber,
    formatDate,
    formatRelativeDate,
    capitalize,
    truncateText,
    
    // Fechas
    getFirstDayOfMonth,
    getLastDayOfMonth,
    getFirstDayOfYear,
    getDaysDifference,
    isDateInRange,
    addDays,
    getMonthName,
    
    // Arrays y objetos
    filterByMultipleCriteria,
    groupBy,
    sortByMultipleCriteria,
    getUniqueValues,
    searchInArray,
    
    // UI
    createElement,
    escapeHtml,
    getStatusColor,
    getStatusText,
    calculateOccupancyPercentage,
    
    // Datos
    generateId,
    deepClone,
    isEmpty,
    getBasicStats,
    
    // Validaciones
    validateEmail,
    validateChileanPhone,
    isValidDate,
    isNotEmpty
};