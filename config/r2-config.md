# Cloudflare R2 Configuration

## Configuración del Bucket R2

### 1. Crear Bucket R2

1. **En el dashboard de Cloudflare**:
   - Ir a R2 Object Storage
   - Crear un nuevo bucket llamado: `admin-condo`
   - Configurar permisos de acceso público

### 2. Configuración de CORS

Añadir la siguiente configuración de CORS en el bucket:

```json
[
  {
    "AllowedOrigins": ["https://tu-dominio.com", "https://admin-condo.pages.dev"],
    "AllowedMethods": ["GET", "POST", "PUT", "DELETE"],
    "AllowedHeaders": ["*"],
    "MaxAgeSeconds": 300
  }
]
```

### 3. Configuración de la Aplicación

Para usar R2 en tu aplicación, añade estas configuraciones:

#### Variables de Entorno (Cloudflare Pages)

```
R2_BUCKET_NAME=admin-condo
R2_ACCESS_KEY_ID=tu_access_key
R2_SECRET_ACCESS_KEY=tu_secret_key
R2_ENDPOINT=https://<account_id>.r2.cloudflarestorage.com
```

#### Uso en JavaScript

```javascript
// Ejemplo de uso para subir archivos
async function uploadToR2(file, key) {
    const formData = new FormData();
    formData.append('file', file);
    
    // Esta funcionalidad se implementaría en un Worker de Cloudflare
    const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
        headers: {
            'X-Key': key
        }
    });
    
    return response.json();
}
```

### 4. Configuración del Worker (Opcional)

Si necesitas un Worker para manejar las operaciones de R2:

```javascript
export default {
    async fetch(request, env) {
        const url = new URL(request.url);
        
        if (url.pathname.startsWith('/api/upload')) {
            return handleUpload(request, env);
        }
        
        return new Response('Not Found', { status: 404 });
    }
};

async function handleUpload(request, env) {
    const formData = await request.formData();
    const file = formData.get('file');
    const key = request.headers.get('X-Key') || 'default-key';
    
    if (!file) {
        return new Response('No file provided', { status: 400 });
    }
    
    // Subir a R2
    await env.R2_BUCKET.put(key, file);
    
    return new Response(JSON.stringify({ 
        success: true, 
        key: key,
        url: `https://<domain>/${key}`
    }), {
        headers: { 'Content-Type': 'application/json' }
    });
}
```

### 5. Seguridad

- Configurar políticas de acceso restrictivas
- Usar tokens de acceso temporales
- Implementar validación de archivos
- Configurar límites de tamaño de archivo

### 6. Monitoreo

- Revisar métricas de almacenamiento
- Configurar alertas de costos
- Monitorear tráfico de API