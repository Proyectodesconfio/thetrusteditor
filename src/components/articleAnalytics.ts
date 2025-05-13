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
    const totalAuthors = new Set(articles.map(article => article.autor).filter(Boolean)).size;

    // Inicializar contadores para los diferentes estados de revisión.
    let reviewedCount = 0;
    let pendingCount = 0;
    let unreviewedCount = 0;

    articles.forEach(article => {
        // Normalizar el estado para una comparación consistente.
        const status = article.status?.trim().toLowerCase();

        // Clasificación por Estado.
        // Asegúrate de que los strings ('reviewed', 'aprobado', etc.)
        // coincidan con los valores que `inputAdapter` o `outputAdapter` asignan a `article.status`.
        if (status === 'reviewed' || status === 'aprobado') {
            reviewedCount++;
        } else if (status === 'pending' || status === 'pendiente') {
            pendingCount++;
        } else if (status === 'unreviewed' || status === 'sin revisión' || !status) {
            // `!status` cubre null, undefined, y cadena vacía.
            unreviewedCount++;
        } else {
            // Cualquier otro estado no reconocido se cuenta como 'sin revisión'.
            // console.warn(`[calculateMetrics] Estado desconocido: '${status}' en ID: ${article.id}. Contado como 'sin revisión'.`);
            unreviewedCount++;
        }
    });

    return {
        articles: totalArticles,
        authors: totalAuthors,
        reviewed: reviewedCount,
        pending: pendingCount,
        unreviewed: unreviewedCount,
    };
}