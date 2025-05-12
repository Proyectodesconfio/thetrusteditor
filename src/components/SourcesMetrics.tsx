// src/components/SourcesMetrics.tsx
// import React from 'react'; // No es estrictamente necesario si solo se usa JSX
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faQuoteLeft } from '@fortawesome/free-solid-svg-icons';
import type { Article } from '../types'; // ArticleAnalysisMetrics REMOVED from import

interface SourcesMetricsProps {
  /** Métricas de análisis del artículo, que incluyen las métricas de fuentes. */
  metrics: Article['metrics']; // Es ArticleAnalysisMetrics | undefined
  /** Array opcional con los detalles de cada cita encontrada en el texto. */
  sources?: Article['sources']; // Es SourceCitation[] | undefined
}

/**
 * Componente para la barra lateral que muestra métricas detalladas sobre las fuentes
 * y una lista de las citas textuales encontradas en el artículo.
 */
export default function SourcesMetrics({ metrics, sources }: SourcesMetricsProps) {
  // Si no hay datos de métricas de fuentes, no renderizar el componente.
  // Accedemos a la propiedad `sources` dentro de `metrics`.
  const sourcesMetricsData = metrics?.sources; // Esto será de tipo SourceMetrics | undefined
  if (!sourcesMetricsData) {
    return (
        <div className="bg-white rounded-lg p-4 md:p-6 shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2 mb-2">
                <FontAwesomeIcon icon={faQuoteLeft} className="text-amber-500"/>
                Fuentes
            </h3>
            <p className="text-sm text-gray-500 italic">No hay métricas de fuentes disponibles.</p>
        </div>
    );
  }

  // Array para facilitar el renderizado de las métricas numéricas
  const metricsToDisplay = [
    // Asegúrate de que las claves (ej. 'num_afirmaciones') coincidan con tu tipo SourceMetrics
    {
      key: 'num_afirmaciones',
      label: 'Citas Identificadas',
      value: sourcesMetricsData.num_afirmaciones?.value ?? 0 // Usar ?? 0 como fallback
    },
    {
      key: 'num_afirmaciones_explicitas',
      label: 'Citas Explícitas',
      value: sourcesMetricsData.num_afirmaciones_explicitas?.value ?? 0
    },
    {
      key: 'num_conectores',
      label: 'Conectores Usados', // Etiqueta un poco más descriptiva
      value: sourcesMetricsData.num_conectores?.value ?? 0
    },
    {
      key: 'num_conectores_unique',
      label: 'Conectores Únicos',
      value: sourcesMetricsData.num_conectores_unique?.value ?? 0
    },
    {
      key: 'num_referenciados',
      label: 'Fuentes Referenciadas', // Etiqueta un poco más descriptiva
      value: sourcesMetricsData.num_referenciados?.value ?? 0
    },
    {
      key: 'num_referenciados_unique',
      label: 'Fuentes Únicas Ref.', // Abreviado para espacio
      value: sourcesMetricsData.num_referenciados_unique?.value ?? 0
    }
  ].filter(metric => typeof metric.value === 'number'); // Filtrar métricas que podrían no existir en los datos

  // Total de citas para mostrar en la cabecera
  const totalCitas = sourcesMetricsData.num_afirmaciones?.value ?? 0;

  return (
    <div className="bg-white rounded-lg p-4 md:p-6 shadow-sm border"> {/* Estilo de tarjeta consistente */}
      {/* Cabecera de la Tarjeta */}
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg md:text-xl font-medium text-gray-800">Fuentes</h3> {/* Título */}
        <div className="flex items-center gap-2">
          <FontAwesomeIcon icon={faQuoteLeft} className="w-5 h-5 text-amber-600" /> {/* Color ajustado */}
          <span className="text-amber-600 text-2xl font-semibold">{totalCitas}</span> {/* Color ajustado */}
        </div>
      </div>

      {/* Contenedor para las Métricas Numéricas */}
      {metricsToDisplay.length > 0 && (
        <div className="border border-gray-200 rounded-lg p-3 md:p-4 mb-6"> {/* Estilo contenedor métricas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2"> {/* Responsive grid */}
            {metricsToDisplay.map((metric) => (
                <div key={metric.key} className="flex justify-between items-center py-1">
                <span className="text-sm text-gray-600">{metric.label}:</span> {/* Añadido ':' */}
                <span className="text-amber-700 font-medium text-sm">{metric.value}</span> {/* Color ajustado */}
                </div>
            ))}
            </div>
        </div>
      )}


      {/* Sección para mostrar las citas textuales (si existen) */}
      {Array.isArray(sources) && sources.length > 0 && (
        <div className="mt-4"> {/* Reducido margen si metricsToDisplay no se muestra */}
          <h4 className="text-sm font-semibold text-gray-700 mb-3 border-t pt-4">Citas en el Texto</h4> {/* Título sección y línea divisoria */}
          <div className="space-y-4"> {/* Más espacio entre citas */}
            {sources.slice(0, 5).map((source, index) => ( // Limitar a 5 citas para no alargar mucho
              <div key={`${source.start_char}-${index}`} className="text-sm border-l-4 border-amber-400 pl-3 py-1 bg-amber-50 rounded-r-md"> {/* Estilo de cada cita */}
                {/* Mostrar el texto completo de la cita */}
                {source.text && ( // Solo mostrar si 'text' existe
                  <blockquote className="text-gray-700 italic leading-relaxed">
                    "{source.text}"
                  </blockquote>
                )}
                {/* Mostrar la fuente referenciada si existe */}
                {source.components?.referenciado?.text && (
                  <p className="text-xs text-amber-700 mt-1 font-medium text-right">
                    — {source.components.referenciado.text}
                  </p>
                )}
                 {/* Opcional: Mostrar conector
                 {source.components?.conector?.text && (
                  <p className="text-gray-500 text-xs mt-1">
                    Conector: {source.components.conector.text}
                  </p>
                )} */}
              </div>
            ))}
            {sources.length > 5 && (
                <p className="text-xs text-gray-500 text-center mt-2">Y {sources.length - 5} más...</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}