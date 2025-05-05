// src/services/adapters/inputAdapter.ts
import { Article } from "../../types";

export function mapInput(raw: any): Partial<Article> {
  // Intenta obtener fecha y hora separadas de 'fecha_hora', si no, usa los campos individuales
  const [fecha, hora] = raw.fecha_hora?.split(',') ?? [raw.fecha, raw.hora];

  return {
    // --- Campos existentes ---
    id: raw.id,
    hora: hora?.trim(), // Usa la hora separada
    link_noticia: raw.link,
    link_foto: raw.link_img,
    autor: raw.autor,
    // Divide raw.seccion para crear 'categorias' (ej: "Deportes / Futbol" -> ["Deportes", "Futbol"])
    categorias: raw.seccion?.split('/')?.map((c: string) => c.trim()) ?? [],
    cuerpo: raw.cuerpo,
    volanta: raw.volanta ?? '', // Usa volanta, si existe
    fecha: fecha?.trim(), // Usa la fecha separada
    fecha_resumen: raw.fecha_hora ?? '', // Mantén el original para resumen si es necesario
    etiquetas: raw.etiquetas ?? [],
    titulo: raw.titulo,
    resumen: raw.subtitulo, // raw.subtitulo parece ser el resumen
    medio: raw.medio ?? 'desconocido', // Asigna un valor por defecto si falta

    // --- ¡LÍNEA AÑADIDA! ---
    // Asigna el valor original de raw.seccion a la propiedad 'seccion' del artículo.
    // Si raw.seccion es null o undefined, 'seccion' también será undefined, lo cual es correcto
    // porque el tipo Article lo define como opcional (seccion?: string).
    seccion: raw.seccion,

  };
}