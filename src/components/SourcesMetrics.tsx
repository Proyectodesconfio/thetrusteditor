// src/components/SourcesMetrics.tsx
import { useState } from 'react'; // Importar useState
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faQuoteLeft, faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';
import type { Article } from '../types';

interface SourcesMetricsProps {
  metrics: Article['metrics'];
  sources?: Article['sources']; // Array de SourceCitation[]
}

/**
 * Componente para la barra lateral que muestra el número total de citas de forma destacada
 * y una lista desplegable de las citas textuales encontradas en el artículo.
 */
export default function SourcesMetrics({ metrics, sources }: SourcesMetricsProps) {
  // Estado para controlar si la lista de citas textuales está expandida
  const [isCitationsExpanded, setIsCitationsExpanded] = useState(false);

  // Obtener el número total de citas (afirmaciones)
  const totalCitas = metrics?.sources?.num_afirmaciones?.value ?? 0;

  // Determinar el color para el número total de citas
  const numberColorClass = totalCitas < 3 ? 'text-red-600' : 'text-green-600';

  // Si no hay métricas de fuentes, podríamos mostrar un mensaje o nada.
  // Para este rediseño, mostraremos el total de citas incluso si es 0.
  // const sourcesMetricsData = metrics?.sources;
  // if (!sourcesMetricsData && (!sources || sources.length === 0)) { // Si no hay NADA de fuentes
  //   return (
  //       <div className="bg-white rounded-lg p-4 md:p-6 shadow-sm border">
  //           <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2 mb-2">
  //               <FontAwesomeIcon icon={faQuoteLeft} className="text-amber-500"/>
  //               Fuentes
  //           </h3>
  //           <p className="text-sm text-gray-500 italic">No hay datos de fuentes disponibles.</p>
  //       </div>
  //   );
  // }

  const toggleCitationsExpansion = () => {
    setIsCitationsExpanded(!isCitationsExpanded);
  };

  const hasTextualCitations = Array.isArray(sources) && sources.length > 0;

  return (
    <div className="bg-white rounded-lg p-4 md:p-6 shadow-sm border flex flex-col min-h-[180px] justify-between"> {/* min-h para consistencia con otras tarjetas */}
      {/* Sección Superior: Título */}
      <div className="flex justify-between items-center mb-3 flex-shrink-0">
        <h3 className="text-lg md:text-xl font-semibold text-gray-800">Fuentes</h3>
        {/* Icono opcional si se quiere mantener algo al lado del título */}
        {/* <FontAwesomeIcon icon={faQuoteLeft} className="w-5 h-5 text-amber-500" /> */}
      </div>

      {/* Sección Central: Número Grande y Coloreado de Citas */}
      <div className="flex-grow flex items-center justify-center my-4"> {/* my-4 para espaciado */}
        <span className={`text-5xl lg:text-6xl font-bold ${numberColorClass}`}>
          {totalCitas}
        </span>
      </div>

      {/* Sección Inferior: Botón Desplegable para "Citas en el Texto" */}
      {/* Solo mostrar si hay citas textuales */}
      {hasTextualCitations && (
        <div className="mt-auto pt-4 border-t border-gray-200 flex-shrink-0">
          <button
            onClick={toggleCitationsExpansion}
            className="w-full flex items-center justify-between text-sm font-medium text-gray-700 hover:text-amber-600 focus:outline-none focus-visible:text-amber-600"
            aria-expanded={isCitationsExpanded}
            aria-controls="textual-citations-list"
          >
            <span>Citas en el Texto ({sources.length})</span>
            <FontAwesomeIcon
              icon={isCitationsExpanded ? faChevronUp : faChevronDown}
              className="w-3.5 h-3.5 transition-transform"
            />
          </button>

          {/* Lista Desplegable de Citas Textuales */}
          {isCitationsExpanded && (
            <div id="textual-citations-list" className="mt-3 space-y-3 max-h-60 overflow-y-auto pr-2"> {/* max-h y overflow */}
              {sources.slice(0, 10).map((source, index) => ( // Limitar para no hacerla muy larga
                <div key={`${source.start_char}-${index}`} className="text-xs border-l-4 ${totalCitas < 3 ? 'border-red-400 bg-red-50' : 'border-green-400 bg-green-50'} pl-2.5 pr-1 py-2 rounded-r-md">
                  {source.text && (
                    <blockquote className="italic text-gray-800 leading-normal">
                      "{source.text}"
                    </blockquote>
                  )}
                  {source.components?.referenciado?.text && (
                    <p className={`text-xs ${totalCitas < 3 ? 'text-red-700' : 'text-green-700'} mt-1 font-medium text-right`}>
                      — {source.components.referenciado.text}
                    </p>
                  )}
                </div>
              ))}
              {sources.length > 10 && (
                <p className="text-xs text-gray-500 text-center pt-1">Y {sources.length - 10} más...</p>
              )}
            </div>
          )}
        </div>
      )}
      {/* Si no hay citas textuales, pero sí un totalCitas > 0, podríamos mostrar un texto simple */}
      {!hasTextualCitations && totalCitas > 0 && (
         <p className="text-xs text-gray-400 text-center mt-auto pt-4 border-t border-gray-200 flex-shrink-0">
            {totalCitas === 1 ? '1 cita identificada (sin detalle textual aquí).' : `${totalCitas} citas identificadas (sin detalle textual aquí).`}
        </p>
      )}
       {/* Si totalCitas es 0, el número grande lo indicará */}
    </div>
  );
}