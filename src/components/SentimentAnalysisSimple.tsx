// src/components/SentimentAnalysisSimple.tsx
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faSmile,
  faMeh,
  faFrown,
  faQuestionCircle
} from '@fortawesome/free-solid-svg-icons';

// Import the detailed sentiment type structure
import type { ArticleSentiment } from '../types'; // Asegúrate que la ruta '../types' es correcta

// Helper type for mapping sentiment labels to display properties
type SentimentDisplayConfig = {
    label: 'Positivo' | 'Neutro' | 'Negativo' | 'N/A';
    color: string; // Tailwind text color class
    icon: typeof faSmile; // FontAwesomeIcon definition type
};

/**
 * Maps a sentiment label ('POS', 'NEU', 'NEG') to display configuration for the simple view.
 */
const getSimpleSentimentDisplayInfo = (label: 'POS' | 'NEU' | 'NEG' | null | undefined): SentimentDisplayConfig => {
    switch (label) {
        case 'POS':
            return { label: 'Positivo', color: 'text-green-600', icon: faSmile };
        case 'NEU':
            return { label: 'Neutro', color: 'text-gray-500', icon: faMeh };
        case 'NEG':
            return { label: 'Negativo', color: 'text-red-600', icon: faFrown };
        default:
            return { label: 'N/A', color: 'text-gray-400', icon: faQuestionCircle };
    }
};

// --- Component Props ---
interface SentimentAnalysisSimpleProps {
  /** The detailed sentiment analysis object for the article. */
  sentiment: ArticleSentiment | undefined | null; // Allow undefined/null
}

/**
 * Displays a simple overview of the article's global sentiment,
 * emphasizing the sentiment icon.
 */
export default function SentimentAnalysisSimple({ sentiment }: SentimentAnalysisSimpleProps) {
  // Determine display info based on global sentiment label
  const displayInfo = getSimpleSentimentDisplayInfo(sentiment?.global_sentiment?.[0]);
  // Safely get the score
  const score = sentiment?.global_sentiment?.[1];

  return (
    // Card container - Make it a flex column to center content vertically and fill height
    <div className="bg-white rounded-lg p-6 shadow-sm h-full flex flex-col text-center"> {/* Added h-full, flex, flex-col, text-center */}
      {/* Title pushed to the top */}
      <h3 className="text-base font-medium text-gray-600 mb-auto">Sentimiento Global</h3> {/* Adjusted size/color, mb-auto pushes content down */}

      {/* Centered content area */}
      <div className="flex flex-col items-center justify-center"> {/* Center icon and text */}
        {/* Large Icon */}
        <FontAwesomeIcon
          icon={displayInfo.icon}
          className={`w-12 h-12 ${displayInfo.color} mb-4`} // Increased size and margin
        />
        {/* Sentiment Label */}
        <p className={`text-2xl font-semibold mb-1 ${displayInfo.color}`}>
          {displayInfo.label}
        </p>
        {/* Confidence Score */}
        {typeof score === 'number' ? (
          <p className="text-sm text-gray-500">
            Confianza: <span className="font-medium">{(score * 100).toFixed(1)}%</span>
          </p>
        ) : (
          <p className="text-sm text-gray-400 italic">Score no disponible</p>
        )}
      </div>

      {/* Spacer to push content towards center if title is present */}
       <div className="mt-auto"></div> {/* Pushes content up from bottom */}

    </div>
  );
}