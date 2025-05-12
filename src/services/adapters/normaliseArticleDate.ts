// services/adapters/normaliseArticleDate.ts

/**
 * Intenta normalizar una cadena de fecha en varios formatos posibles a un objeto Date de JavaScript.
 * Prioriza formatos específicos y recurre a métodos más generales si es necesario.
 *
 * @param dateStr La cadena de texto que representa la fecha.
 * @returns Un objeto Date si la normalización es exitosa, o null en caso contrario.
 */
export const normaliseArticleDate = (dateString: string | undefined | null): Date | null => {
  // Descomentar para depuración detallada del proceso de normalización:
  // console.log(`[normaliseArticleDate] Intentando normalizar: "${dateString}"`);

  if (!dateString || typeof dateString !== 'string' || dateString.trim() === '') {
    // console.warn('[normaliseArticleDate] Recibió una cadena de fecha inválida o vacía.');
    return null;
  }

  const trimmedDateStr = dateString.trim();

  try {
    // Caso 1: Formato ISO 8601 (ej: "2023-10-26T10:00:00.000Z" o "2023-10-26T12:00:00+02:00")
    // La 'T' es un buen indicador, junto con 'Z' (UTC) o un offset de timezone (+HH:MM o -HH:MM).
    if (trimmedDateStr.includes('T') && (trimmedDateStr.includes('Z') || /[\+\-]\d{2}:\d{2}$/.test(trimmedDateStr))) {
      const date = new Date(trimmedDateStr);
      if (!isNaN(date.getTime())) {
        // console.log(`[normaliseArticleDate] ✅ Normalizada como ISO: ${date.toISOString()}`);
        return date;
      }
    }

    // Caso 2: Formato DD/MM/YYYY o DD-MM-YYYY (Día primero)
    // Regex: 1 o 2 dígitos para día, separador, 1 o 2 para mes, separador, 4 para año.
    if (/^\d{1,2}[/\-]\d{1,2}[/\-]\d{4}$/.test(trimmedDateStr)) {
      const parts = trimmedDateStr.split(/[/\-]/);
      // new Date(año, mesIndex (0-11), día)
      const date = new Date(parseInt(parts[2], 10), parseInt(parts[1], 10) - 1, parseInt(parts[0], 10));
      if (!isNaN(date.getTime()) && date.getFullYear() === parseInt(parts[2], 10) && (date.getMonth() + 1) === parseInt(parts[1], 10)) { // Verificación adicional
        // console.log(`[normaliseArticleDate] ✅ Normalizada como DD/MM/YYYY: ${date.toISOString()}`);
        return date;
      }
    }

    // Caso 3: Formato YYYY/MM/DD o YYYY-MM-DD (Año primero)
    // Regex: 4 dígitos para año, separador, 1 o 2 para mes, separador, 1 o 2 para día.
    if (/^\d{4}[/\-]\d{1,2}[/\-]\d{1,2}$/.test(trimmedDateStr)) {
      const parts = trimmedDateStr.split(/[/\-]/);
      const date = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
      if (!isNaN(date.getTime()) && date.getFullYear() === parseInt(parts[0], 10) && (date.getMonth() + 1) === parseInt(parts[1], 10)) { // Verificación adicional
        // console.log(`[normaliseArticleDate] ✅ Normalizada como YYYY/MM/DD: ${date.toISOString()}`);
        return date;
      }
    }

    // Caso 4: Formato textual en español (ej: "10 de enero de 2023", "10 Enero 2023")
    // Este caso es más propenso a errores y podría mejorarse con una librería si fuera necesario.
    const spanishMonths: Record<string, number> = {
      'enero': 0, 'febrero': 1, 'marzo': 2, 'abril': 3, 'mayo': 4, 'junio': 5,
      'julio': 6, 'agosto': 7, 'septiembre': 8, 'octubre': 9, 'noviembre': 10, 'diciembre': 11
    };
    const lowerCaseStr = trimmedDateStr.toLowerCase();
    // Regex para extraer día, mes (texto) y año. Ej: "10 de enero de 2023"
    const spanishDateMatch = lowerCaseStr.match(/(\d{1,2})(?:\s+de\s+|\s+)(\w+)(?:\s+de\s+|\s+)(\d{4})/);

    if (spanishDateMatch) {
      const day = parseInt(spanishDateMatch[1], 10);
      const monthName = spanishDateMatch[2];
      const year = parseInt(spanishDateMatch[3], 10);
      const monthIndex = spanishMonths[monthName];

      if (typeof monthIndex === 'number') { // Asegurarse de que el mes se reconoció
        const date = new Date(year, monthIndex, day);
        if (!isNaN(date.getTime()) && date.getFullYear() === year && date.getMonth() === monthIndex && date.getDate() === day) {
          // console.log(`[normaliseArticleDate] ✅ Normalizada como texto en español: ${date.toISOString()}`);
          return date;
        }
      }
    }

    // Caso 5: Timestamp numérico (en segundos o milisegundos)
    if (/^\d+$/.test(trimmedDateStr)) {
      let timestamp = parseInt(trimmedDateStr, 10);
      // Heurística: si el timestamp tiene menos de 11 dígitos, probablemente esté en segundos.
      // (Un timestamp de 11 dígitos en ms es ~1970, uno de 10 en ms es ~1970, uno de 10 en s es ~2001)
      // Un timestamp de JS en ms es típicamente de 13 dígitos.
      if (String(timestamp).length <= 10) { // Considerar que son segundos
        timestamp *= 1000; // Convertir a milisegundos
      }
      const date = new Date(timestamp);
      if (!isNaN(date.getTime())) {
        // console.log(`[normaliseArticleDate] ✅ Normalizada como timestamp: ${date.toISOString()}`);
        return date;
      }
    }

    // Caso 6: Último intento - parseo nativo de JavaScript.
    // Esto es menos fiable para formatos ambiguos pero puede capturar algunos casos más.
    const nativeDate = new Date(trimmedDateStr);
    if (!isNaN(nativeDate.getTime())) {
      // console.log(`[normaliseArticleDate] ✅ Normalizada por JS nativo: ${nativeDate.toISOString()}`);
      return nativeDate;
    }

    // Si ningún método funcionó, se devuelve null.
    // console.warn(`[normaliseArticleDate] ❌ No se pudo normalizar la fecha: "${trimmedDateStr}"`);
    return null;
  } catch (error) {
    // console.error(`[normaliseArticleDate] ❌ Error al procesar la fecha "${trimmedDateStr}":`, error);
    return null;
  }
};