// src/components/SentimentAnalysis.tsx

// --- Library Imports ---
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faSmile, faMeh, faFrown, // Sentiment icons
  faQuestionCircle,         // Fallback icon
  faQuoteLeft, faQuoteRight  // Quote icons
} from '@fortawesome/free-solid-svg-icons';

// --- Type Imports ---
// Import necessary types from the central types file
// Ensure HighestScoringSentence is exported from ../types
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
            return { label: 'Positivo', color: 'text-green-600', bgColor: 'bg-green-50', borderColor: 'border-green-300', icon: faSmile };
        case 'NEU':
            return { label: 'Neutro', color: 'text-gray-500', bgColor: 'bg-gray-50', borderColor: 'border-gray-300', icon: faMeh };
        case 'NEG':
            return { label: 'Negativo', color: 'text-red-600', bgColor: 'bg-red-50', borderColor: 'border-red-300', icon: faFrown };
        default: // Fallback for null, undefined, or unexpected values
            return { label: 'N/A', color: 'text-gray-400', bgColor: 'bg-gray-100', borderColor: 'border-gray-200', icon: faQuestionCircle };
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

    // Render placeholder if sentiment data is missing
    if (!sentiment) {
        return (
            <div className="bg-white rounded-lg p-6 shadow-sm border"> {/* Added border */}
                <h3 className="text-lg font-medium mb-2 text-gray-700">Análisis de Sentimiento</h3> {/* Adjusted size */}
                <p className="text-sm text-gray-500 italic">Datos no disponibles.</p>
            </div>
        );
    }

    // --- Extract and Prepare Data ---
    const globalSentimentInfo = getSentimentDisplayInfo(sentiment.global_sentiment?.[0]);
    const globalScore = sentiment.global_sentiment?.[1];

    const titleSentimentInfo = getSentimentDisplayInfo(sentiment.title_sentiment?.label);
    const titleScores = sentiment.title_sentiment?.scores;

    // Destructure highest scoring sentences safely, providing fallback empty object
    const { POS, NEU, NEG } = sentiment.highest_scoring_sentence_per_label || {};

    // --- Render Component ---
    return (
        // Card container
        <div className="bg-white rounded-lg p-4 md:p-6 shadow-sm border"> {/* Added border */}
            {/* Main Title */}
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Análisis de Sentimiento</h3> {/* Adjusted size */}

            {/* Global Sentiment Section */}
            <div className="mb-5 border-b border-gray-200 pb-4"> {/* Adjusted spacing/border */}
                <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Sentimiento Global</h4>
                <div className="flex items-center gap-3">
                    {/* Global Sentiment Icon */}
                    <FontAwesomeIcon
                        icon={globalSentimentInfo.icon}
                        className={`w-7 h-7 ${globalSentimentInfo.color}`} // Adjusted size slightly
                    />
                    {/* Global Sentiment Label and Score */}
                    <div>
                        <span className={`block text-base font-semibold ${globalSentimentInfo.color}`}> {/* Adjusted size */}
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
            <div className="mb-5 border-b border-gray-200 pb-4"> {/* Adjusted spacing/border */}
                <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Sentimiento del Título</h4>
                 <div className="flex items-center gap-2 mb-1"> {/* Icon and Label */}
                     <FontAwesomeIcon
                        icon={titleSentimentInfo.icon}
                        className={`w-3.5 h-3.5 ${titleSentimentInfo.color}`} // Adjusted size
                    />
                    <span className={`text-sm font-medium ${titleSentimentInfo.color}`}>
                        {titleSentimentInfo.label}
                    </span>
                 </div>
                 {/* Title Score Breakdown (Optional) */}
                 {titleScores && (
                     <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-500 pl-5"> {/* Indent scores */}
                        <span>POS: {(titleScores.POS * 100).toFixed(0)}%</span>
                        <span>NEU: {(titleScores.NEU * 100).toFixed(0)}%</span>
                        <span>NEG: {(titleScores.NEG * 100).toFixed(0)}%</span>
                     </div>
                 )}
            </div>

             {/* Highest Scoring Sentences Section */}
            <div>
                 <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">Frases Destacadas</h4>
                 <div className="space-y-3">
                     {/* Render each sentence type using the helper component */}
                     <HighestScoreDisplay sentenceData={POS} type="POS" />
                     <HighestScoreDisplay sentenceData={NEU} type="NEU" />
                     <HighestScoreDisplay sentenceData={NEG} type="NEG" />
                 </div>
            </div>

        </div> // End Card container
    );
}


// --- Helper Component for Highest Scoring Sentence ---

/** Props for the HighestScoreDisplay helper component. */
interface HighestScoreDisplayProps {
    /** The data for the highest scoring sentence, or null/undefined if none exists for the type. */
    sentenceData: HighestScoringSentence | undefined | null;
    /** The sentiment type ('POS', 'NEU', 'NEG') this component represents. */
    type: 'POS' | 'NEU' | 'NEG';
}

/**
 * Renders a single highest-scoring sentence entry with appropriate styling.
 * Returns null if no sentence data is provided.
 */
function HighestScoreDisplay({ sentenceData, type }: HighestScoreDisplayProps) {
    // Don't render anything if sentence data is missing
    if (!sentenceData?.sentence) { // Check specifically for sentence text
        return null;
    }

    // Get display configuration based on the sentiment type
    const config = getSentimentDisplayInfo(type);
    // Limit sentence length for display
    const displaySentence = sentenceData.sentence.length > 120 // Increased limit slightly
        ? `${sentenceData.sentence.substring(0, 117)}...`
        : sentenceData.sentence;

    return (
        // Container with left border indicating sentiment type
        <div className={`border-l-4 ${config.borderColor ?? 'border-gray-200'} pl-3 py-1.5 ${config.bgColor ?? 'bg-gray-50'} rounded-r-md`}> {/* Use borderColor */}
             {/* Quoted sentence */}
             <blockquote className="text-xs italic text-gray-700 mb-1 leading-snug relative pl-3"> {/* Use blockquote, adjust line height */}
                 <FontAwesomeIcon icon={faQuoteLeft} className="absolute left-0 top-0.5 h-2 w-2 opacity-40"/>
                 {displaySentence}
                 {/* <FontAwesomeIcon icon={faQuoteRight} className="ml-1 opacity-50"/> */} {/* Right quote optional */}
             </blockquote>
             {/* Sentiment Label and Score */}
             <span className={`text-xs font-medium ${config.color}`}>
                 ({config.label} - Confianza: {(sentenceData.score * 100).toFixed(1)}%) {/* Changed Score to Confianza */}
             </span>
        </div>
    );
}