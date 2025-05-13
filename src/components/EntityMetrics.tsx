// src/components/EntityMetrics.tsx
import { useState, useMemo, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUser,
  faLocationDot,
  faCalendarDays,
  faBuilding,
  faEllipsis,
  faChevronDown, // Necesitaremos faChevronUp si queremos cambiar el ícono al expandir
  // faChevronUp // Descomentar si se usa para el estado expandido
} from '@fortawesome/free-solid-svg-icons';
import type { Article } from '../types';

interface EntityMetricsProps {
  entities: Article['entities'];
}

const typeConfig: Record<string, { icon: any; label: string }> = {
  Persona: { icon: faUser, label: "Personas" },
  Lugar: { icon: faLocationDot, label: "Lugares" },
  Fecha: { icon: faCalendarDays, label: "Fechas" },
  Organización: { icon: faBuilding, label: "Organizaciones" },
  Misceláneo: { icon: faEllipsis, label: "Otros" },
};

export default function EntityMetrics({ entities }: EntityMetricsProps) {
  // Estado para controlar qué secciones están expandidas
  const [expandedState, setExpandedState] = useState<Record<string, boolean>>({}); // Inicializar como objeto vacío

  const { totalEntities, sortedCategories, entityDetailsByType } = useMemo(() => {
    const countsByType: Record<string, number> = {};
    const detailsByType: Record<string, Record<string, number>> = {};
    let total = 0;

    Object.keys(typeConfig).forEach(type => {
        countsByType[type] = 0;
        detailsByType[type] = {};
    });

    if (entities?.entities_list) {
      total = entities.entities_list.length;
      entities.entities_list.forEach(entity => {
        const currentEntityType = typeConfig[entity.type] ? entity.type : 'Misceláneo';
        countsByType[currentEntityType]++;
        detailsByType[currentEntityType][entity.text] = (detailsByType[currentEntityType][entity.text] || 0) + 1;
      });
    }

    const categoriesWithData = Object.entries(countsByType)
      .filter(([, count]) => count > 0)
      .sort(([, countA], [, countB]) => countB - countA);

    return {
        totalEntities: total,
        sortedCategories: categoriesWithData,
        entityDetailsByType: detailsByType
    };
  }, [entities]);

  // --- MODIFICADO: Efecto para Inicializar Estado de Expansión ---
  // Ahora inicializa todas las secciones como COLAPSADAS (false)
  useEffect(() => {
    const initialExpandedState: Record<string, boolean> = {};
    sortedCategories.forEach(([type]) => {
      initialExpandedState[type] = false; // Colapsado por defecto
    });
    setExpandedState(initialExpandedState);
  }, [sortedCategories]); // Solo depende de sortedCategories para la inicialización

  const toggleSection = (type: string) => {
    setExpandedState(prevState => ({
      ...prevState,
      [type]: !prevState[type],
    }));
  };

  if (totalEntities === 0 && (!entities?.entities_list || entities.entities_list.length === 0)) { // Condición más precisa
    return (
        <div className="bg-white rounded-lg p-4 md:p-6 shadow-sm border">
            <h3 className="text-lg md:text-xl font-medium text-gray-800 mb-2">Entidades</h3>
            <p className="text-sm text-gray-500 italic">No se encontraron entidades en este artículo.</p>
        </div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-4 md:p-6 shadow-sm border">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg md:text-xl font-medium text-gray-800">Entidades</h3>
        <span className="text-cyan-600 text-2xl font-semibold">{totalEntities}</span>
      </div>

      <div className="space-y-3">
        {sortedCategories.map(([type, count]) => {
          const config = typeConfig[type as keyof typeof typeConfig] || typeConfig['Misceláneo'];
          // --- MODIFICADO: No limitar con .slice() ---
          const sortedEntitiesDetails = Object.entries(entityDetailsByType[type])
            .sort(([, countA], [, countB]) => countB - countA);
            // .slice(0, 15); // ELIMINADO LÍMITE

          // No renderizar la sección si el tipo no tiene entidades,
          // aunque sortedCategories ya debería haber filtrado esto. Doble chequeo.
          if (count === 0) return null;

          const percentage = totalEntities > 0 ? (count / totalEntities) * 100 : 0;
          const isExpanded = expandedState[type] ?? false; // Default a false si aún no está en el estado

          return (
            <div key={type} className="border border-gray-200 rounded-lg overflow-hidden shadow-sm">
              <button
                onClick={() => toggleSection(type)}
                className="w-full flex flex-col p-3 md:p-4 bg-gray-50 hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-1 transition-colors duration-150"
                aria-expanded={isExpanded}
                aria-controls={`entity-details-${type}`}
              >
                <div className="flex items-center justify-between w-full mb-2">
                  <div className="flex items-center gap-2 text-left">
                    <FontAwesomeIcon
                      icon={config.icon}
                      className="w-5 h-5 text-cyan-500 flex-shrink-0"
                    />
                    <span className="font-medium text-sm md:text-base text-gray-800">
                      {config.label}
                    </span>
                    <span className="text-gray-500 text-sm ml-1">({count})</span>
                  </div>
                  <FontAwesomeIcon
                    icon={faChevronDown} // Podrías usar faChevronUp si isExpanded es true
                    className={`w-4 h-4 transition-transform duration-200 ease-in-out text-gray-400 ${
                      isExpanded ? 'rotate-180' : ''
                    }`}
                  />
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                  <div
                    className="h-full bg-cyan-500 rounded-full transition-all duration-300"
                    style={{ width: `${percentage}%` }}
                    title={`${percentage.toFixed(1)}% de todas las entidades`}
                  />
                </div>
              </button>

              {isExpanded && (
                <div
                  id={`entity-details-${type}`}
                  className="p-3 md:p-4 border-t border-gray-200 bg-white max-h-72 overflow-y-auto" // Añadido max-h y overflow-y-auto
                >
                   <div className="flex flex-wrap gap-x-3 gap-y-1.5 text-sm text-gray-700">
                      {sortedEntitiesDetails.length > 0 ? (
                        sortedEntitiesDetails.map(([name, entityCount]) => (
                          <span key={`${type}-${name}-${entityCount}`} className="whitespace-nowrap bg-gray-100 px-2 py-0.5 rounded-md hover:bg-gray-200 transition-colors"> {/* Estilo de tag mejorado */}
                             {name} <span className="text-xs text-cyan-600 font-medium">({entityCount})</span>
                          </span>
                        ))
                      ) : (
                        // Este caso no debería ocurrir si count > 0
                        <span className="text-xs text-gray-500 italic">No hay detalles específicos para este tipo.</span>
                      )}
                   </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}