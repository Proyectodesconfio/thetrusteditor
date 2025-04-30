// --- Sentiment Analysis Types ---

/**
 * Represents the sentiment analysis results for a specific text fragment (like a sentence or title).
 */
interface SentimentScore {
  label: 'POS' | 'NEU' | 'NEG'; // The dominant sentiment label
  scores: {
    NEG: number; // Score for Negative sentiment (e.g., 0.0 to 1.0)
    NEU: number; // Score for Neutral sentiment
    POS: number; // Score for Positive sentiment
  };
}

/**
 * Represents the sentence with the highest score for a specific sentiment label.
 */
interface HighestScoringSentence {
  score: number;      // The confidence score for the dominant sentiment
  start_char: number; // Starting character index of the sentence in the original text
  end_char: number;   // Ending character index of the sentence
  sentence: string;   // The text of the sentence itself
}

/**
 * Represents the complete sentiment analysis results for an article.
 * This structure is expected to be present in every article.
 */
export interface ArticleSentiment {
  /** Overall sentiment label and score for the entire article body. */
  global_sentiment: [ 'POS' | 'NEU' | 'NEG', number ]; // [Dominant Label, Score]
  /** Sentences with the highest score for each sentiment category. */
  highest_scoring_sentence_per_label: {
    POS: HighestScoringSentence; // Highest scoring positive sentence
    NEU: HighestScoringSentence; // Highest scoring neutral sentence
    NEG: HighestScoringSentence; // Highest scoring negative sentence
  };
  /** Sentiment analysis results specifically for the article's title. */
  title_sentiment: SentimentScore;
}


// --- Main Article Type ---

/**
 * Represents a single news article and its associated metadata and analysis results.
 */
export interface Article {
  id: string; // Unique identifier for the article
  hora: string; // Time of publication (consider using Date type if possible after normalization)
  link_noticia: string; // URL to the original article
  link_foto: string; // URL to the main photo associated with the article
  autor: string; // Author's name
  categorias: string[]; // Assigned categories
  cuerpo: string; // Full body text of the article
  volanta: string; // Kicker or sub-headline
  fecha: string; // Original publication date string (consider using Date type if possible after normalization)
  fecha_resumen: string; // Date string used for summary purposes
  etiquetas: string[]; // Assigned tags or keywords
  titulo: string; // Main title of the article
  resumen: string; // Article summary text
  medio: string; // Publication medium or source name

  /** Section the article belongs to. Mark as optional if it might be missing. */
  seccion?: string; // Or make required: seccion: string;

  // --- Analysis Fields ---
  /** Detailed analysis results for this specific article (optional if processing might fail). */
  metrics?: ArticleAnalysisMetrics;
  /** Detailed sentiment analysis results for the article (expected to always be present). */
  sentiment: ArticleSentiment; // Now required and uses the detailed type
  /** List of identified sources within the article (optional). */
  sources?: Source[];
  /** Status indicator (e.g., 'reviewed', 'pending') (optional). */
  status?: string;

  // --- Detailed NLP Analysis Results (Optional) ---
  adjectives?: {
    adjectives_freq: [string, number][];
    adjectives_list: {
      text: string;
      start_char: number;
      end_char: number;
      features: {
        Gender?: string;
        Number?: string;
        VerbForm?: string;
        NumType?: string;
        Degree?: string;
      };
    }[];
  };
  entities?: {
    entities_freq: [string, number][];
    entities_list: {
      text: string;
      type: string;
      start_char: number;
      end_char: number;
      sentiment: number; // Assuming this is a score related to the entity itself
    }[];
  };
}


// --- Global Metrics Type ---

/**
 * Represents global or summary metrics calculated across a collection of articles.
 * Likely used for overview displays (e.g., HomeMetrics component).
 */
export interface GlobalMetrics {
  authors: number;
  articles: number;
  reviewed: number;
  pending: number;
  unreviewed: number;
}


// --- Single Article Analysis Metrics Type ---

/**
 * Represents detailed metrics calculated for a *single* article's content.
 * This is likely stored within the `Article.metrics` field after analysis.
 */
export interface ArticleAnalysisMetrics {
  adjectives: AdjectiveMetrics;
  entities: EntityMetricsBreakdown;
  general: GeneralTextMetrics;
  sentiment: SentimentMetrics; // Note: This is different from ArticleSentiment
  sources: Source[];
}

/** Generic structure for a metric value with reference comparison. */
interface MetricValue {
  full_name: string;
  name: string;
  reference: number;
  value: number;
}

/** Metrics related to adjective usage within an article. */
export interface AdjectiveMetrics {
  num_adjectives: MetricValue;
  perc_adjectives: MetricValue;
}

/** Detailed breakdown of named entity counts within an article. */
export interface EntityMetricsBreakdown {
  num_entidades: MetricValue;
  num_entidades_lugar: MetricValue;
  num_entidades_misc: MetricValue;
  num_entidades_organizacion: MetricValue;
  num_entidades_persona: MetricValue;
}

/** Basic text statistics for an article. */
export interface GeneralTextMetrics {
  num_chars: MetricValue;
  num_chars_title: MetricValue;
  num_sentences: MetricValue;
  num_words: MetricValue;
}

/** Overall sentiment scores calculated for the article (likely numerical metrics). */
// Note: This seems distinct from ArticleSentiment, perhaps representing simpler metric values.
export interface SentimentMetrics {
  sentimiento_global_negativo: MetricValue;
  sentimiento_global_neutro: MetricValue;
  sentimiento_global_positivo: MetricValue;
}

/** Represents a single identified source. */
export interface Source {
  link: string;
  name: string;
}


// --- Potentially Redundant Entity Metrics ---
// TODO: Verify if this is needed or if `ArticleAnalysisMetrics.entities` is sufficient. Remove if redundant.
/*
export interface EntityMetrics {
  Lugar: number;
  Persona: number;
  Organización: number;
  Misceláneo: number;
  Fecha: number;
}
*/