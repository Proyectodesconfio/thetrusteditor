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

  // --- Determinar el valor para 'status' basado en 'raw.reviewed' y/o 'raw.status' ---
  let articleStatus: string | undefined = undefined;

  if (typeof raw.status === 'string' && raw.status.trim() !== '') {
    // Si existe un campo 'status' como string en el input y no está vacío, usarlo.
    articleStatus = raw.status.trim().toLowerCase();
  } else if (typeof raw.reviewed === 'boolean') {
    // Si no hay 'status' string, pero sí 'reviewed' booleano, convertirlo.
    // Los strings "reviewed" y "unreviewed" deben coincidir con los esperados
    // en calculateMetrics y getStatusDisplay.
    articleStatus = raw.reviewed ? 'reviewed' : 'unreviewed';
  }
  // Si ninguno de los dos campos está presente o 'raw.reviewed' no es booleano,
  // 'articleStatus' permanecerá undefined, y la lógica de 'sin revisión' en otros módulos lo tomará.

  const mappedArticle = {
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
    fecha: fechaOriginal?.trim(),
    hora: horaOriginal?.trim(),
    fecha_resumen: raw.fecha_hora ?? '',

    // --- Clasificación ---
    categorias: raw.seccion?.split('/')?.map((c: string) => c.trim()).filter(Boolean) ?? [],
    seccion: raw.seccion, // Puede ser undefined
    etiquetas: raw.etiquetas ?? [],
    medio: raw.medio ?? 'desconocido',

    // --- Estado de Revisión ---
    status: articleStatus, // Asignar el estado procesado
  };

  return mappedArticle;
}