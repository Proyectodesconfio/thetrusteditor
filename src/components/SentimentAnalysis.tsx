// src/components/SentimentAnalysis.tsx

// --- Library Imports ---
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faSmile, faMeh, faFrown, // Sentiment icons
  faQuestionCircle,         // Fallback icon
  faQuoteLeft               // Quote icon (faQuoteRight REMOVED)
} from '@fortawesome/free-solid-svg-icons';

// --- Type Imports ---
// Import necessary types from the central types file
import type { ArticleSentiment, HighestScoringSentence } from '../types';

// --- Display Configuration ---

/** Configuration for displaying sentiment (label, color, icon). */
type SentimentDisplayConfig = {
    label: 'Positivo' | 'Neutro' | 'Negativo' | 'N/A';
    color: string;       // Tailwind text color class (e.g., 'text-green-600')
    bgColor?: string;      // Optional Tailwind background class (e.g., 'bg-green-50')
    borderColor?: string;  // Optional Tailwind border color class (e.g., 'border-green-300')
    icon: typeof faSmile; // FontAwesome icon definition
};

/**
 * Maps a sentiment label ('POS', 'NEU', 'NEG', null, undefined) to its display configuration.
 */
const getSentimentDisplayInfo = (label: 'POS' | 'NEU' | 'NEG' | null | undefined): SentimentDisplayConfig => {
    switch (label) {
        case 'POS':
            return { label: 'Positivo', color: 'text-green-600', bgColor: 'bg-green-50', borderColor: 'border-green-400', icon: faSmile }; // Ajustado borderColor
        case 'NEU':
            return { label: 'Neutro', color: 'text-gray-600', bgColor: 'bg-gray-100', borderColor: 'border-gray-400', icon: faMeh }; // Ajustado color y borderColor
        case 'NEG':
            return { label: 'Negativo', color: 'text-red-600', bgColor: 'bg-red-50', borderColor: 'border-red-400', icon: faFrown }; // Ajustado borderColor
        default: // Fallback for null, undefined, or unexpected values
            return { label: 'N/A', color: 'text-gray-400', bgColor: 'bg-gray-100', borderColor: 'border-gray-300', icon: faQuestionCircle };
    }
};


// --- Main Component ---

/** Props for the SentimentAnalysis component. */
interface SentimentAnalysisProps {
  /** The detailed sentiment analysis object for the article, or null/undefined if not available. */
  sentiment: ArticleSentiment | undefined | null;
}

/**
 * Displays a detailed breakdown of sentiment analysis results for an article,
 * including global sentiment, title sentiment, and the highest-scoring positive,
 * neutral, and negative sentences found in the text.
 */
export default function SentimentAnalysis({ sentiment }: SentimentAnalysisProps) {

    // Render placeholder if sentiment data is missing or incomplete
    if (!sentiment || !sentiment.global_sentiment) { // Chequeo más robusto
        return (
            <div className="bg-white rounded-lg p-4 md:p-6 shadow-sm border">
                <h3 className="text-lg font-semibold mb-2 text-gray-700">Análisis de Sentimiento</h3>
                <p className="text-sm text-gray-500 italic">Datos de sentimiento no disponibles.</p>
            </div>
        );
    }

    // --- Extract and Prepare Data ---
    const globalSentimentInfo = getSentimentDisplayInfo(sentiment.global_sentiment[0]); // Acceso directo al label
    const globalScore = sentiment.global_sentiment[1]; // Acceso directo a la confianza

    const titleSentimentInfo = getSentimentDisplayInfo(sentiment.title_sentiment?.label);
    const titleScores = sentiment.title_sentiment?.scores;

    // Destructure highest scoring sentences safely.
    // Si `highest_scoring_sentence_per_label` es undefined, POS, NEU, NEG serán undefined.
    const POS = sentiment.highest_scoring_sentence_per_label?.POS;
    const NEU = sentiment.highest_scoring_sentence_per_label?.NEU;
    const NEG = sentiment.highest_scoring_sentence_per_label?.NEG;

    // --- Render Component ---
    return (
        <div className="bg-white rounded-lg p-4 md:p-6 shadow-sm border">
            <h3 className="text-lg font-semibold mb-5 text-gray-800">Análisis de Sentimiento</h3>

            {/* Global Sentiment Section */}
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

            {/* Title Sentiment Section */}
            {/* Solo renderizar si hay datos de sentimiento del título */}
            {sentiment.title_sentiment && (
                <div className="mb-5 border-b border-gray-200 pb-4">
                    <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Sentimiento del Título</h4>
                    <div className="flex items-center gap-2 mb-1">
                        <FontAwesomeIcon
                            icon={titleSentimentInfo.icon}
                            className={`w-4 h-4 ${titleSentimentInfo.color}`} // Tamaño ajustado
                        />
                        <span className={`text-sm font-medium ${titleSentimentInfo.color}`}>
                            {titleSentimentInfo.label}
                        </span>
                    </div>
                    {titleScores && (
                         <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-500 pl-[22px]"> {/* Ajustado padding para alinear con el icono */}
                            <span>POS: {(titleScores.POS * 100).toFixed(0)}%</span>
                            <span>NEU: {(titleScores.NEU * 100).toFixed(0)}%</span>
                            <span>NEG: {(titleScores.NEG * 100).toFixed(0)}%</span>
                         </div>
                    )}
                </div>
            )}


             {/* Highest Scoring Sentences Section */}
            {(POS || NEU || NEG) && ( // Solo mostrar sección si hay al menos una frase
                <div>
                     <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">Frases Destacadas</h4>
                     <div className="space-y-3">
                         <HighestScoreDisplay sentenceData={POS} type="POS" />
                         <HighestScoreDisplay sentenceData={NEU} type="NEU" />
                         <HighestScoreDisplay sentenceData={NEG} type="NEG" />
                     </div>
                </div>
            )}

        </div>
    );
}


// --- Helper Component for Highest Scoring Sentence ---

interface HighestScoreDisplayProps {
    sentenceData: HighestScoringSentence | undefined | null;
    type: 'POS' | 'NEU' | 'NEG';
}

function HighestScoreDisplay({ sentenceData, type }: HighestScoreDisplayProps) {
    // No renderizar si no hay oración o la confianza es inválida
    if (!sentenceData?.sentence || typeof sentenceData.score !== 'number') {
        return null;
    }

    const config = getSentimentDisplayInfo(type);
    // Limitar longitud de la oración para visualización
    const displaySentence = sentenceData.sentence.length > 120
        ? `${sentenceData.sentence.substring(0, 117).trim()}...` // trim() para evitar "..." después de un espacio
        : sentenceData.sentence;

    return (
        <div className={`border-l-4 ${config.borderColor} ${config.bgColor} rounded-r-md p-2.5 shadow-sm`}> {/* Ajustado padding y sombra */}
             <blockquote className="text-xs italic text-gray-700 mb-1 leading-snug relative pl-4"> {/* Ajustado padding izquierdo */}
                 <FontAwesomeIcon icon={faQuoteLeft} className="absolute left-0 top-0.5 h-2.5 w-2.5 text-gray-400 opacity-70"/> {/* Color y opacidad ajustados */}
                 {displaySentence}
             </blockquote>
             <span className={`text-xs font-medium ${config.color}`}>
                 ({config.label} - Confianza: {(sentenceData.score * 100).toFixed(1)}%)
             </span>
        </div>
    );
}