// src/components/SentimentAnalysisSimple.tsx
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faSmile,
  faMeh,
  faFrown,
  faQuestionCircle
} from '@fortawesome/free-solid-svg-icons';
import type { ArticleSentiment } from '../types'; 

// --- Configuración de Visualización de Sentimiento ---
/**
 * Define las propiedades para mostrar un tipo de sentimiento (etiqueta, color, icono).
 */
type SentimentDisplayConfig = {
    label: 'Positivo' | 'Neutro' | 'Negativo' | 'N/A';
    color: string; // Clase de color de Tailwind para el texto e icono
    icon: typeof faSmile; // Definición del icono de FontAwesome
};

/**
 * Mapea una etiqueta de sentimiento ('POS', 'NEU', 'NEG', o nulo/indefinido)
 * a su configuración de visualización para la vista simple.
 *
 * @param label La etiqueta de sentimiento cruda (ej. 'POS').
 * @returns Un objeto SentimentDisplayConfig.
 */
const getSimpleSentimentDisplayInfo = (label: 'POS' | 'NEU' | 'NEG' | null | undefined): SentimentDisplayConfig => {
    switch (label) {
        case 'POS':
            return { label: 'Positivo', color: 'text-green-600', icon: faSmile };
        case 'NEU':
            return { label: 'Neutro', color: 'text-gray-500', icon: faMeh };
        case 'NEG':
            return { label: 'Negativo', color: 'text-red-600', icon: faFrown };
        default: // Caso por defecto para nulo, indefinido o valores inesperados
            return { label: 'N/A', color: 'text-gray-400', icon: faQuestionCircle };
    }
};

// --- Props del Componente ---
interface SentimentAnalysisSimpleProps {
  /**
   * El objeto detallado de análisis de sentimiento para el artículo.
   * Puede ser undefined o null si los datos no están disponibles.
   */
  sentiment: ArticleSentiment | undefined | null;
}

/**
 * Componente para el "Resumen Rápido" que muestra una vista general del sentimiento global
 * del artículo, destacando el icono de sentimiento, la etiqueta y la confianza.
 */
export default function SentimentAnalysisSimple({ sentiment }: SentimentAnalysisSimpleProps) {
  // Determinar la información de visualización basada en la etiqueta del sentimiento global.
  // Se accede de forma segura a `sentiment.global_sentiment[0]` (la etiqueta).
  const displayInfo = getSimpleSentimentDisplayInfo(sentiment?.global_sentiment?.[0]);
  // Obtener la puntuación de confianza de forma segura (el segundo elemento del array).
  const score = sentiment?.global_sentiment?.[1];

  return (
    // Contenedor principal de la tarjeta: flex-col para centrar contenido verticalmente.
    // h-full para ocupar la altura disponible en un layout de grid.
    // min-h-[180px] para consistencia con otras tarjetas de resumen.
    <div className="bg-white rounded-lg p-4 md:p-6 shadow-sm border flex flex-col text-center h-full min-h-[180px]">

      {/* Título de la tarjeta, empujado hacia arriba */}
      <h3 className="text-base font-medium text-gray-600 mb-auto flex-shrink-0">Sentimiento Global</h3>

      {/* Contenido central: Icono, Etiqueta, Confianza */}
      {/* Este div usa flex-grow para ocupar el espacio y centrar su contenido */}
      <div className="flex-grow flex flex-col items-center justify-center py-2"> {/* py-2 para un poco de espacio vertical */}
        {/* Icono grande representativo del sentimiento */}
        <FontAwesomeIcon
          icon={displayInfo.icon}
          className={`w-12 h-12 ${displayInfo.color} mb-3`} // Tamaño y margen ajustados
        />
        {/* Etiqueta del Sentimiento (ej. "Positivo") */}
        <p className={`text-xl md:text-2xl font-semibold mb-1 ${displayInfo.color}`}> {/* Tamaño ajustado */}
          {displayInfo.label}
        </p>
        {/* Puntuación de Confianza (si está disponible) */}
        {typeof score === 'number' ? (
          <p className="text-xs md:text-sm text-gray-500"> {/* Tamaño ajustado */}
            Confianza: <span className="font-medium">{(score * 100).toFixed(1)}%</span>
          </p>
        ) : (
          // Mensaje si la puntuación no está disponible
          <p className="text-xs md:text-sm text-gray-400 italic">Puntuación no disponible</p>
        )}
      </div>

      {/* Espaciador inferior (opcional, para empujar el contenido si es necesario) */}
       <div className="flex-shrink-0 h-4"></div> {/* Espacio pequeño opcional al final */}

    </div>
  );
}