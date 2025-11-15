# ConAdmin Chile 🏢

Sistema completo de administración de condominios específicamente diseñado para Chile, optimizado para despliegue en Cloudflare Pages.

## 🌟 Características

### 📊 Dashboard Principal
- **Métricas en tiempo real**: Gastos comunes, número de residentes, pagos pendientes
- **Gráficos interactivos**: Visualización de ingresos mensuales y estadísticas clave
- **Notificaciones**: Sistema de alertas para eventos importantes
- **Resumen de reservas**: Próximas reservas de áreas comunes

### 👥 Gestión de Residentes
- **Registro completo**: Nombre, RUT, teléfono, email, departamento
- **Estados de ocupación**: Propietario, arrendatario, vacante
- **Búsqueda avanzada**: Por nombre, RUT o departamento
- **Control de deudas**: Seguimiento automático de pagos pendientes
- **Validación de RUT**: Verificación automática del formato chileno

### 💰 Administración Financiera
- **Control de gastos comunes**: Configuración mensual en pesos chilenos (CLP)
- **Seguimiento de pagos**: Estados de pagado, pendiente y atrasado
- **Reportes financieros**: Generación de informes detallados
- **Cálculo automático de deudas**: Basado en historial de pagos
- **Resumen de estados**: Distribución de residentes por estado de pago

### 🔧 Gestión de Mantenciones
- **Solicitudes de mantención**: Registro con descripción detallada
- **Sistema de prioridades**: Baja, media, alta, urgente
- **Seguimiento de estados**: Pendiente, en proceso, completado
- **Asignación de áreas**: Áreas comunes o privadas
- **Historial completo**: Registro de todas las mantenciones realizadas

### 📢 Comunicaciones
- **Anuncios generales**: Comunicación a todos los residentes
- **Mensajes específicos**: Comunicación dirigida a grupos específicos
- **Sistema de notificaciones**: Alertas automáticas por eventos importantes
- **Historial de comunicaciones**: Registro de todos los mensajes enviados

### 🏊 Áreas Comunes
- **Reserva de espacios**: Salón multiuso, quincho, piscina
- **Control de conflictos**: Verificación automática de horarios
- **Gestión de disponibilidad**: Estado en tiempo real de cada área
- **Propósito de reserva**: Registro del motivo de cada reserva

### 📈 Reportes y Análisis
- **Reporte financiero**: Resumen completo de ingresos y gastos
- **Reporte de residentes**: Lista detallada con estados de pago
- **Reporte de mantenciones**: Historial y estado de todas las actividades
- **Reporte general**: Resumen ejecutivo de todas las operaciones

## 🚀 Tecnologías Utilizadas

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Tipografía**: Inter (Google Fonts)
- **Iconos**: Lucide Icons
- **Gráficos**: Chart.js (con fallbacks CSS)
- **Almacenamiento**: localStorage (con respaldo automático)
- **Despliegue**: Cloudflare Pages
- **Diseño**: Responsivo, enfoque mobile-first

## 🛠️ Instalación y Configuración

### Prerrequisitos
- Node.js 18+ (opcional, solo para desarrollo local)
- Cuenta de Cloudflare
- Git

### Instalación Local

1. **Clonar el repositorio**:
   ```bash
   git clone https://github.com/usuario/condo-admin-chile.git
   cd condo-admin-chile
   ```

2. **Instalar dependencias** (opcional):
   ```bash
   npm install
   ```

3. **Ejecutar en desarrollo**:
   ```bash
   npm run dev
   ```

4. **Abrir en el navegador**:
   ```
   http://localhost:8080
   ```

### Opciones de Despliegue

#### 🌟 Opción 1: GitHub Web (Más Fácil - Sin PC)

**Para usuarios que quieren subir desde el navegador:**

1. **Descargar el ZIP** del proyecto
2. **Crear repositorio** en GitHub.com
3. **Subir archivos** uno por uno desde GitHub web
4. **Activar GitHub Pages**

📖 **Guía detallada**: Ver `GITHUB-WEB-GUIDE.md`
📋 **Lista de verificación**: Ver `UPLOAD-CHECKLIST.md`

#### 💻 Opción 2: GitHub desde PC (Con Git)

1. **Subir a GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/tu-usuario/condo-admin-chile.git
   git push -u origin main
   ```

2. **Activar GitHub Pages**:
   - Ir a `Settings` → `Pages` en tu repositorio
   - En `Source`, seleccionar "Deploy from a branch"
   - En `Branch`, seleccionar "main" y "/ (root)"
   - Guardar

3. **Acceder a la aplicación**:
   - URL: `https://tu-usuario.github.io/condo-admin-chile/`

#### ☁️ Opción 2: Cloudflare Pages

##### Despliegue desde Git

