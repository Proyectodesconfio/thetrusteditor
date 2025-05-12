// src/components/articleAnalytics.ts
import { Article, GlobalMetrics } from '../types'; // Importar los tipos necesarios

/**
 * Calcula estadísticas globales resumidas para una lista dada de artículos.
 * Esto incluye el número total de artículos, autores únicos, y conteos
 * de artículos según su estado de revisión (revisado, pendiente, sin revisión).
 *
 * @param articles - Un array de objetos Article para analizar.
 * @returns Un objeto GlobalMetrics que contiene las estadísticas calculadas.
 */
export function calculateMetrics(articles: Article[]): GlobalMetrics {
    const totalArticles = articles.length;

    // Contar autores únicos.
    // Se mapean los autores, se filtran los valores falsy (null, undefined, ""),
    // y luego se usa un Set para obtener solo los únicos, y .size para el conteo.
    const totalAuthors = new Set(articles.map(article => article.autor).filter(Boolean)).size;

    // Inicializar contadores para los diferentes estados de revisión.
    let reviewedCount = 0;
    let pendingCount = 0;
    let unreviewedCount = 0;

    articles.forEach(article => {
        // Normalizar el estado para una comparación consistente:
        // - Quitar espacios al inicio/final (trim)
        // - Convertir a minúsculas (toLowerCase)
        // - Si el estado es null, undefined o una cadena vacía después del trim, se considera 'sin revisión' por defecto.
        const status = article.status?.trim().toLowerCase();

        // --- Clasificación por Estado ---
        // ¡IMPORTANTE! Asegúrate de que los strings de estado ('reviewed', 'aprobado', etc.)
        // coincidan exactamente con los valores presentes en tus datos.
        if (status === 'reviewed' || status === 'aprobado') {
            reviewedCount++;
        } else if (status === 'pending' || status === 'pendiente') {
            pendingCount++;
        } else if (status === 'unreviewed' || status === 'sin revisión' || !status) {
            // Considera como "sin revisión" los estados explícitos 'unreviewed', 'sin revisión',
            // o si el estado es falsy (null, undefined, cadena vacía).
            unreviewedCount++;
        // Opcional: Manejar otros estados específicos si existen (ej. 'flagged', 'revisar').
        // else if (status === 'flagged' || status === 'revisar') {
        //   // Decidir si contarlos como pendientes, sin revisión, o una nueva categoría.
        //   pendingCount++; // Ejemplo: contar 'flagged' como pendiente
        // }
        } else {
            // Cualquier otro estado no reconocido se cuenta como 'sin revisión' por defecto.
            // Descomentar para depuración si se sospecha de estados inesperados:
            // console.warn(`[calculateMetrics] Estado desconocido encontrado: '${status}' en artículo ID: ${article.id}. Contado como 'sin revisión'.`);
            unreviewedCount++;
        }
    });

    // Devolver el objeto de métricas globales, asegurando que las claves coincidan
    // con la interfaz GlobalMetrics definida en src/types/index.ts.
    return {
        articles: totalArticles,
        authors: totalAuthors,
        reviewed: reviewedCount,
        pending: pendingCount,
        unreviewed: unreviewedCount,
    };
}