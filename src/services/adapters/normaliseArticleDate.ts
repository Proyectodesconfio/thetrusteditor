// services/adapters/normaliseArticleDate.ts

/**
 * Función robusta para normalizar fechas de artículos en varios formatos posibles
 * @param dateStr String de fecha en formato potencialmente variado
 * @returns Date normalizada o null si no se pudo parsear
 */
export const normaliseArticleDate = (dateStr: string): Date | null => {
  // Log para depuración
  console.log(`Intentando normalizar fecha: "${dateStr}"`);
  
  if (!dateStr) {
    console.warn('normaliseArticleDate: Recibió un string vacío o null');
    return null;
  }

  try {
    // Caso 1: Ya es un objeto Date serializado (ISO)
    if (dateStr.includes('T') && (dateStr.includes('Z') || dateStr.includes('+') || dateStr.includes('-'))) {
      const date = new Date(dateStr);
      if (!isNaN(date.getTime())) {
        console.log(`✅ Normalizada como ISO: ${date.toISOString()}`);
        return date;
      }
    }

    // Caso 2: Formato DD/MM/YYYY o DD-MM-YYYY
    if (/^\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4}$/.test(dateStr)) {
      const parts = dateStr.split(/[\/\-]/);
      // Notar que creamos el mes con índice -1 (enero = 0)
      const date = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
      if (!isNaN(date.getTime())) {
        console.log(`✅ Normalizada como DD/MM/YYYY: ${date.toISOString()}`);
        return date;
      }
    }
    
    // Caso 3: Formato YYYY/MM/DD o YYYY-MM-DD
    if (/^\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2}$/.test(dateStr)) {
      const parts = dateStr.split(/[\/\-]/);
      const date = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
      if (!isNaN(date.getTime())) {
        console.log(`✅ Normalizada como YYYY/MM/DD: ${date.toISOString()}`);
        return date;
      }
    }

    // Caso 4: Timestamp en milisegundos o segundos (número)
    if (/^\d+$/.test(dateStr)) {
      let timestamp = parseInt(dateStr);
      // Si el timestamp es en segundos (menos de 13 dígitos), convertir a ms
      if (timestamp < 10000000000) {
        timestamp *= 1000;
      }
      const date = new Date(timestamp);
      if (!isNaN(date.getTime())) {
        console.log(`✅ Normalizada como timestamp: ${date.toISOString()}`);
        return date;
      }
    }

    // Caso 5: Formato en español (ej: "10 de Enero de 2023")
    const spanishMonths = [
      'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
      'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
    ];
    
    const lowerCase = dateStr.toLowerCase();
    for (let i = 0; i < spanishMonths.length; i++) {
      if (lowerCase.includes(spanishMonths[i])) {
        // Intentamos extraer día y año
        const dayMatch = lowerCase.match(/\d{1,2}/);
        const yearMatch = lowerCase.match(/\d{4}/);
        
        if (dayMatch && yearMatch) {
          const day = parseInt(dayMatch[0]);
          const month = i; // Ya tenemos el índice (0-11)
          const year = parseInt(yearMatch[0]);
          
          const date = new Date(year, month, day);
          if (!isNaN(date.getTime())) {
            console.log(`✅ Normalizada como texto español: ${date.toISOString()}`);
            return date;
          }
        }
      }
    }

    // Caso 6: Último intento - dejar que JavaScript lo resuelva
    const date = new Date(dateStr);
    if (!isNaN(date.getTime())) {
      console.log(`✅ Normalizada por JS nativo: ${date.toISOString()}`);
      return date;
    }

    // Si llegamos aquí, no pudimos parsear la fecha
    console.warn(`❌ No se pudo normalizar la fecha: "${dateStr}"`);
    return null;
  } catch (error) {
    console.error(`❌ Error al normalizar fecha "${dateStr}": ${error}`);
    return null;
  }
};