1. **Conectar repositorio**:
   - Ir a [Cloudflare Pages](https://pages.cloudflare.com/)
   - Conectar con GitHub/GitLab
   - Seleccionar el repositorio

2. **Configurar build**:
   - **Build command**: `echo "No build step required"`
   - **Build output directory**: `/`
   - **Root directory**: (dejar vacío)

3. **Variables de entorno** (opcional):
   - No se requieren variables de entorno para esta aplicación

4. **Desplegar**:
   - Hacer clic en "Save and Deploy"

##### Despliegue manual

1. **Subir archivos**:
   - Comprimir todos los archivos en un ZIP
   - Ir a Cloudflare Pages
   - Seleccionar "Upload assets"

2. **Configurar**:
   - Asignar un nombre al proyecto
   - Configurar el dominio personalizado (opcional)

### 🔑 Credenciales de Acceso

Al acceder por primera vez, use las credenciales por defecto:

- **Usuario**: `admin`
- **Contraseña**: `condo123`

**⚠️ IMPORTANTE**: Cambie las credenciales por defecto después del primer acceso por seguridad.

## 📁 Estructura del Proyecto

```
condo-admin-chile/
├── index.html                 # Página principal
├── css/
│   ├── main.css              # Estilos base y componentes
│   ├── components.css        # Componentes específicos
│   └── responsive.css        # Estilos responsivos
├── js/
│   ├── app.js                # Aplicación principal
│   ├── utils.js              # Utilidades y funciones helper
│   ├── storage.js            # Gestión de almacenamiento
│   ├── components.js         # Gestión de componentes UI
│   ├── sections.js           # Lógica de secciones
│   └── charts.js             # Gestión de gráficos
├── assets/                   # Recursos estáticos
├── package.json              # Configuración npm
├── wrangler.toml            # Configuración Cloudflare
├── .gitignore               # Archivos ignorados por Git
└── README.md                # Documentación
```

## 🔧 Configuración

### Configuración Inicial

Al acceder por primera vez, la aplicación muestra una pantalla de login con credenciales por defecto:

- **Usuario**: `admin`
- **Contraseña**: `condo123`

Después del login, la aplicación carga datos de ejemplo que incluyen:

- **3 residentes de muestra** con diferentes estados
- **Pagos de ejemplo** con diversos estados
- **Una solicitud de mantención** pendiente
- **Un anuncio de ejemplo**
- **Una reserva de área común**

**🔐 Seguridad**: El sistema utiliza autenticación local con localStorage. Para producción, se recomienda integrar con un backend seguro.

### Personalización

#### Configuración de Gastos Comunes

1. Ir a la sección **Finanzas**
2. Modificar el monto en "Gastos Comunes - Mes Actual"
3. Los cambios se guardan automáticamente

#### Información del Condominio

Para personalizar la información del condominio, modificar la configuración en `storage.js`:

```javascript
// En el método getConfig()
config: {
    monthlyFees: 85000,           // Gastos comunes mensuales
    buildingName: 'Mi Condominio', // Nombre del condominio
    address: 'Dirección completa', // Dirección
    administrator: 'Administrador', // Nombre del administrador
    phone: '+56 2 1234 5678',     // Teléfono
    email: 'admin@condominio.cl', // Email
    currency: 'CLP'               // Moneda
}
```

## 📊 Datos y Almacenamiento

### Almacenamiento Local

La aplicación utiliza `localStorage` para almacenar todos los datos:

- **Residentes**: Información completa de cada residente
- **Pagos**: Historial de todos los pagos
- **Mantenciones**: Solicitudes y su estado
- **Anuncios**: Comunicaciones enviadas
- **Reservas**: Reservas de áreas comunes
- **Configuración**: Ajustes del condominio

### Respaldo Automático

- **Respaldo automático**: Cada 5 minutos
- **Respaldo manual**: Disponible en la configuración
- **Exportación de datos**: Función para descargar todos los datos en JSON
- **Importación de datos**: Restaurar desde archivo de respaldo

### Integridad de Datos

La aplicación incluye validación automática:
- Verificación de RUT chileno
- Validación de referencias entre entidades
- Cálculo automático de deudas
- Detección de inconsistencias

## 🎨 Diseño y UX

### Sistema de Diseño

- **Paleta de colores profesional**: Azules corporativos con acentos semánticos
- **Tipografía Inter**: Alta legibilidad en todos los tamaños
- **Espaciado consistente**: Sistema basado en 8px
- **Sombras sutiles**: Profundidad visual sin saturación

### Responsividad

- **Mobile-first**: Diseñado primero para móviles
- **Breakpoints**:
  - Mobile: < 768px
  - Tablet: 768px - 1023px
  - Desktop: 1024px - 1279px
  - Large Desktop: ≥ 1280px

### Accesibilidad

- **Contraste alto**: Cumple WCAG AA
- **Navegación por teclado**: Soporte completo
- **Etiquetas semánticas**: HTML estructurado correctamente
- **Iconos descriptivos**: Lucide Icons con nombres claros

## 🔒 Seguridad

### Medidas Implementadas

- **Validación de entrada**: Sanitización de datos de usuario
- **Prevención XSS**: Escape automático de HTML
- **Validación de RUT**: Verificación del dígito verificador
- **Tipos de datos**: Validación de formato y tipos

### Consideraciones

- **Datos locales**: Toda la información se almacena localmente
- **Sin servidor**: No se envían datos a servidores externos
- **Privacidad**: Datos completamente privados del usuario
- **Backup local**: Respaldo en el navegador del usuario

## 📱 Funcionalidades Específicas para Chile

### Adaptaciones Locales

- **Moneda**: Pesos chilenos (CLP) con formato local
- **RUT**: Validación y formateo automático del RUN chileno
- **Fechas**: Formato DD/MM/YYYY
- **Idioma**: Español chileno
- **Términos**: Vocabulario adaptado al contexto local

### Validaciones Específicas

```javascript
// Ejemplo de validación de RUT
const rut = "12.345.678-9";
if (window.ConAdminUtils.validateRUT(rut)) {
    console.log("RUT válido");
}
```

## 🚀 Optimizaciones

### Performance

- **Carga lazy**: Componentes se cargan bajo demanda
- **Minimización**: CSS y JS optimizados para producción
- **Compresión**: Gzip habilitado en Cloudflare
- **Cache**: Cache agresivo para assets estáticos

### SEO

- **Meta tags**: Título y descripción optimizados
- **Estructura semántica**: HTML5 semántico
- **Performance**: Core Web Vitals optimizados

## 🧪 Desarrollo

### Scripts Disponibles

```bash
npm run dev        # Servidor de desarrollo local
npm run build      # Comando de build
npm run preview    # Vista previa de producción
```

### Agregar Nueva Funcionalidad

1. **HTML**: Agregar estructura en `index.html`
2. **CSS**: Definir estilos en archivos CSS correspondientes
3. **JavaScript**: Implementar lógica en archivos JS específicos
4. **Datos**: Actualizar esquema en `storage.js`
5. **Testing**: Probar en diferentes dispositivos

### Estructura de Datos

```javascript
// Ejemplo de estructura de residente
{
    id: 1,
    name: "Juan Pérez González",
    rut: "12.345.678-9",
    phone: "+56 9 1234 5678",
    email: "juan.perez@email.com",
    apartment: "101",
    status: "propietario", // propietario, arrendatario, vacant
    debt: 0,               // Deuda en CLP
    notes: "",
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z"
}
```

## 🐛 Solución de Problemas

### Problemas Comunes

**Los datos no se guardan**
- Verificar que localStorage esté habilitado
- Comprobar espacio disponible en el navegador

**Los gráficos no se muestran**
- Verificar conexión a internet (Chart.js se carga desde CDN)
- Los gráficos de respaldo aparecerán automáticamente

**Problemas de responsividad**
- Verificar viewport meta tag
- Comprobar media queries en CSS

### Logs y Debug

```javascript
// Activar logs detallados
localStorage.setItem('conadmin_debug', 'true');

// Verificar integridad de datos
const integrity = window.ConAdminStorage.verifyDataIntegrity();
console.log(integrity);
```

## 📈 Roadmap

### Próximas Funcionalidades

- [ ] **Módulo de multas**: Gestión de multas y sanciones
- [ ] **Integración de pagos**: Conexión con sistemas de pago chilenos
- [ ] **App móvil**: Aplicación nativa para Android/iOS
- [ ] **Multi-condominio**: Gestión de múltiples propiedades
- [ ] **Reportes avanzados**: Gráficos y análisis más detallados
- [ ] **Notificaciones push**: Alertas en tiempo real
- [ ] **Exportación PDF**: Generación de documentos PDF

### Mejoras Planificadas

- [ ] **Base de datos**: Migración a base de datos en la nube
- [ ] **Autenticación**: Sistema de usuarios y permisos
- [ ] **API REST**: Interface para integraciones externas
- [ ] **Modo offline**: Funcionamiento sin conexión a internet
- [ ] **Temas**: Soporte para modo oscuro y múltiples temas

## 🤝 Contribuciones

Este proyecto está abierto a contribuciones. Para contribuir:

1. Fork del repositorio
2. Crear rama para nueva funcionalidad (`git checkout -b feature/nueva-funcionalidad`)
3. Commit de cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crear Pull Request

### Directrices

- **Código limpio**: Seguir las convenciones establecidas
- **Comentarios**: Documentar funciones complejas
- **Testing**: Probar en múltiples navegadores
- **Responsividad**: Verificar en diferentes dispositivos

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo [LICENSE](LICENSE) para más detalles.

## 📞 Soporte

### Contacto

- **Email**: soporte@condadmin.cl
- **Documentación**: [Wiki del proyecto](https://github.com/usuario/condo-admin-chile/wiki)
- **Issues**: [GitHub Issues](https://github.com/usuario/condo-admin-chile/issues)

### Recursos Adicionales

- [Documentación de Cloudflare Pages](https://developers.cloudflare.com/pages/)
- [Guía de desarrollo web](https://developer.mozilla.org/)
- [Mejores prácticas de responsividad](https://web.dev/responsive-web-design-basics/)

---

**Desarrollado por MiniMax Agent** 🇨🇱
*Optimizado para la realidad chilena de administración de condominios*