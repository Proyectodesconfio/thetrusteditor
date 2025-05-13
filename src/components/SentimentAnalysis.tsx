// src/components/SentimentAnalysis.tsx
import { useState } from 'react'; // Importar useState
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faSmile, faMeh, faFrown, // Íconos de Sentimiento
  faQuestionCircle,         // Ícono de Fallback
  faQuoteLeft,              // Ícono para citas dentro de HighestScoreDisplay
  faChevronDown, faChevronUp // Íconos para el control desplegable
} from '@fortawesome/free-solid-svg-icons';

// --- Importaciones de Tipos ---
import type { ArticleSentiment, HighestScoringSentence } from '../types';

// --- Configuración de Visualización de Sentimiento ---
/**
 * Define las propiedades para mostrar un tipo de sentimiento (etiqueta, color, icono, etc.).
 */
type SentimentDisplayConfig = {
    label: 'Positivo' | 'Neutro' | 'Negativo' | 'N/A';
    color: string;       // Clase de Tailwind para el color del texto e icono principal
    bgColor?: string;      // Clase de Tailwind opcional para el fondo (ej: en HighestScoreDisplay)
    borderColor?: string;  // Clase de Tailwind opcional para el borde (ej: en HighestScoreDisplay)
    icon: typeof faSmile; // Definición del icono de FontAwesome
};

/**
 * Mapea una etiqueta de sentimiento cruda ('POS', 'NEU', 'NEG', o nulo/indefinido)
 * a su configuración de visualización completa.
 *
 * @param label La etiqueta de sentimiento cruda.
 * @returns Un objeto SentimentDisplayConfig.
 */
const getSentimentDisplayInfo = (label: 'POS' | 'NEU' | 'NEG' | null | undefined): SentimentDisplayConfig => {
    switch (label) {
        case 'POS':
            return { label: 'Positivo', color: 'text-green-600', bgColor: 'bg-green-50', borderColor: 'border-green-400', icon: faSmile };
        case 'NEU':
            return { label: 'Neutro', color: 'text-gray-600', bgColor: 'bg-gray-100', borderColor: 'border-gray-400', icon: faMeh };
        case 'NEG':
            return { label: 'Negativo', color: 'text-red-600', bgColor: 'bg-red-50', borderColor: 'border-red-400', icon: faFrown };
        default: // Caso por defecto para nulo, indefinido o valores inesperados
            return { label: 'N/A', color: 'text-gray-400', bgColor: 'bg-gray-100', borderColor: 'border-gray-300', icon: faQuestionCircle };
    }
};

// --- Componente Principal de Análisis de Sentimiento ---

/** Props para el componente SentimentAnalysis. */
interface SentimentAnalysisProps {
  /**
   * El objeto detallado de análisis de sentimiento para el artículo.
   * Puede ser undefined o null si los datos no están disponibles.
   */
  sentiment: ArticleSentiment | undefined | null;
}

/**
 * Componente para la barra lateral que muestra un desglose detallado del análisis de sentimiento.
 * Incluye sentimiento global, sentimiento del título, y una sección desplegable para
 * las frases con mayor puntuación para cada tipo de sentimiento.
 */
