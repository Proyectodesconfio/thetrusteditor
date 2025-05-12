// src/components/AdjectivesMetrics.tsx
import { useMemo } from 'react'; // 'React' import REMOVED, useMemo se importa directamente
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFont } from '@fortawesome/free-solid-svg-icons';
import type { Article, ArticleAnalysisMetrics } from '../types';

// --- Tipos y Mapeos para Características Lingüísticas ---
interface AdjectivesMetricsProps {
  /** Métricas de análisis del artículo (contiene num_adjectives, perc_adjectives). */
  metrics: ArticleAnalysisMetrics | undefined | null;
  /** Datos detallados de adjetivos (lista y frecuencia). */
  adjectives?: Article['adjectives'] | undefined | null;
}

// Traducciones para las claves de las características (ej. 'Gender' -> 'Género')
const featureKeyTranslations: Record<string, string> = {
    Gender: 'Género',
    Number: 'Número',
    Degree: 'Grado',
    VerbForm: 'Forma Verbal',
    NumType: 'Tipo Numérico',
    // Añadir más si es necesario
};

// Traducciones para los valores de las características (ej. 'Masc' -> 'Masculino')
const featureValueTranslations: Record<string, Record<string, string>> = {
    Gender: { Masc: 'Masculino', Fem: 'Femenino', Neut: 'Neutro' },
    Number: { Sing: 'Singular', Plur: 'Plural' },
    Degree: { Pos: 'Positivo', Cmp: 'Comparativo', Sup: 'Superlativo', Abs: 'Absoluto' },
    VerbForm: { Part: 'Participio' }, // Solo Participio como ejemplo, añadir otros si existen
    NumType: { Ord: 'Ordinal', Card: 'Cardinal' }
    // Añadir más valores si es necesario
};

/**
 * Componente para la barra lateral que muestra métricas detalladas y características
 * sobre los adjetivos encontrados en un artículo.
 */
