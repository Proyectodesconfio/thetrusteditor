// src/types/index.ts

// --- Tipos de Análisis de Sentimiento ---

/**
 * Representa los resultados del análisis de sentimiento para un fragmento de texto específico (como una oración o título).
 */
interface SentimentScore {
  label: 'POS' | 'NEU' | 'NEG';
  scores: {
    NEG: number;
    NEU: number;
    POS: number;
  };
}

/**
 * Representa la oración con la puntuación más alta para una etiqueta de sentimiento específica.
 */
export interface HighestScoringSentence {
  score: number;
  start_char: number;
  end_char: number;
  sentence: string;
}

/**
 * Representa los resultados completos del análisis de sentimiento para un artículo.
 * Se espera que esta estructura esté presente en cada artículo.
 */
export interface ArticleSentiment {
  global_sentiment: [ 'POS' | 'NEU' | 'NEG', number ]; // [Etiqueta, Confianza]
  highest_scoring_sentence_per_label: {
    POS?: HighestScoringSentence; // Marcado como opcional por si no hay ninguna frase positiva
    NEU?: HighestScoringSentence; // Marcado como opcional
    NEG?: HighestScoringSentence; // Marcado como opcional
  };
  title_sentiment?: SentimentScore; // Marcado como opcional
}

// --- Tipos de Citación de Fuentes ---

/** Representa los componentes de una citación de fuente. */
interface SourceCitationComponents {
  afirmacion: { // La declaración/cita real
    text: string;
    start_char: number;
    end_char: number;
    label: "Afirmacion";
  };
  conector?: { // Verbo/frase de conexión opcional
    text: string;
    start_char: number;
    end_char: number;
    label: "Conector";
  };
  referenciado?: { // Fuente/persona referenciada opcional
    text: string;
    start_char: number;
    end_char: number;
    label: "Referenciado";
  };
  // Añadir otros componentes potenciales si existen basados en el modelo de datos
}

/**
 * Representa una única citación de fuente identificada dentro del artículo,
 * incluyendo su posición y componentes.
 */
export interface SourceCitation {
  text: string; // El texto completo de la fuente/cita detectada
  start_char: number;
  end_char: number;
  length: number;
  pattern: string; // ej., "Q.VP" - identificador de patrón
  explicit: boolean;
  components: SourceCitationComponents;
}


// --- Tipo Principal del Artículo ---

/**
 * Representa un único artículo de noticias y sus metadatos y resultados de análisis asociados.
 */
export interface Article {
  // Metadatos básicos del artículo
  id: string;
  hora?: string; // Opcional si puede faltar
  link_noticia: string;
  link_foto?: string; // Opcional
  autor?: string; // Opcional
  categorias?: string[]; // Opcional
  cuerpo: string;
  volanta?: string; // Opcional
  fecha: string; // Fecha principal de publicación/modificación
  fecha_resumen?: string; // Opcional, quizás fecha original si 'fecha' cambia
  etiquetas?: string[]; // Opcional
  titulo: string;
  resumen?: string; // Opcional
  medio?: string; // Opcional

  /** Sección a la que pertenece el artículo. Opcional si puede faltar. */
  seccion?: string;

  // --- Campos de Análisis ---
  /** Métricas detalladas calculadas para el artículo (opcional). */
  metrics?: ArticleAnalysisMetrics;
  /** Resultados detallados del análisis de sentimiento (se asume requerido). */
  sentiment: ArticleSentiment;
  /** Lista de citaciones de fuente identificadas dentro del artículo (opcional). */
  sources?: SourceCitation[];
  /** Indicador de estado (ej., 'reviewed', 'pending') (opcional). */
  status?: string;

