@echo off
chcp 65001 >nul
cls

echo 🏢 ConAdmin Chile - Script de Despliegue (Windows)
echo ============================================

REM Verificar si git está instalado
git --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Git no está instalado. Por favor instale Git primero.
    pause
    exit /b 1
)

REM Verificar si estamos en el directorio correcto
if not exist "index.html" (
    echo ❌ No se encontró index.html. Asegúrese de estar en el directorio del proyecto.
    pause
    exit /b 1
)

REM Preguntar por la URL del repositorio
set /p REPO_URL=🔗 Ingrese la URL de su repositorio de GitHub (ej: https://github.com/usuario/condo-admin-chile.git): 

if "%REPO_URL%"=="" (
    echo ❌ Debe proporcionar una URL de repositorio.
    pause
    exit /b 1
)

REM Inicializar git si no está inicializado
if not exist ".git" (
    echo 📁 Inicializando repositorio Git...
    git init
)

REM Añadir todos los archivos
echo 📄 Añadiendo archivos al repositorio...
git add .

REM Hacer commit
echo 💾 Creando commit inicial...
git commit -m "Initial commit: ConAdmin Chile - Sistema de Administración de Condominios"

REM Configurar branch principal
git branch -M main

REM Añadir remote si no existe
git remote get-url origin >nul 2>&1
if %errorlevel% neq 0 (
    echo 🔗 Configurando repositorio remoto...
    git remote add origin "%REPO_URL%"
) else (
    echo 🔗 Actualizando URL del repositorio remoto...
    git remote set-url origin "%REPO_URL%"
)

REM Subir a GitHub
echo 🚀 Subiendo a GitHub...
git push -u origin main
if %errorlevel% equ 0 (
    echo ✅ ¡Éxito! Código subido a GitHub
    echo.
    echo 📋 Próximos pasos:
    echo 1. Vaya a su repositorio en GitHub
    echo 2. Ir a Settings ^> Pages
    echo 3. En 'Source', seleccione 'Deploy from a branch'
    echo 4. En 'Branch', seleccione 'main' y '/ (root)'
    echo 5. Guardar configuración
    echo.
    echo 🔗 Su sitio estará disponible en:
    for /f "tokens=4" %%a in ("%REPO_URL%") do echo    https://%%a/
    echo.
    echo 🔑 Credenciales de acceso:
    echo    Usuario: admin
    echo    Contraseña: condo123
    echo.
    echo ⚠️  IMPORTANTE: Cambie las credenciales por defecto después del primer acceso
) else (
    echo ❌ Error al subir a GitHub. Verifique sus credenciales y permisos.
    pause
    exit /b 1
)

echo 🎉 ¡Despliegue completado!
pause