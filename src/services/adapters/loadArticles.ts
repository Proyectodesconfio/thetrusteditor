// src/services/adapters/loadArticles.ts
import rawInputModule from '../../data/lavoz_input_04FEB2025.json';
import rawOutputModule from '../../data/lavoz_output_04FEB2025_cleaned.json';
import { Article } from '../../types';
import { mapInput } from './inputAdapter';
import { mapOutput } from './outputAdapter';

// --- Asegurar Tipos de Datos Crudos ---
// Hacemos una aserción de tipo más fuerte.
// Esto asume que los módulos JSON exportan un objeto que,
// en su propiedad 'default' (común con esModuleInterop) o directamente,
// contiene el array de datos.
// Si los JSON son directamente arrays, la primera opción debería funcionar.
const rawInput: any[] = (rawInputModule as any).default || (rawInputModule as any[]);
const rawOutput: any[] = (rawOutputModule as any).default || (rawOutputModule as any[]);

// Verificar si realmente son arrays después de la aserción (para depuración)
if (!Array.isArray(rawInput)) {
  console.error("Error: rawInput no es un array. Contenido:", rawInputModule);
  // Podrías lanzar un error o devolver un array vacío para evitar que la app crashee.
  // throw new Error("rawInput no es un array");
}
if (!Array.isArray(rawOutput)) {
  console.error("Error: rawOutput no es un array. Contenido:", rawOutputModule);
  // throw new Error("rawOutput no es un array");
}


// --- Procesamiento de Datos de Salida (Análisis) ---
const outputsById = new Map<string, Partial<Article>>(
  // Solo mapear si rawOutput es un array
  Array.isArray(rawOutput) ? rawOutput.map((outputItem: any): [string, Partial<Article>] => {
    return [outputItem.id, mapOutput(outputItem)];
  }) : [] // Si no es un array, pasar un array vacío para que el Map se cree vacío
);

// --- Función Principal de Carga y Combinación ---
export const loadArticles = (): Article[] => {
  // Solo mapear si rawInput es un array
  if (!Array.isArray(rawInput)) {
    console.error("loadArticles: rawInput no es un array, devolviendo lista vacía.");
    return []; // Devolver un array vacío si los datos de entrada no son un array
  }

  return rawInput.map((inputItem: any): Article => {
    const baseArticleData = mapInput(inputItem);
    const extraData = outputsById.get(inputItem.id) ?? {};
    const combinedArticle = { ...baseArticleData, ...extraData };
    return combinedArticle as Article;
  });
};