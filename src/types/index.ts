// src/types/index.ts

// --- Sentiment Analysis Types ---

/**
 * Represents the sentiment analysis results for a specific text fragment (like a sentence or title).
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
 * Represents the sentence with the highest score for a specific sentiment label.
 */
interface HighestScoringSentence {
  score: number;
  start_char: number;
  end_char: number;
  sentence: string;
}

/**
 * Represents the complete sentiment analysis results for an article.
 * This structure is expected to be present in every article.
 */
export interface ArticleSentiment {
  global_sentiment: [ 'POS' | 'NEU' | 'NEG', number ];
  highest_scoring_sentence_per_label: {
    POS: HighestScoringSentence;
    NEU: HighestScoringSentence;
    NEG: HighestScoringSentence;
  };
  title_sentiment: SentimentScore;
}

// --- Source Citation Types ---

/** Represents the components of a source citation. */
interface SourceCitationComponents {
  afirmacion: { // The actual statement/quote
    text: string;
    start_char: number;
    end_char: number;
    label: "Afirmacion";
  };
  conector?: { // Optional connecting verb/phrase
    text: string;
    start_char: number;
    end_char: number;
    label: "Conector";
  };
  referenciado?: { // Optional source/person being referenced
    text: string;
    start_char: number;
    end_char: number;
    label: "Referenciado";
  };
  // Add other potential components if they exist based on your data model
}

/**
 * Represents a single identified source citation within the article,
 * including its position and components.
 */
export interface SourceCitation {
  text: string; // The full text of the detected source/quote
  start_char: number;
  end_char: number;
  length: number;
  pattern: string; // e.g., "Q.VP" - pattern identifier
  explicit: boolean;
  components: SourceCitationComponents;
}


// --- Main Article Type ---

/**
 * Represents a single news article and its associated metadata and analysis results.
 */
export interface Article {
  id: string;
  hora: string;
  link_noticia: string;
  link_foto: string;
  autor: string;
  categorias: string[];
  cuerpo: string;
  volanta: string;
  fecha: string;
  fecha_resumen: string;
  etiquetas: string[];
  titulo: string;
  resumen: string;
  medio: string;

  /** Section the article belongs to. Mark as optional if it might be missing. */
  seccion?: string;

  // --- Analysis Fields ---
  /** Detailed metrics calculated for the article (optional). */
  metrics?: ArticleAnalysisMetrics;
  /** Detailed sentiment analysis results for the article (required). */
  sentiment: ArticleSentiment;
  /** List of identified source citations within the article (optional). */
  sources?: SourceCitation[]; // Updated to use the detailed SourceCitation type
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
      sentiment: number;
    }[];
  };
}


// --- Global Metrics Type ---

/**
 * Represents global or summary metrics calculated across a collection of articles.
 */
export interface GlobalMetrics {
  authors: number;
  articles: number;
  reviewed: number;
  pending: number;
  unreviewed: number;
}


// --- Single Article Analysis Metrics Type ---

/** Generic structure for a metric value with reference comparison. */
interface MetricValue {
  full_name: string;
  name: string;
  reference: number;
  value: number;
}

/** Metrics related to adjective usage within an article. */
interface AdjectiveMetrics {
  num_adjectives: MetricValue;
  perc_adjectives: MetricValue;
}

/** Detailed breakdown of named entity counts within an article. */
interface EntityMetricsBreakdown {
  num_entidades: MetricValue;
  num_entidades_lugar: MetricValue;
  num_entidades_misc: MetricValue;
  num_entidades_organizacion: MetricValue;
  num_entidades_persona: MetricValue;
}

/** Basic text statistics for an article. */
interface GeneralTextMetrics {
  num_chars: MetricValue;
  num_chars_title: MetricValue;
  num_sentences: MetricValue;
  num_words: MetricValue;
}

/** Overall sentiment scores calculated for the article (numerical metrics). */
interface SentimentMetrics {
  sentimiento_global_negativo: MetricValue;
  sentimiento_global_neutro: MetricValue;
  sentimiento_global_positivo: MetricValue;
}

/** Represents a single identified *link* source (distinct from citations). */
// Note: This seems to be for the *metrics* part, not the inline citations.
interface LinkSource { // Renamed from Source to avoid naming collision
  link: string;
  name: string;
}


/**
 * Represents detailed metrics calculated for a *single* article's content.
 * Likely stored within the `Article.metrics` field.
 */
export interface ArticleAnalysisMetrics {
  adjectives: AdjectiveMetrics;
  entities: EntityMetricsBreakdown;
  general: GeneralTextMetrics;
  sentiment: SentimentMetrics; // Metrics about sentiment (counts/scores)
  sources: LinkSource[]; // List of linked sources (part of metrics)
}


// --- Potentially Redundant Entity Metrics (Commented Out) ---
/*
export interface EntityMetrics {
  Lugar: number;
  Persona: number;
  Organización: number;
  Misceláneo: number;
  Fecha: number;
}
*/