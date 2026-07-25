import ImageResizer from 'react-native-image-resizer';
import RNFS from 'react-native-fs'; // Para convertir el archivo temporal a Base64

/**
 * Redimensiona una imagen local y la devuelve codificada como JPEG en base64 (Data URL).
 * Optimizado para rendimiento en hilos nativos de iOS y Android.
 * * @param {Object|string} fileUri - El URI o ruta del archivo generado por la cámara o galería (ej. response.uri).
 * @param {number} maxSide - Tamaño máximo del lado más largo (ancho o alto).
 * @param {number} quality - Calidad de compresión de 0 a 1 (donde 1 es la máxima).
 * @returns {Promise<string>} Imagen comprimida en formato data:image/jpeg;base64,...
 */
export async function resizeImageToDataUrl(fileUri, maxSide = 512, quality = 0.82) {
  // Extrae la ruta limpia del archivo (maneja objetos de librerías de cámara o strings directos)
  const uri = typeof fileUri === 'object' ? fileUri?.uri || fileUri?.path : fileUri;
  
  if (!uri) {
    throw new Error('Ruta de archivo no válida');
  }

  try {
    // 1. Redimensionamiento nativo en segundo plano (Android/iOS)
    // ImageResizer infiere automáticamente si debe alterar ancho o alto para preservar el aspecto
    const response = await ImageResizer.createResizedImage(
      uri,
      maxSide,
      maxSide,
      'JPEG',
      Math.round(quality * 100), // Convierte la calidad a escala de 0-100
      0,                         // Rotación en grados (0 mantiene la original)
      null                       // outputPath null usa el directorio caché por defecto
    );

    // 2. Lee el nuevo archivo temporal comprimido y lo convierte a Base64
    const base64Data = await RNFS.readFile(response.uri, 'base64');
    
    // 3. Retorna el string en el mismo formato Data URL síncrono que usabas en Web
    return `data:image/jpeg;base64,${base64Data}`;

  } catch (error) {
    console.error('[ImageUtils] Error al procesar imagen:', error.message);
    throw new Error('No se pudo procesar la imagen de forma nativa');
  }
}