export default function AdjectivesMetrics({ metrics, adjectives }: AdjectivesMetricsProps) {
  // --- Extracción de Métricas Generales ---
  const numAdjectives = metrics?.adjectives?.num_adjectives?.value ?? 0;
  const percAdjectives = (metrics?.adjectives?.perc_adjectives?.value ?? 0) * 100; // Convertir a porcentaje

  // --- Procesamiento de Frecuencia de Adjetivos ---
  // Obtener el array de frecuencias de forma segura
  const currentAdjectivesFreq = adjectives?.adjectives_freq || [];
  // Memoizar la lista ordenada de adjetivos por frecuencia (descendente)
  const sortedAdjectivesFreq = useMemo(() => {
      return [...currentAdjectivesFreq].sort((a, b) => b[1] - a[1]); // b[1] - a[1] para orden descendente
  }, [currentAdjectivesFreq]);

  // --- Procesamiento de Características Lingüísticas ---
  // Memoizar el conteo de cada valor para cada característica lingüística
  const featureCounts = useMemo(() => {
    if (!adjectives?.adjectives_list || adjectives.adjectives_list.length === 0) {
        return {}; // Devolver objeto vacío si no hay lista de adjetivos
    }
    const counts: Record<string, Record<string, number>> = {}; // Tipado explícito para 'counts'
    adjectives.adjectives_list.forEach(adj => {
      // Iterar sobre las características del adjetivo (si existen)
      Object.entries(adj.features || {}).forEach(([featureKey, featureValue]) => {
        if (featureValue) { // Asegurar que featureValue no sea null/undefined
          const valueKey = String(featureValue); // Convertir a string por si acaso
          // Inicializar si es la primera vez que se ve esta característica/valor
          if (!counts[featureKey]) counts[featureKey] = {};
          if (!counts[featureKey][valueKey]) counts[featureKey][valueKey] = 0;
          counts[featureKey][valueKey]++; // Incrementar contador
        }
      });
    });
    return counts;
  }, [adjectives?.adjectives_list]); // Depende de la lista de adjetivos

  // --- Renderizado del Componente ---
  // No renderizar nada si no hay datos relevantes (ni métricas ni adjetivos)
  if (numAdjectives === 0 && sortedAdjectivesFreq.length === 0 && Object.keys(featureCounts).length === 0) {
    return (
        <div className="bg-white rounded-lg p-4 md:p-6 shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2 mb-2">
                <FontAwesomeIcon icon={faFont} className="text-purple-500"/>
                Adjetivos
            </h3>
            <p className="text-sm text-gray-500 italic">No se encontraron datos de adjetivos.</p>
        </div>
    );
  }


  return (
    <div className="bg-white rounded-lg p-4 md:p-6 shadow-sm border">
      {/* Cabecera de la Tarjeta */}
      <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2 mb-4">
        <FontAwesomeIcon icon={faFont} className="text-purple-500"/>
        Adjetivos
      </h3>

      {/* Sección de Métricas Generales (Conteo y Porcentaje) */}
      {(numAdjectives > 0 || percAdjectives > 0) && ( // Solo mostrar si hay algún dato
        <div className="mb-6">
            <div className="flex items-center justify-between text-sm mb-1">
            <span className="text-gray-700">{numAdjectives} Adjetivos</span>
            {/* Mostrar porcentaje solo si es mayor que cero para evitar "(0.0%)" si no hay adjetivos */}
            {percAdjectives > 0 && (
                <span className="text-purple-600 font-medium">({percAdjectives.toFixed(1)}%)</span>
            )}
            </div>
            <div className="bg-purple-100 rounded-full h-2 w-full overflow-hidden">
            <div
                className="h-2 bg-purple-500 rounded-full transition-all duration-300 ease-in-out" // Añadido transition-all
                style={{ width: `${Math.min(percAdjectives, 100)}%` }} // Limitar al 100% visualmente
                title={`${percAdjectives.toFixed(1)}% de adjetivos`}
            />
            </div>
        </div>
      )}


      {/* Sección de Desglose de Características Lingüísticas */}
      {Object.keys(featureCounts).length > 0 && (
          <div className="space-y-4 mb-6 border-t border-gray-200 pt-4"> {/* Línea divisoria */}
            {Object.entries(featureCounts)
                .map(([featureKey, values]) => (
                <div key={featureKey}>
                    <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                        {featureKeyTranslations[featureKey] || featureKey.replace(/([A-Z])/g, ' $1').trim()} {/* Fallback con espacios */}
                    </h4>
                    <div className="flex flex-wrap gap-2">
                    {Object.entries(values)
                        .sort(([, countA], [, countB]) => countB - countA) // Ordenar valores por frecuencia
                        .map(([valueKey, count]) => ( // No es necesario tipar aquí si TS infiere bien
                        <div key={valueKey} className="flex items-center justify-between text-xs bg-purple-50 hover:bg-purple-100 p-1.5 rounded-md min-w-[90px] flex-grow sm:flex-grow-0 transition-colors"> {/* Ajustado min-width y hover */}
                            <span className="text-gray-700">
                                {featureValueTranslations[featureKey]?.[valueKey] || valueKey}
                            </span>
                            <span className="text-purple-600 font-semibold ml-2">{count}</span>
                        </div>
                        ))}
                    </div>
                </div>
                ))}
          </div>
      )}

      {/* Sección de Adjetivos Más Frecuentes */}
      {sortedAdjectivesFreq.length > 0 && (
          <div className={`${Object.keys(featureCounts).length > 0 ? 'border-t border-gray-200' : ''} pt-4`}> {/* Añadir borde solo si la sección anterior existe */}
              <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">Más Frecuentes</h4>
              <div className="space-y-1.5">
                  {/* Mostrar hasta 5 adjetivos más frecuentes */}
                  {sortedAdjectivesFreq.slice(0, 5).map(([adjective, count]) => (
                      <div key={`${adjective}-${count}`} className="flex items-center justify-between text-sm"> {/* Asegurar key único */}
                          <span className="text-gray-600 capitalize">{adjective}</span> {/* Capitalizar primera letra */}
                          <span className="text-purple-600 font-medium">{count}</span>
                      </div>
                  ))}
              </div>
          </div>
      )}
    </div>
  );
}