  // --- Resultados Detallados de NLP (Opcional) ---
  adjectives?: {
    adjectives_freq?: [string, number][]; // Frecuencia de adjetivos (opcional)
    adjectives_list?: {                   // Lista detallada (opcional)
      text: string;
      start_char: number;
      end_char: number;
      features?: { // Características lingüísticas (opcionales)
        Gender?: string;
        Number?: string;
        VerbForm?: string;
        NumType?: string;
        Degree?: string;
      };
    }[];
  };
  entities?: {
    entities_freq?: [string, number][]; // Frecuencia de entidades (opcional)
    entities_list?: {                  // Lista detallada (opcional)
      text: string;
      type: string; // Tipo de entidad (ej. Persona, Lugar)
      start_char: number;
      end_char: number;
      sentiment?: number; // Sentimiento asociado a la entidad (opcional)
    }[];
  };
}


// --- Tipo de Métricas Globales ---

/**
 * Representa métricas globales o de resumen calculadas sobre una colección de artículos.
 */
export interface GlobalMetrics {
  authors: number;
  articles: number;
  reviewed: number;
  pending: number;
  unreviewed: number;
  // Podrían añadirse otras métricas globales aquí
}


// --- Tipos para Métricas de Análisis de un Solo Artículo ---

/** Estructura genérica para un valor de métrica con comparación de referencia. */
interface MetricValue {
  full_name: string; // Nombre descriptivo
  name: string;      // Nombre corto/clave
  reference?: number; // Valor de referencia/objetivo (opcional)
  value: number;     // Valor calculado para el artículo
}

/** Métricas relacionadas con el uso de adjetivos dentro de un artículo. */
interface AdjectiveMetrics {
  num_adjectives?: MetricValue; // Opcional por si falla el cálculo
  perc_adjectives?: MetricValue; // Opcional
}

/** Desglose detallado de conteos de entidades nombradas dentro de un artículo. */
interface EntityMetricsBreakdown {
  num_entidades?: MetricValue; // Opcional
  num_entidades_lugar?: MetricValue; // Opcional
  num_entidades_misc?: MetricValue; // Opcional
  num_entidades_organizacion?: MetricValue; // Opcional
  num_entidades_persona?: MetricValue; // Opcional
}

/** Estadísticas básicas de texto para un artículo. */
interface GeneralTextMetrics {
  num_chars?: MetricValue; // Opcional
  num_chars_title?: MetricValue; // Opcional
  num_sentences?: MetricValue; // Opcional
  num_words?: MetricValue; // Opcional
}

/** Puntuaciones generales de sentimiento calculadas para el artículo (métricas numéricas). */
interface SentimentMetrics {
  sentimiento_global_negativo?: MetricValue; // Opcional
  sentimiento_global_neutro?: MetricValue; // Opcional
  sentimiento_global_positivo?: MetricValue; // Opcional
}

/** Métricas relacionadas con las citaciones de fuentes dentro de un artículo. */
interface SourceMetrics {
  // Nombres basados en SourcesMetrics.tsx y datos de ejemplo
  num_afirmaciones?: MetricValue;
  num_afirmaciones_explicitas?: MetricValue;
  num_conectores?: MetricValue;
  num_conectores_unique?: MetricValue;
  num_referenciados?: MetricValue;
  num_referenciados_unique?: MetricValue;
  // Añadir cualquier otra métrica de fuente si existe
}


/**
 * Representa métricas detalladas calculadas para el contenido de un *único* artículo.
 * Probablemente almacenado dentro del campo `Article.metrics`.
 */
export interface ArticleAnalysisMetrics {
  adjectives?: AdjectiveMetrics; // Propiedad opcional por si el análisis falla
  entities?: EntityMetricsBreakdown; // Propiedad opcional
  general?: GeneralTextMetrics; // Propiedad opcional
  sentiment?: SentimentMetrics; // Propiedad opcional
  sources?: SourceMetrics; // Propiedad opcional - CORREGIDO: Usa SourceMetrics, no LinkSource[]
}


// --- Tipos Redundantes (Comentados Correctamente) ---
/*
// Este tipo parece redundante o una versión anterior, ya que los conteos
// detallados por tipo están dentro de ArticleAnalysisMetrics.entities
export interface EntityMetrics {
  Lugar: number;
  Persona: number;
  Organización: number;
  Misceláneo: number;
  Fecha: number;
}
*/