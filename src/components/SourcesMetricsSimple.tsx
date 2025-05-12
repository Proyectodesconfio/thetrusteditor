// src/components/SourcesMetricsSimple.tsx
import React from 'react';
import type { Article } from '../types';

interface SourcesMetricsSimpleProps {
  metrics: Article['metrics'];
}

export default function SourcesMetricsSimple({ metrics }: SourcesMetricsSimpleProps) {
  const totalCitas = metrics?.sources?.num_afirmaciones?.value ??
                     metrics?.sources?.num_citas?.value ??
                     0;

  const numberColorClass = totalCitas < 3 ? 'text-red-600' : 'text-green-600';

  return (
    // Contenedor principal con flex-col
    <div className="bg-white rounded-lg p-4 md:p-6 shadow-sm border flex flex-col h-full min-h-[180px]">

      {/* Sección Superior: Solo Título */}
      <div className="flex justify-between items-start mb-4 flex-shrink-0"> {/* Añadido flex-shrink-0 */}
        <h3 className="text-lg md:text-xl font-medium text-gray-800">Fuentes</h3>
        {/* Número total ya no va aquí */}
      </div>

      {/* Sección Central: Número Grande y Coloreado */}
      <div className="flex-grow flex items-center justify-center">
        <span className={`text-5xl lg:text-6xl font-bold ${numberColorClass}`}>
          {totalCitas}
        </span>
      </div>

      {/* Sección Inferior: Etiqueta opcional */}
      <div className="text-center text-xs text-gray-400 mt-2 flex-shrink-0"> {/* Añadido flex-shrink-0 */}
         {totalCitas === 1 ? 'Cita' : 'Citas'} {/* Etiqueta singular/plural */}
      </div>

    </div>
  );
}