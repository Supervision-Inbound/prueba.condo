#!/bin/bash

# Script de Despliegue a GitHub Pages
# ConAdmin Chile - Sistema de Administración de Condominios

echo "🏢 ConAdmin Chile - Script de Despliegue"
echo "=========================================="

# Verificar si git está instalado
if ! command -v git &> /dev/null; then
    echo "❌ Git no está instalado. Por favor instale Git primero."
    exit 1
fi

# Verificar si estamos en el directorio correcto
if [ ! -f "index.html" ]; then
    echo "❌ No se encontró index.html. Asegúrese de estar en el directorio del proyecto."
    exit 1
fi

# Preguntar por la URL del repositorio
read -p "🔗 Ingrese la URL de su repositorio de GitHub (ej: https://github.com/usuario/condo-admin-chile.git): " REPO_URL

if [ -z "$REPO_URL" ]; then
    echo "❌ Debe proporcionar una URL de repositorio."
    exit 1
fi

# Inicializar git si no está inicializado
if [ ! -d ".git" ]; then
    echo "📁 Inicializando repositorio Git..."
    git init
fi

# Añadir todos los archivos
echo "📄 Añadiendo archivos al repositorio..."
git add .

# Hacer commit
echo "💾 Creando commit inicial..."
git commit -m "Initial commit: ConAdmin Chile - Sistema de Administración de Condominios"

# Configurar branch principal
git branch -M main

# Añadir remote si no existe
if ! git remote get-url origin &> /dev/null; then
    echo "🔗 Configurando repositorio remoto..."
    git remote add origin "$REPO_URL"
fi

# Actualizar URL del remote si es necesario
git remote set-url origin "$REPO_URL"

# Subir a GitHub
echo "🚀 Subiendo a GitHub..."
if git push -u origin main; then
    echo "✅ ¡Éxito! Código subido a GitHub"
    echo ""
    echo "📋 Próximos pasos:"
    echo "1. Vaya a su repositorio en GitHub"
    echo "2. Ir a Settings > Pages"
    echo "3. En 'Source', seleccione 'Deploy from a branch'"
    echo "4. En 'Branch', seleccione 'main' y '/ (root)'"
    echo "5. Guardar configuración"
    echo ""
    echo "🔗 Su sitio estará disponible en:"
    echo "   https://$(echo $REPO_URL | sed 's/.*github\.com\///; s/\.git$//')/"
    echo ""
    echo "🔑 Credenciales de acceso:"
    echo "   Usuario: admin"
    echo "   Contraseña: condo123"
    echo ""
    echo "⚠️  IMPORTANTE: Cambie las credenciales por defecto después del primer acceso"
else
    echo "❌ Error al subir a GitHub. Verifique sus credenciales y permisos."
    exit 1
fi

echo "🎉 ¡Despliegue completado!"