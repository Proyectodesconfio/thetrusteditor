// src/components/AdjectivesMetricsSimple.tsx
// import React from 'react'; // REMOVED - No se usa explícitamente
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'; // REMOVED
// import { faFont } from '@fortawesome/free-solid-svg-icons'; // REMOVED
import type { Article } from '../types';

interface AdjectivesMetricsProps {
  /** Métricas de análisis del artículo, específicamente la sección de adjetivos. */
  metrics: Article['metrics']; // Es ArticleAnalysisMetrics | undefined
}

/**
 * Componente simple para el "Resumen Rápido" que muestra el número total de adjetivos
 * y su porcentaje representados por una barra de progreso.
 */
export default function AdjectivesMetricsSimple({ metrics }: AdjectivesMetricsProps) {
  // Extraer el porcentaje de adjetivos y convertirlo (ej: 0.246 a 24.6)
  const percentage = (metrics?.adjectives?.perc_adjectives?.value ?? 0) * 100;
  // Extraer el número total de adjetivos
  const actualValue = metrics?.adjectives?.num_adjectives?.value ?? 0;

  return (
    // Contenedor principal de la tarjeta
    <div className="bg-white rounded-lg p-4 md:p-6 shadow-sm border flex flex-col h-full min-h-[180px]">

      {/* Sección Superior: Título "Adjetivos" y el número total de adjetivos */}
      <div className="flex justify-between items-start mb-4 flex-shrink-0">
        <h3 className="text-lg md:text-xl font-medium text-gray-800">Adjetivos</h3>
        <span className="text-purple-600 text-2xl font-semibold">
          {actualValue}
        </span>
      </div>

      {/* Sección Central: Barra de progreso y el valor del porcentaje */}
      {/* Esta sección usa flex-grow para ocupar el espacio vertical disponible y centrar su contenido */}
      <div className="flex-grow flex flex-col items-center justify-center gap-2">
         {/* Barra de Progreso */}
         <div
           className="w-3/4 h-2.5 rounded-full bg-purple-100 overflow-hidden" // Fondo de la barra
           title={`${percentage.toFixed(1)}% de adjetivos en el texto`} // Tooltip para accesibilidad
         >
           <div
             className="h-full bg-purple-500 rounded-full transition-all duration-300 ease-in-out" // Barra activa
             style={{ width: `${Math.min(percentage, 100)}%` }} // Ancho basado en el porcentaje (máx 100%)
           />
         </div>
         {/* Valor del Porcentaje */}
         <span className="text-sm font-medium text-purple-600 mt-1">
              {percentage.toFixed(1)}%
         </span>
      </div>

      {/* Sección Inferior: Etiqueta de contexto para el número total */}
      <div className="text-center text-xs text-gray-400 mt-2 flex-shrink-0">
         {actualValue} Adjetivo{actualValue !== 1 ? 's' : ''} {/* Manejo de plural */}
      </div>

    </div>
  );
}