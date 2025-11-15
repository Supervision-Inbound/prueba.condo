# 🌟 Guía Rápida: Desplegar en GitHub Pages

## ✅ Requisitos
- Cuenta de GitHub
- Git instalado en tu computadora
- Proyecto ConAdmin Chile

## 🚀 Proceso de 3 Pasos

### 1️⃣ Preparar el Repositorio

```bash
# Navegar al directorio del proyecto
cd condo-admin-chile

# Inicializar Git
git init

# Añadir todos los archivos
git add .

# Crear el commit inicial
git commit -m "Initial commit: ConAdmin Chile"
```

### 2️⃣ Crear Repositorio en GitHub

1. **Ir a GitHub**: https://github.com/new
2. **Llenar el formulario**:
   - Repository name: `condo-admin-chile`
   - Description: `Sistema de administración de condominios para Chile`
   - ✅ Public (requerido para GitHub Pages gratis)
   - ❌ No marcar "Add a README file"
   - ❌ No marcar "Add .gitignore"
   - ❌ No seleccionar license

3. **Crear repositorio**

### 3️⃣ Conectar y Subir

```bash
# Reemplazar USUARIO con tu nombre de usuario de GitHub
git remote add origin https://github.com/USUARIO/condo-admin-chile.git

# Configurar branch principal
git branch -M main

# Subir al repositorio
git push -u origin main
```

## ⚙️ Activar GitHub Pages

1. **Ir a tu repositorio**: https://github.com/USUARIO/condo-admin-chile
2. **Configurar Pages**: Clic en `Settings` → `Pages`
3. **Seleccionar fuente**:
   - Source: `Deploy from a branch`
   - Branch: `main`
   - Folder: `/ (root)`
4. **Guardar**: Clic en "Save"

## 🔗 Tu Sitio Está Listo

Después de 5-10 minutos, tu sitio estará disponible en:
```
https://USUARIO.github.io/condo-admin-chile/
```

## 🔑 Acceso a la Aplicación

- **Usuario**: `admin`
- **Contraseña**: `condo123`

## 🛠️ Actualizar el Sitio

Para hacer cambios:

```bash
# Hacer tus cambios en los archivos

# Añadir cambios
git add .

# Commit con descripción
git commit -m "Descripción de los cambios"

# Subir cambios
git push
```

Los cambios aparecerán en tu sitio después de 2-3 minutos.

## 🔧 Personalización (Opcional)

### Cambiar el Nombre del Repositorio
1. Settings → General → Rename
2. El nombre puede ser cualquier cosa (ej: `mi-condominio`)
3. Actualizar la URL en el script de despliegue

### Dominio Personalizado
1. Settings → Pages → Custom domain
2. Añadir tu dominio personalizado
3. Configurar DNS para apuntar a GitHub Pages

## ⚠️ Limitaciones Conocidas

- **Archivos grandes**: Límite de 1GB por repositorio
- **Banda ancha**: 100GB por mes en plan gratuito
- **Builds**: Sin build automático, archivos estáticos únicamente

## 🎯 Script Automático (Linux/Mac)

```bash
# Hacer ejecutable
chmod +x deploy-github.sh

# Ejecutar
./deploy-github.sh
```

## 🎯 Script Automático (Windows)

```cmd
# Ejecutar
deploy-github.bat
```

## ✅ Verificar Despliegue

1. **Ir a**: https://github.com/USUARIO/condo-admin-chile/deployments
2. **Verificar**: Status debe ser "Success"
3. **Visitar**: https://USUARIO.github.io/condo-admin-chile/
4. **Login**: admin / condo123

## 🆘 Problemas Comunes

### Error: "Repository not found"
- Verificar URL del remote: `git remote -v`
- Verificar permisos del repositorio
- Verificar que el repositorio sea público

### Error: "Permission denied"
- Configurar SSH keys o usar token personal
- Verificar que tienes permisos de escritura

### Sitio no aparece
- Esperar 10-15 minutos después del despliegue
- Verificar que la branch esté configurada correctamente
- Revisar Settings → Pages para ver errores

## 🎉 ¡Listo!

Tu sistema de administración de condominios está funcionando en GitHub Pages.

**¿Necesitas más ayuda?** Revisa la documentación completa en README.md