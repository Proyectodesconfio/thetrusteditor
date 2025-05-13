// src/services/adapters/outputAdapter.ts
import { Article } from "../../types";

/**
 * Mapea un objeto de datos crudos de "salida" (generalmente resultados de análisis)
 * a una estructura parcial del tipo Article, enfocándose en los campos de análisis.
 *
 * @param out El objeto de datos crudos de salida para un artículo.
 * @returns Un objeto Partial<Article> con las propiedades de análisis mapeadas.
 */
export function mapOutput(out: any): Partial<Article> {
  // Manejo de la estructura de 'adjectives':
  // Intenta acceder a una propiedad 'adjectives' anidada dentro de 'out.adjectives'.
  // Si no existe, utiliza 'out.adjectives' directamente.
  const adjectivesData = out.adjectives?.adjectives ?? out.adjectives;

  // Manejo similar para la estructura de 'entities'.
  const entitiesData = out.entities?.entities ?? out.entities;

  const mappedOutput = {
    // Resultados del análisis NLP
    adjectives: adjectivesData,
    entities: entitiesData,

    // Métricas calculadas
    metrics: out.metrics,

    // Resultados del análisis de sentimiento
    sentiment: out.sentiment,

    // Lista de citaciones de fuentes identificadas
    sources: out.sources,

    // Estado de revisión del artículo (si está presente en los datos de salida)
    status: out.status,
  };

  return mappedOutput;
}