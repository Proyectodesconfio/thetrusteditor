// src/services/adapters/inputAdapter.ts
import { Article } from "../../types";

/**
 * Mapea un objeto de datos crudos (proveniente del JSON de entrada)
 * a una estructura parcial del tipo Article, enfocándose en los metadatos base.
 *
 * @param raw El objeto de datos crudos de un artículo.
 * @returns Un objeto Partial<Article> con las propiedades mapeadas.
 */
export function mapInput(raw: any): Partial<Article> {
  // Intenta obtener fecha y hora separadas del campo 'fecha_hora'.
  // Si 'fecha_hora' no está disponible, utiliza los campos 'fecha' y 'hora' individuales como alternativa.
  const [fechaOriginal, horaOriginal] = raw.fecha_hora?.split(',') ?? [raw.fecha, raw.hora];

  return {
    // --- Identificación y Enlaces ---
    id: raw.id,
    link_noticia: raw.link,
    link_foto: raw.link_img, // Puede ser undefined si no hay link_img

    // --- Autoría y Contenido ---
    autor: raw.autor,       // Puede ser undefined
    titulo: raw.titulo,
    volanta: raw.volanta ?? '', // Usa string vacío si volanta es null/undefined
    cuerpo: raw.cuerpo,
    resumen: raw.subtitulo, // Se asume que 'subtitulo' es el campo para el resumen

    // --- Fechas y Horas ---
    // Usa la fecha procesada; trim() elimina espacios extra.
    fecha: fechaOriginal?.trim(),
    // Usa la hora procesada; trim() elimina espacios extra.
    hora: horaOriginal?.trim(),
    // Mantiene el campo 'fecha_hora' original si es necesario para alguna visualización o referencia.
    fecha_resumen: raw.fecha_hora ?? '',

    // --- Clasificación ---
    // Convierte la cadena de sección (ej. "Deportes / Fútbol") en un array de categorías.
    // Si raw.seccion es null/undefined, devuelve un array vacío.
    categorias: raw.seccion?.split('/')?.map((c: string) => c.trim()) ?? [],
    // Asigna la cadena original de 'seccion' a la propiedad 'seccion' del artículo.
    seccion: raw.seccion, // Puede ser undefined
    etiquetas: raw.etiquetas ?? [], // Usa array vacío si etiquetas es null/undefined
    medio: raw.medio ?? 'desconocido', // Valor por defecto si 'medio' no está presente
  };
}