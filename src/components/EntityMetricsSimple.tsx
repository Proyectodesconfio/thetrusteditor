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

  const maxItemsToShow = 4; // Mantener límite opcional
  const itemsToShow = sortedCounts.slice(0, maxItemsToShow);

  return (
    // Contenedor principal con flex-col
    <div className="bg-white rounded-lg p-4 md:p-6 shadow-sm border flex flex-col h-full min-h-[180px]">

      {/* Sección Superior: Título y Total */}
      <div className="flex justify-between items-start mb-4 flex-shrink-0"> {/* Añadido flex-shrink-0 */}
        <h3 className="text-lg md:text-xl font-medium text-gray-800">Entidades</h3>
        <span className="text-cyan-600 text-2xl font-semibold">
          {totalEntities}
        </span>
      </div>

      {/* Sección Central: Iconos + Números (Ocupa espacio restante) */}
      {/* Se añade flex-grow aquí para centrar el contenido verticalmente */}
      <div className="flex-grow flex items-center justify-center">
        {/* Contenedor interno para aplicar gap y flex-wrap */}
        <div className="flex items-center justify-center flex-wrap gap-x-5 gap-y-3"> {/* Ajustado gap */}
          {itemsToShow.length > 0 ? (
             itemsToShow.map(([type, count]) => (
                <div key={type} className="flex items-center gap-1.5" title={`${type}: ${count}`}> {/* CAMBIO: Icono al lado del número */}
                  <FontAwesomeIcon
                    icon={typeIconMap[type]}
                    className="w-5 h-5 text-cyan-500" // Tamaño icono ajustado
                  />
                  <span className="text-base font-medium text-gray-700">{count}</span> {/* Tamaño número ajustado */}
                </div>
            ))
          ) : (
            <span className="text-sm text-gray-400">No se encontraron entidades</span>
          )}
        </div>
      </div>
       {/* Sección Inferior: Vacía */}
       <div className="flex-shrink-0 h-4"></div> {/* Espacio pequeño opcional al final */}
    </div>
  );
}