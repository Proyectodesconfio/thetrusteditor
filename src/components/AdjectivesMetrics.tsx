// src/components/AdjectivesMetrics.tsx
import { useMemo, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFont, faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';
import type { Article, ArticleAnalysisMetrics } from '../types';

interface AdjectivesMetricsProps {
  metrics: ArticleAnalysisMetrics | undefined | null;
  adjectives?: Article['adjectives'] | undefined | null;
}

// --- FUNCIÓN DE COLOR PARA LA BARRA Y PORCENTAJE ---
/**
 * Calcula un color HSL que va de verde a rojo basándose en un porcentaje.
 * @param percentage - El porcentaje (0 a 100).
 * @returns Un string de color HSL.
 * Lógica: 0% de adjetivos = Verde (Hue 120), 100% de adjetivos = Rojo (Hue 0)
 * Asume que un porcentaje muy alto de adjetivos podría ser menos deseable.
 */
const getPercentageColorHsl = (
  percentage: number,
  saturation: number = 70,
  lightness: number = 50 // Un poco más oscuro para el texto que para el fondo de la barra
): string => {
  const normalizedPercent = Math.max(0, Math.min(100, percentage)) / 100;
  // Hue: 120 (Verde) para 0% -> 0 (Rojo) para 100%
  const hue = 120 - (normalizedPercent * 120);
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
};


export default function AdjectivesMetrics({ metrics, adjectives }: AdjectivesMetricsProps) {
  const [isFrequentAdjectivesExpanded, setIsFrequentAdjectivesExpanded] = useState(false);

  const numAdjectives = metrics?.adjectives?.num_adjectives?.value ?? 0;
  const percAdjectives = (metrics?.adjectives?.perc_adjectives?.value ?? 0) * 100;

  const currentAdjectivesFreq = adjectives?.adjectives_freq || [];
  const sortedAdjectivesFreq = useMemo(() => {
      return [...currentAdjectivesFreq].sort((a, b) => b[1] - a[1]);
  }, [currentAdjectivesFreq]);

  const toggleFrequentAdjectives = () => {
    setIsFrequentAdjectivesExpanded(!isFrequentAdjectivesExpanded);
  };

  const hasAnyAdjectiveData = numAdjectives > 0 || sortedAdjectivesFreq.length > 0;

  if (!hasAnyAdjectiveData && !metrics?.adjectives) {
    return (
        <div className="bg-white rounded-lg p-4 md:p-6 shadow-sm border">
            <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2 mb-2"> {/* Tamaño ajustado */}
                <FontAwesomeIcon icon={faFont} className="text-purple-500"/>
                Adjetivos
            </h3>
            <p className="text-sm text-gray-500 italic">No se encontraron datos de adjetivos.</p>
        </div>
    );
  }

  // --- COLOR DINÁMICO PARA BARRA Y TEXTO DE PORCENTAJE ---
  const dynamicBarColor = getPercentageColorHsl(percAdjectives);
  // Para el fondo de la barra, podríamos querer una versión más clara del mismo color
  const dynamicBarBgColor = getPercentageColorHsl(percAdjectives, 60, 85); // Menos saturación, más luminosidad

  return (
    <div className="bg-white rounded-lg p-4 md:p-6 shadow-sm border">
      {/* Cabecera de la Tarjeta */}
      <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2 mb-4"> {/* CAMBIO: text-xl */}
        <FontAwesomeIcon icon={faFont} className="text-purple-500"/> {/* Icono original púrpura */}
        Adjetivos
      </h3>

      {/* Sección de Métricas Generales (Conteo y Porcentaje) */}
      {(numAdjectives > 0 || percAdjectives > 0) && (
        <div className="mb-6">
            {/* --- MODIFICADO: Orden y Estilo de Porcentaje y Conteo --- */}
            <div className="flex items-center justify-between text-sm mb-1">
              {/* Porcentaje a la izquierda, sin paréntesis, con color dinámico */}
              {percAdjectives > 0 && (
                  <span className="font-medium" style={{ color: dynamicBarColor }}>
                    {percAdjectives.toFixed(1)}%
                  </span>
              )}
              {/* Conteo a la derecha */}
              <span className="text-gray-700">{numAdjectives} Adjetivo{numAdjectives !== 1 ? 's' : ''}</span>
            </div>
            {/* --- MODIFICADO: Barra de Progreso con Color Dinámico --- */}
            <div
              className="rounded-full h-2.5 w-full overflow-hidden" // Barra más gruesa
              style={{ backgroundColor: dynamicBarBgColor }} // Fondo de la barra con color dinámico claro
              title={`${percAdjectives.toFixed(1)}% de adjetivos`}
            >
              <div
                className="h-full rounded-full transition-all duration-300 ease-in-out"
                style={{
                    width: `${Math.min(percAdjectives, 100)}%`,
                    backgroundColor: dynamicBarColor // Barra activa con color dinámico principal
                }}
              />
            </div>
        </div>
      )}

      {/* Sección de Adjetivos Más Frecuentes (Desplegable) */}
      {sortedAdjectivesFreq.length > 0 && (
          <div className={`pt-4 ${ (numAdjectives > 0 || percAdjectives > 0) ? 'border-t border-gray-200' : ''}`}>
            <button
              type="button"
              onClick={toggleFrequentAdjectives}
              className="w-full flex items-center justify-between text-left py-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-1 group rounded"
              aria-expanded={isFrequentAdjectivesExpanded}
              aria-controls="frequent-adjectives-list"
            >
              <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider group-hover:text-purple-600 transition-colors">
                Adjetivos Más Frecuentes
              </h4>
              <FontAwesomeIcon
                icon={isFrequentAdjectivesExpanded ? faChevronUp : faChevronDown}
                className="w-3.5 h-3.5 text-gray-400 group-hover:text-purple-600 transition-transform duration-200"
              />
            </button>

            {isFrequentAdjectivesExpanded && (
                <div id="frequent-adjectives-list" className="mt-3 space-y-1.5 max-h-60 overflow-y-auto pr-1">
                    {sortedAdjectivesFreq.map(([adjective, count]) => (
                        <div key={`${adjective}-${count}`} className="flex items-center justify-between text-sm hover:bg-purple-50 px-1 py-0.5 rounded">
                            <span className="text-gray-700 capitalize">{adjective}</span>
                            <span className="text-purple-600 font-medium">{count}</span>
                        </div>
                    ))}
                </div>
            )}
          </div>
      )}
    </div>
  );
}