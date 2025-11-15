#!/usr/bin/env node

/**
 * Deploy Script for ConAdmin Chile
 * Script de despliegue automatizado para Cloudflare Pages
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Iniciando despliegue de ConAdmin Chile...');

// Verificar que estamos en el directorio correcto
if (!fs.existsSync('./index.html')) {
    console.error('❌ Error: No se encontró index.html. Asegúrate de estar en el directorio del proyecto.');
    process.exit(1);
}

// Verificar archivos necesarios
const requiredFiles = [
    'index.html',
    'css/main.css',
    'css/components.css', 
    'css/responsive.css',
    'js/app.js',
    'js/utils.js',
    'js/storage.js',
    'js/components.js',
    'js/sections.js',
    'js/charts.js',
    'package.json',
    'wrangler.toml',
    'README.md'
];

console.log('📋 Verificando archivos necesarios...');
for (const file of requiredFiles) {
    if (!fs.existsSync(file)) {
        console.error(`❌ Error: Falta archivo requerido: ${file}`);
        process.exit(1);
    }
}

console.log('✅ Todos los archivos están presentes');

// Crear directorio de distribución si no existe
const distDir = './dist';
if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
    console.log('📁 Creado directorio dist/');
}

// Copiar archivos al directorio de distribución
console.log('📦 Copiando archivos al directorio de distribución...');
const filesToCopy = [
    'index.html',
    'css/',
    'js/',
    'assets/',
    'package.json',
    'wrangler.toml'
];

filesToCopy.forEach(item => {
    if (fs.existsSync(item)) {
        execSync(`cp -r ${item} ${distDir}/`, { stdio: 'inherit' });
        console.log(`✅ Copiado: ${item}`);
    }
});

// Verificar tamaño del proyecto
const getDirSize = (dirPath) => {
    let size = 0;
    const files = fs.readdirSync(dirPath);
    
    files.forEach(file => {
        const filePath = path.join(dirPath, file);
        const stats = fs.statSync(filePath);
        
        if (stats.isDirectory()) {
            size += getDirSize(filePath);
        } else {
            size += stats.size;
        }
    });
    
    return size;
};

const projectSize = getDirSize('.');
const projectSizeMB = (projectSize / 1024 / 1024).toFixed(2);

console.log(`📊 Tamaño del proyecto: ${projectSizeMB} MB`);

// Crear archivo de versión
const versionInfo = {
    name: 'ConAdmin Chile',
    version: '1.0.0',
    buildDate: new Date().toISOString(),
    size: `${projectSizeMB} MB`,
    deployTarget: 'Cloudflare Pages'
};

fs.writeFileSync('./version.json', JSON.stringify(versionInfo, null, 2));
console.log('📝 Archivo de versión creado');

// Instrucciones de despliegue
console.log('\n🎯 INSTRUCCIONES DE DESPLIEGUE:\n');
console.log('1. MÉTODO 1 - Despliegue desde GitHub:');
console.log('   • Sube este código a un repositorio de GitHub');
console.log('   • Ve a https://pages.cloudflare.com/');
console.log('   • Conecta tu repositorio');
console.log('   • Configura:');
console.log('     - Build command: echo "No build step required"');
console.log('     - Build output directory: /');
console.log('   • Haz clic en "Save and Deploy"');
console.log('');

console.log('2. MÉTODO 2 - Despliegue manual:');
console.log('   • Comprime todos los archivos del proyecto');
console.log('   • Ve a https://pages.cloudflare.com/');
console.log('   • Selecciona "Upload assets"');
console.log('   • Sube el ZIP con todos los archivos');
console.log('   • Asigna un nombre al proyecto');
console.log('');

console.log('3. CONFIGURACIÓN ADICIONAL:');
console.log('   • Dominio personalizado (opcional)');
console.log('   • Variables de entorno (no requeridas para esta app)');
console.log('   • SSL automático (incluido en Cloudflare)');
console.log('');

console.log('🔗 RECURSOS ÚTILES:');
console.log('   • Documentación: https://developers.cloudflare.com/pages/');
console.log('   • Panel de control: https://dash.cloudflare.com/');
console.log('   • Soporte: https://support.cloudflare.com/');
console.log('');

// Verificar si wrangler está instalado
try {
    execSync('wrangler --version', { stdio: 'ignore' });
    console.log('🛠️  Wrangler CLI detectado - puedes usar:');
    console.log('   wrangler pages deploy dist/ --project-name=condo-admin-chile');
    console.log('');
} catch (error) {
    console.log('💡 Para instalar Wrangler CLI:');
    console.log('   npm install -g wrangler');
    console.log('');
}

console.log('🎉 ¡Preparado para despliegue!');
console.log('📚 Lee el README.md para más información detallada.');
console.log('🐛 Si encuentras problemas, revisa la sección de solución de problemas en el README.');

// Hacer el archivo ejecutable en sistemas Unix
try {
    fs.chmodSync(__filename, '755');
} catch (error) {
    // Ignorar errores de chmod en Windows
}

console.log('\n✅ Script completado exitosamente');