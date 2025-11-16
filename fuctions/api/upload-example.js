// Función de ejemplo para manejo de archivos R2
// Ubicación: functions/api/upload.js

/**
 * Ejemplo de función para subir documentos a R2
 * Usar con: POST /api/upload
 */
export async function onRequest(context) {
  // Verificar método
  if (context.request.method !== 'POST') {
    return new Response('Método no permitido', { status: 405 });
  }

  try {
    // Obtener datos del formulario
    const formData = await context.request.formData();
    const file = formData.get('file');
    const category = formData.get('category') || 'general';
    const residentId = formData.get('residentId') || 'general';

    if (!file) {
      return new Response(JSON.stringify({
        error: 'No se encontró archivo'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Validar tipo de archivo
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      return new Response(JSON.stringify({
        error: 'Tipo de archivo no permitido. Use PDF, JPEG o PNG'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Crear nombre único para el archivo
    const timestamp = Date.now();
    const filename = `${category}/${residentId}/${timestamp}-${file.name}`;
    
    // Subir a R2
    await context.env.ADMIN_STORAGE.put(filename, file);

    // Respuesta exitosa
    return new Response(JSON.stringify({
      success: true,
      message: 'Archivo subido correctamente',
      filename: filename,
      url: `/api/files?file=${encodeURIComponent(filename)}`
    }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    return new Response(JSON.stringify({
      error: 'Error al subir archivo',
      details: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}