export default function SentimentAnalysis({ sentiment }: SentimentAnalysisProps) {
  // Estado para controlar si la sección de "Frases Destacadas" está expandida.
  const [areSentencesExpanded, setAreSentencesExpanded] = useState(false); // Inicialmente colapsado

  // Si no hay datos de sentimiento o sentimiento global, mostrar un placeholder.
  if (!sentiment || !sentiment.global_sentiment) {
    return (
      <div className="flex justify-between items-center mb-3 flex-shrink-0">
        <h3 className="text-lg md:text-xl font-semibold text-gray-800">Análisis de Sentimiento</h3>
        <p className="text-sm text-gray-500 italic">Datos de sentimiento no disponibles.</p>
      </div>
    );
  }

  // --- Extracción y Preparación de Datos ---
  const globalSentimentInfo = getSentimentDisplayInfo(sentiment.global_sentiment[0]);
  const globalScore = sentiment.global_sentiment[1];

  const titleSentimentInfo = getSentimentDisplayInfo(sentiment.title_sentiment?.label);
  const titleScores = sentiment.title_sentiment?.scores;

  // Desestructurar las frases destacadas. Serán undefined si no existen.
  const POS_sentence = sentiment.highest_scoring_sentence_per_label?.POS;
  const NEU_sentence = sentiment.highest_scoring_sentence_per_label?.NEU;
  const NEG_sentence = sentiment.highest_scoring_sentence_per_label?.NEG;

  // Función para alternar la expansión de la lista de frases.
  const toggleSentencesExpansion = () => {
    setAreSentencesExpanded(prevState => !prevState);
  };

  // Determinar si hay al menos una frase destacada para mostrar la sección desplegable.
  const hasHighlightedSentences = POS_sentence?.sentence || NEU_sentence?.sentence || NEG_sentence?.sentence;

  return (
    <div className="bg-white rounded-lg p-4 md:p-6 shadow-sm border border-gray-200">
      <h3 className="text-lg font-semibold mb-5 text-gray-800">Análisis de Sentimiento</h3>

      {/* Sección de Sentimiento Global */}
      <div className="mb-5 border-b border-gray-200 pb-4">
        <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Sentimiento Global</h4>
        <div className="flex items-center gap-3">
          <FontAwesomeIcon
            icon={globalSentimentInfo.icon}
            className={`w-7 h-7 ${globalSentimentInfo.color}`}
          />
          <div>
            <span className={`block text-base font-semibold ${globalSentimentInfo.color}`}>
              {globalSentimentInfo.label}
            </span>
            {typeof globalScore === 'number' && (
              <span className="text-xs text-gray-500">
                Confianza: {(globalScore * 100).toFixed(1)}%
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Sección de Sentimiento del Título (solo si hay datos) */}
      {sentiment.title_sentiment && titleSentimentInfo.label !== 'N/A' && (
        <div className="mb-5 border-b border-gray-200 pb-4">
          <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Sentimiento del Título</h4>
          <div className="flex items-center gap-2 mb-1">
            <FontAwesomeIcon
              icon={titleSentimentInfo.icon}
              className={`w-4 h-4 ${titleSentimentInfo.color}`}
            />
            <span className={`text-sm font-medium ${titleSentimentInfo.color}`}>
              {titleSentimentInfo.label}
            </span>
          </div>
          {titleScores && (
            <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-500 pl-[22px]">
              <span>POS: {(titleScores.POS * 100).toFixed(0)}%</span>
              <span>NEU: {(titleScores.NEU * 100).toFixed(0)}%</span>
              <span>NEG: {(titleScores.NEG * 100).toFixed(0)}%</span>
            </div>
          )}
        </div>
      )}

      {/* Sección Desplegable de Frases Destacadas (solo si hay frases) */}
      {hasHighlightedSentences && (
        <div>
          <button
            type="button" // Buena práctica para botones que no son submit
            onClick={toggleSentencesExpansion}
            className="w-full flex items-center justify-between text-left py-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1 group rounded" // Añadido rounded para que el focus ring se vea bien
            aria-expanded={areSentencesExpanded}
            aria-controls="highlighted-sentences-list"
          >
            <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider group-hover:text-blue-600 transition-colors">
              Frases Destacadas
            </h4>
            <FontAwesomeIcon
              icon={areSentencesExpanded ? faChevronUp : faChevronDown}
              className="w-3.5 h-3.5 text-gray-400 group-hover:text-blue-600 transition-transform duration-200" // Añadida duración a la transición
            />
          </button>

          {/* Lista Desplegable de Frases */}
          {areSentencesExpanded && (
            <div id="highlighted-sentences-list" className="mt-2 space-y-3 animate-fadeIn"> {/* Opcional: animación simple */}
              <HighestScoreDisplay sentenceData={POS_sentence} type="POS" />
              <HighestScoreDisplay sentenceData={NEU_sentence} type="NEU" />
              <HighestScoreDisplay sentenceData={NEG_sentence} type="NEG" />
            </div>
          )}
        </div>
      )}
    </div>
  );
}


// --- Componente Auxiliar para Mostrar una Frase Destacada ---
interface HighestScoreDisplayProps {
    /** Datos de la frase con mayor puntuación, o nulo/indefinido si no existe para el tipo. */
    sentenceData: HighestScoringSentence | undefined | null;
    /** El tipo de sentimiento ('POS', 'NEU', 'NEG') que este componente representa. */
    type: 'POS' | 'NEU' | 'NEG';
}

/**
 * Renderiza una entrada para una única frase con la puntuación más alta, con el estilo apropiado.
 * Retorna null si no se proporcionan datos de la frase.
 */
function HighestScoreDisplay({ sentenceData, type }: HighestScoreDisplayProps) {
    // No renderizar si no hay texto de oración o la puntuación no es un número.
    if (!sentenceData?.sentence || typeof sentenceData.score !== 'number') {
        return null;
    }

    const config = getSentimentDisplayInfo(type); // Obtener configuración de color/icono
    // Limitar la longitud de la oración para la visualización, añadiendo puntos suspensivos.
    const displaySentence = sentenceData.sentence.length > 120
        ? `${sentenceData.sentence.substring(0, 117).trim()}...`
        : sentenceData.sentence;

    return (
        // Contenedor con borde izquierdo y fondo coloreado según el tipo de sentimiento.
        <div className={`border-l-4 ${config.borderColor ?? 'border-gray-300'} ${config.bgColor ?? 'bg-gray-50'} rounded-r-md p-3 shadow-sm`}> {/* Padding aumentado */}
             {/* Cita en bloque para la frase */}
             <blockquote className="text-sm italic text-gray-700 mb-1 leading-normal relative pl-4"> {/* Tamaño de fuente aumentado */}
                 <FontAwesomeIcon icon={faQuoteLeft} className="absolute left-0 top-0.5 h-3 w-3 text-gray-400 opacity-60"/> {/* Icono de cita ajustado */}
                 {displaySentence}
             </blockquote>
             {/* Etiqueta del sentimiento y puntuación de confianza */}
             <span className={`text-xs font-semibold ${config.color}`}> {/* font-semibold añadido */}
                 ({config.label} - Confianza: {(sentenceData.score * 100).toFixed(1)}%)
             </span>
        </div>
    );
}