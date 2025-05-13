// src/services/adapters/loadArticles.ts
import rawInputData from '../../data/lavoz_input_04FEB2025.json';
import rawOutputData from '../../data/lavoz_output_04FEB2025_cleaned.json';
import { Article } from '../../types';
import { mapInput } from './inputAdapter';
import { mapOutput } from './outputAdapter';

// Asegurar que los datos crudos se traten como arrays.
// Esto es útil si TypeScript tiene problemas para inferir el tipo del JSON importado.
const rawInput: any[] = (rawInputData as any)?.default ?? (rawInputData as any[] ?? []);
const rawOutput: any[] = (rawOutputData as any)?.default ?? (rawOutputData as any[] ?? []);

// Verificación en tiempo de ejecución (opcional, podría eliminarse si se confía en los JSON)
// Es más útil durante el desarrollo inicial.
if (!Array.isArray(rawInput)) {
  // Podría ser apropiado lanzar un error aquí o devolver un array vacío
  // dependiendo de cómo se quiera manejar esta situación en la aplicación.
}
if (!Array.isArray(rawOutput)) {
}

// Crear un Map para un acceso eficiente a los datos de 'output' (análisis) por ID.
// Se mapea cada ítem de 'rawOutput' usando 'mapOutput' para transformarlo
// a una estructura parcial de Artículo.
const outputsById = new Map<string, Partial<Article>>(
  // Solo intentar mapear si 'rawOutput' es efectivamente un array.
  Array.isArray(rawOutput) ? rawOutput.map((outputItem: any): [string, Partial<Article>] => {
    // Se asume que cada 'outputItem' tiene una propiedad 'id'.
    // 'mapOutput' debe manejar la estructura de 'outputItem'.
    return [outputItem.id, mapOutput(outputItem)];
  }) : [] // Si 'rawOutput' no es un array, se crea un Map vacío.
);

/**
 * Carga y combina datos de artículos desde las fuentes de entrada (metadatos base)
 * y salida (datos de análisis), produciendo un array de objetos Article completos.
 *
 * @returns Un array de objetos Article listos para ser usados por la aplicación.
 */
export const loadArticles = (): Article[] => {
  // Si los datos de entrada principales no son un array, devolver una lista vacía
  // para evitar errores en el resto de la aplicación.
  if (!Array.isArray(rawInput)) {
    // console.error("loadArticles: rawInput no es un array. Devolviendo lista vacía.");
    return [];
  }

  // Mapear sobre cada ítem de los datos de entrada.
  return rawInput.map((inputItem: any): Article => {
    // 1. Obtener los datos base del artículo usando inputAdapter.
    const baseArticleData = mapInput(inputItem);

    // 2. Obtener los datos de análisis (extra) correspondientes a este artículo desde el Map.
    //    Si no se encuentran datos para el ID, usar un objeto vacío como fallback.
    const extraData = outputsById.get(inputItem.id) ?? {};

    // 3. Combinar los datos base y los datos extra.
    //    Las propiedades de 'extraData' sobrescribirán las de 'baseArticleData' si tienen el mismo nombre.
    const combinedArticle = { ...baseArticleData, ...extraData };

    // 4. Lógica de Prioridad para 'status':
    //    Si el 'status' proveniente de 'extraData' (output JSON) es undefined,
    //    y 'baseArticleData.status' (del input JSON, a través de 'reviewed') sí tiene un valor,
    //    entonces usar el 'status' de 'baseArticleData'.
    //    Esto asegura que si 'reviewed: true' está en el input y no hay 'status' en el output,
    //    el artículo se marque correctamente como 'reviewed'.
    if (extraData.status === undefined && baseArticleData.status !== undefined) {
      combinedArticle.status = baseArticleData.status;
    }

    // 5. Aserción de tipo: Indicar a TypeScript que el objeto resultante es un Article completo.
    //    Es responsabilidad del implementador asegurar que los adaptadores y la combinación
    //    produzcan una estructura que cumpla con la interfaz Article.
    return combinedArticle as Article;
  });
};