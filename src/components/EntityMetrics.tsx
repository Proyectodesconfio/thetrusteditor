// src/components/EntityMetrics.tsx
import { useState, useMemo, useEffect } from 'react'; // 'React' import REMOVED
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUser,
  faLocationDot,
  faCalendarDays,
  faBuilding,
  faEllipsis,
  faChevronDown
} from '@fortawesome/free-solid-svg-icons';
import type { Article } from '../types';

interface EntityMetricsProps {
  entities: Article['entities'];
}

// Mapeo de tipos de entidad a su configuración de icono y etiqueta
const typeConfig: Record<string, { icon: any; label: string }> = {
  Persona: { icon: faUser, label: "Personas" },
  Lugar: { icon: faLocationDot, label: "Lugares" },
  Fecha: { icon: faCalendarDays, label: "Fechas" },
  Organización: { icon: faBuilding, label: "Organizaciones" },
  Misceláneo: { icon: faEllipsis, label: "Otros" }, // Para tipos no mapeados o genéricos
};

export default function EntityMetrics({ entities }: EntityMetricsProps) {
  // Estado para controlar qué secciones (tipos de entidad) están expandidas
  const [expandedState, setExpandedState] = useState<Record<string, boolean>>({});

  // Memoización para calcular los datos de entidades solo cuando la prop 'entities' cambia
  const { totalEntities, sortedCategories, entityDetailsByType } = useMemo(() => {
    const countsByType: Record<string, number> = {};
    const detailsByType: Record<string, Record<string, number>> = {};
    let total = 0;

    // Inicializar contadores para todos los tipos definidos en typeConfig
    Object.keys(typeConfig).forEach(type => {
        countsByType[type] = 0;
        detailsByType[type] = {};
    });

    if (entities?.entities_list) {
      total = entities.entities_list.length;
      entities.entities_list.forEach(entity => {
        // Usar el tipo de entidad o 'Misceláneo' si el tipo no está en typeConfig
        const currentEntityType = typeConfig[entity.type] ? entity.type : 'Misceláneo';

        countsByType[currentEntityType]++;
        detailsByType[currentEntityType][entity.text] = (detailsByType[currentEntityType][entity.text] || 0) + 1;
      });
    }

    // Filtrar categorías que tienen al menos una entidad y ordenarlas por cantidad descendente
    const categoriesWithData = Object.entries(countsByType)
      .filter(([, count]) => count > 0)
      .sort(([, countA], [, countB]) => countB - countA);

    return {
        totalEntities: total,
        sortedCategories: categoriesWithData,
        entityDetailsByType: detailsByType
    };
  }, [entities]);

  // Efecto para inicializar el estado de expansión: todas las secciones con datos se expanden por defecto
  useEffect(() => {
    const initialExpandedState: Record<string, boolean> = {};
    sortedCategories.forEach(([type]) => {
      initialExpandedState[type] = true; // Expandir por defecto
    });
    setExpandedState(initialExpandedState);
  }, [sortedCategories]); // Se ejecuta si la lista de categorías calculada cambia

  // Función para alternar el estado de expansión de una sección
  const toggleSection = (type: string) => {
    setExpandedState(prevState => ({
      ...prevState,
      [type]: !prevState[type],
    }));
  };

  // Si no hay entidades en total, se podría mostrar un mensaje o nada
  if (totalEntities === 0 && !entities?.entities_list) { // Chequeo más robusto
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
          const config = typeConfig[type as keyof typeof typeConfig] || typeConfig['Misceláneo']; // Obtener config o fallback
          const sortedEntitiesDetails = Object.entries(entityDetailsByType[type])
            .sort(([, countA], [, countB]) => countB - countA)
            .slice(0, 15); // Limitar a mostrar, por ejemplo, las 15 entidades más frecuentes por tipo

          if (sortedEntitiesDetails.length === 0 && count === 0) return null; // No mostrar si no hay datos

          const percentage = totalEntities > 0 ? (count / totalEntities) * 100 : 0;
          const isExpanded = expandedState[type] ?? false;

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
                    icon={faChevronDown}
                    className={`w-4 h-4 transition-transform duration-200 ease-in-out text-gray-400 ${
                      isExpanded ? 'rotate-180' : '' // Quitado rotate-0 para estado por defecto
                    }`}
                  />
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1"> {/* Ajustado color de fondo barra */}
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
                  className="p-3 md:p-4 border-t border-gray-200 bg-white"
                >
                   <div className="flex flex-wrap gap-x-3 gap-y-1.5 text-sm text-gray-700"> {/* Ajustado gap */}
                      {sortedEntitiesDetails.length > 0 ? (
                        sortedEntitiesDetails.map(([name, entityCount]) => (
                          <span key={`${type}-${name}`} className="whitespace-nowrap bg-gray-100 px-2 py-0.5 rounded-md"> {/* Estilo de tag */}
                             {name} <span className="text-xs text-cyan-600 font-medium">({entityCount})</span>
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-gray-500 italic">No hay detalles específicos para mostrar.</span>
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