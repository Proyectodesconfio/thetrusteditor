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
  // Esto permite flexibilidad si la estructura de entrada para 'adjectives' varía.
  const adjectivesData = out.adjectives?.adjectives ?? out.adjectives;

  // Manejo similar para la estructura de 'entities'.
  const entitiesData = out.entities?.entities ?? out.entities;

  return {
    // Resultados del análisis NLP (Procesamiento de Lenguaje Natural)
    adjectives: adjectivesData, // Datos detallados de adjetivos (frecuencia, lista)
    entities: entitiesData,     // Datos detallados de entidades (frecuencia, lista)

    // Métricas calculadas para el artículo
    metrics: out.metrics,

    // Resultados del análisis de sentimiento
    sentiment: out.sentiment,

    // Lista de citaciones de fuentes identificadas en el texto del artículo
    sources: out.sources, // Nota: Este 'sources' es el array de SourceCitation

    // Estado de revisión del artículo
    status: out.status,
  };
}