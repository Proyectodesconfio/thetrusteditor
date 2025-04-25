import { Article } from "../../types";

export function mapInput(raw: any): Partial<Article> {
  const [fecha, hora] = raw.fecha_hora?.split(',') ?? [raw.fecha, raw.hora];
  return {
    id: raw.id,
    hora: hora?.trim(),
    link_noticia: raw.link,
    link_foto: raw.link_img,
    autor: raw.autor,
    categorias: raw.seccion?.split('/')?.map((c: string) => c.trim()) ?? [],
    cuerpo: raw.cuerpo,
    volanta: raw.volanta ?? '',
    fecha: fecha?.trim(),
    fecha_resumen: raw.fecha_hora ?? '',
    etiquetas: raw.etiquetas ?? [],
    titulo: raw.titulo,
    resumen: raw.subtitulo,
    medio: raw.medio ?? 'desconocido',
  };
}