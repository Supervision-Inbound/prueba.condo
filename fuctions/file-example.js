// Función para obtener/descargar archivos desde R2
// Ubicación: functions/api/files.js

/**
 * Ejemplo de función para obtener archivos desde R2
 * Usar con: GET /api/files?file=nombre-archivo.pdf
 */
export async function onRequest(context) {
  // Solo permitir GET
  if (context.request.method !== 'GET') {
    return new Response('Método no permitido', { status: 405 });
  }

  try {
    // Obtener nombre del archivo desde query params
    const url = new URL(context.request.url);
    const filename = url.searchParams.get('file');

    if (!filename) {
      return new Response(JSON.stringify({
        error: 'Parámetro "file" es requerido'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Obtener archivo desde R2
    const file = await context.env.ADMIN_STORAGE.get(filename);

    if (!file) {
      return new Response(JSON.stringify({
        error: 'Archivo no encontrado',
        filename: filename
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Configurar headers para descarga
    const headers = {
      'Content-Type': file.httpMetadata.contentType || 'application/octet-stream',
      'Content-Disposition': `inline; filename="${filename.split('/').pop()}"`,
      'Cache-Control': 'public, max-age=31536000' // Cache por 1 año
    };

    // Retornar archivo
    return new Response(file.body, { headers });

  } catch (error) {
    return new Response(JSON.stringify({
      error: 'Error al obtener archivo',
      details: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
