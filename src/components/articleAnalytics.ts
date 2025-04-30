// src/components/articleAnalytics.ts
import { Article, GlobalMetrics } from '../types'; // Importar Article y el tipo GlobalMetrics

/**
 * Calculates global summary statistics for a given list of articles,
 * including counts for different review statuses.
 *
 * @param articles - An array of Article objects to analyze.
 * @returns A GlobalMetrics object containing the calculated statistics.
 */
// Modificar la firma de la función para que devuelva GlobalMetrics
export function calculateMetrics(articles: Article[]): GlobalMetrics {
    const totalArticles = articles.length;
    // Contar autores únicos, asegurándose de filtrar valores vacíos/nulos si es necesario
    const totalAuthors = new Set(articles.map(article => article.autor).filter(Boolean)).size;
    // Calcular contadores de estado
    let reviewedCount = 0;
    let pendingCount = 0;
    let unreviewedCount = 0;

    articles.forEach(article => {
        // Normalizar el estado para comparación consistente: quitar espacios, minúsculas, default si es nulo/undefined
        const status = article.status?.trim().toLowerCase();

        // *** ¡IMPORTANTE! AJUSTA ESTOS STRINGS EXACTOS SEGÚN TUS DATOS ***
        // Compara el estado normalizado con los valores esperados
        if (status === 'reviewed' || status === 'aprobado') { // ¿Usas 'reviewed' o 'aprobado' en tus datos?
            reviewedCount++;
        } else if (status === 'pending' || status === 'pendiente') { // ¿Usas 'pending' o 'pendiente'?
            pendingCount++;
        // Define cómo quieres contar "Sin revisión". Aquí contamos undefined, null, '', 'unreviewed', 'sin revisión'.
        } else if (status === 'unreviewed' || status === 'sin revisión' || !status) {
             unreviewedCount++;
        // ¿Tienes otros estados como 'revisar'/'flagged' que deban contarse diferente o como 'unreviewed'?
        // else if (status === 'flagged' || status === 'revisar') { /* no contar o contar diferente? */ }
        } else {
            // Por defecto, cualquier otro estado desconocido se cuenta como 'unreviewed'
            // console.warn(`Estado desconocido en calculateMetrics: '${status}'`); // Log opcional para desarrollo
            unreviewedCount++;
        }
    });

    // Devolver el objeto que coincide con la interfaz GlobalMetrics
    return {
        articles: totalArticles,     // Usar la clave 'articles' según GlobalMetrics
        authors: totalAuthors,       // Usar la clave 'authors' según GlobalMetrics
        reviewed: reviewedCount,     // Añadir contador de revisados
        pending: pendingCount,       // Añadir contador de pendientes
        unreviewed: unreviewedCount, // Añadir contador de sin revisión
    };
}

// Nota: totalCategories se eliminó porque no está en la interfaz GlobalMetrics estándar
// Si lo necesitas, deberías añadirlo a la interfaz GlobalMetrics en types/index.ts
// y añadir `totalCategories: new Set(articles.flatMap(article => article.categorias)).size,`
// al objeto de retorno arriba.
