// src/components/EntityMetricsSimple.tsx
import React, { useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUser,
  faLocationDot,
  faCalendarDays,
  faBuilding,
  faEllipsis
} from '@fortawesome/free-solid-svg-icons';
import type { Article } from '../types';

interface EntityMetricsSimpleProps {
  entities: Article['entities'];
}

const typeIconMap: Record<string, any> = {
  Persona: faUser,
  Lugar: faLocationDot,
  Fecha: faCalendarDays,
  Organización: faBuilding,
  Misceláneo: faEllipsis,
};

export default function EntityMetricsSimple({ entities }: EntityMetricsSimpleProps) {
  const { totalEntities, sortedCounts } = useMemo(() => {
    const counts: Record<string, number> = {};
    let total = 0;
    if (entities?.entities_list) {
      total = entities.entities_list.length;
      entities.entities_list.forEach(entity => {
        counts[entity.type] = (counts[entity.type] || 0) + 1;
      });
    }
    const filteredAndSorted = Object.entries(counts)
      .filter(([type, count]) => count > 0 && typeIconMap[type])
      .sort(([, countA], [, countB]) => countB - countA);
    return { totalEntities: total, sortedCounts: filteredAndSorted };
  }, [entities?.entities_list]);

  const maxItemsToShow = 4;
  const itemsToShow = sortedCounts.slice(0, maxItemsToShow);

  return (
    <div className="bg-white rounded-lg p-4 md:p-6 shadow-sm border flex flex-col h-full min-h-[180px]">
      {/* Sección Superior: Título y Total */}
      <div className="flex justify-between items-start mb-4 flex-shrink-0">
        <h3 className="text-lg md:text-xl font-medium text-gray-800">Entidades</h3>
        <span className="text-cyan-600 text-2xl md:text-3xl font-semibold"> {/* Número total más grande */}
          {totalEntities}
        </span>
      </div>

      {/* Sección Central: Iconos + Números (Centrados y con más peso) */}
      <div className="flex-grow flex items-center justify-center">
        <div className="flex items-end justify-center flex-wrap gap-x-6 sm:gap-x-8 gap-y-4"> {/* Aumentado gap, items-end para alinear por la base */}
          {itemsToShow.length > 0 ? (
             itemsToShow.map(([type, count]) => (
                <div key={type} className="flex items-center gap-2" title={`${type}: ${count}`}> {/* Ajustado gap */}
                  <FontAwesomeIcon
                    icon={typeIconMap[type]}
                    className="w-6 h-6 sm:w-7 sm:h-7 text-cyan-500" // Icono más grande
                  />
                  <span className="text-xl sm:text-2xl font-semibold text-gray-700">{count}</span> {/* Número más grande */}
                </div>
            ))
          ) : (
            <span className="text-sm text-gray-400 italic">No hay entidades</span>
          )}
        </div>
      </div>
       {/* Sección Inferior: Eliminada o vacía */}
       <div className="flex-shrink-0 h-2"></div> {/* Espacio mínimo al final */}
    </div>
  );
}