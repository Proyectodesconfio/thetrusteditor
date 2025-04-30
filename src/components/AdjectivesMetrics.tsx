// src/components/AdjectivesMetrics.tsx
import React, { useMemo } from 'react'; // Asegúrate que useMemo esté importado
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFont } from '@fortawesome/free-solid-svg-icons';
import type { Article, ArticleAnalysisMetrics } from '../types';

// --- Tipos Locales y Mapeos ---
interface AdjectivesMetricsProps {
  metrics: ArticleAnalysisMetrics | undefined | null;
  adjectives?: Article['adjectives'] | undefined | null;
}

const featureKeyTranslations: Record<string, string> = {
    Gender: 'Género', Number: 'Número', Degree: 'Grado', VerbForm: 'Forma Verbal', NumType: 'Tipo Numérico',
};
const featureValueTranslations: Record<string, Record<string, string>> = {
    Gender: { Masc: 'Masculino', Fem: 'Femenino', Neut: 'Neutro' },
    Number: { Sing: 'Singular', Plur: 'Plural' },
    Degree: { Pos: 'Positivo', Cmp: 'Comparativo', Sup: 'Superlativo', Abs: 'Absoluto' },
    VerbForm: { Part: 'Participio' },
    NumType: { Ord: 'Ordinal', Card: 'Cardinal' }
};

/**
 * Componente que muestra métricas y detalles sobre los adjetivos encontrados en un artículo.
 */
export default function AdjectivesMetrics({ metrics, adjectives }: AdjectivesMetricsProps) {
  // --- Cálculos y Preparación de Datos ---
  const numAdjectives = metrics?.adjectives?.num_adjectives?.value ?? 0;
  const percAdjectives = (metrics?.adjectives?.perc_adjectives?.value ?? 0) * 100;

  // --- CORRECCIÓN: Simplificar obtención y memoización de sortedAdjectivesFreq ---
  // 1. Obtener el array de frecuencias de forma segura fuera del useMemo
  const currentAdjectivesFreq = adjectives?.adjectives_freq || [];

  // 2. Memoizar el array ordenado, dependiendo del array obtenido arriba
  const sortedAdjectivesFreq = useMemo(() => {
      // Crear una copia antes de ordenar para no mutar el original (si viniera de state/props complejos)
      return [...currentAdjectivesFreq].sort((a, b) => b[1] - a[1]);
  }, [currentAdjectivesFreq]); // Depender del array resuelto

  // --- Fin Corrección ---


  // Calcular conteos para cada valor de cada característica lingüística
  const featureCounts = useMemo(() => {
    if (!adjectives?.adjectives_list) return {};
    const counts = adjectives.adjectives_list.reduce((acc, adj) => {
      Object.entries(adj.features || {}).forEach(([featureKey, featureValue]) => {
        if (!featureValue) return;
        const valueKey = featureValue as string;
        if (!acc[featureKey]) acc[featureKey] = {};
        if (!acc[featureKey][valueKey]) acc[featureKey][valueKey] = 0;
        acc[featureKey][valueKey]++;
      });
      return acc;
    }, {} as Record<string, Record<string, number>>);
    return counts;
  }, [adjectives?.adjectives_list]);

  // --- Renderizado ---
  return (
    <div className="bg-white rounded-lg p-4 md:p-6 shadow-sm border">
      {/* Card Header */}
      <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2 mb-4">
        <FontAwesomeIcon icon={faFont} className="text-purple-500"/>
        Adjetivos
      </h3>

      {/* General Metrics Section */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-sm mb-1">
          <span className="text-gray-700">{numAdjectives} Adjetivos</span>
          <span className="text-purple-600 font-medium">({percAdjectives.toFixed(1)}%)</span>
        </div>
        <div className="bg-purple-100 rounded-full h-2 w-full overflow-hidden">
          <div
            className="h-2 bg-purple-500 rounded-full transition-width duration-300 ease-in-out"
            style={{ width: `${Math.min(percAdjectives, 100)}%` }}
          />
        </div>
      </div>

      {/* Linguistic Features Breakdown Section */}
      {Object.keys(featureCounts).length > 0 && (
          <div className="space-y-4 mb-6 border-t pt-4">
            {Object.entries(featureCounts)
                .map(([featureKey, values]) => (
                <div key={featureKey}>
                    <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                        {featureKeyTranslations[featureKey] || featureKey}
                    </h4>
                    <div className="flex flex-wrap gap-2">
                    {Object.entries(values)
                        .sort(([, countA], [, countB]) => countB - countA)
                        .map(([valueKey, count]: [string, number]) => (
                        <div key={valueKey} className="flex items-center justify-between text-xs bg-purple-50 p-1.5 rounded-md min-w-[80px] flex-grow sm:flex-grow-0">
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

      {/* Most Frequent Adjectives Section */}
      {sortedAdjectivesFreq.length > 0 && (
          <div className="border-t pt-4">
              <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">Más Frecuentes</h4>
              <div className="space-y-1.5">
                  {sortedAdjectivesFreq.slice(0, 5).map(([adjective, count]: [string, number], index: number) => (
                      <div key={`${adjective}-${index}`} className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">{adjective}</span>
                          <span className="text-purple-600 font-medium">{count}</span>
                      </div>
                  ))}
              </div>
          </div>
      )}
    </div> // End Card container
  );
}