// src/components/HomeMetrics.tsx
import React, { useMemo } from 'react'; // Import useMemo
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// Importar solo los iconos necesarios
import {
  faUser, faLocationDot, faCalendarDays, faBuilding, faFont,
  faLink, faQuoteLeft, faEllipsis, faCheck, faClock, faWarning,
  faNewspaper,
} from '@fortawesome/free-solid-svg-icons';
import * as d3 from 'd3'; // Necesario para median/max

// --- Type Imports ---
// Importar los tipos centrales necesarios
import type { Article, GlobalMetrics, ArticleAnalysisMetrics } from '../types';

// --- Internal Component Imports ---
// Asumiendo que este componente existe y funciona correctamente
import { AdjectivesHistogram } from './AdjectiveCharts';

// --- Configuration Objects ---
// Mantener las configuraciones para mapear claves a iconos/colores
const typeConfig = {
  Personas:       { icon: faUser,         color: 'text-cyan-500',  bgColor: 'bg-cyan-100'   },
  Lugares:        { icon: faLocationDot,  color: 'text-cyan-500',  bgColor: 'bg-cyan-100'   },
  Otros:          { icon: faCalendarDays, color: 'text-cyan-500',  bgColor: 'bg-cyan-100'   },
  Organizaciones: { icon: faBuilding,     color: 'text-cyan-500',  bgColor: 'bg-cyan-100'   },
} as const;
type EntityKey = keyof typeof typeConfig;

const sourceConfig = {
  Links:      { icon: faLink,      color: 'text-amber-700', bgColor: 'bg-amber-100' },
  Dichos:     { icon: faQuoteLeft, color: 'text-amber-700', bgColor: 'bg-amber-100' },
  Textuales:  { icon: faCalendarDays, color: 'text-amber-700', bgColor: 'bg-amber-100' },
  Otros:      { icon: faEllipsis,   color: 'text-amber-700', bgColor: 'bg-amber-100' },
} as const;
type SourceKey = keyof typeof sourceConfig;

// ** MODIFICADO: Usar claves de GlobalMetrics y añadir labels **
const statusDisplayConfig = {
  authors:    { label: 'Autores',      icon: faUser,      color: 'text-blue-600' },
  articles:   { label: 'Artículos',    icon: faNewspaper, color: 'text-indigo-600' },
  reviewed:   { label: 'Revisados',    icon: faCheck,     color: 'text-green-600' },
  pending:    { label: 'Pendientes',   icon: faClock,     color: 'text-amber-600' }, // Consistent amber color
  unreviewed: { label: 'Sin revisión', icon: faWarning,   color: 'text-red-500' },
} as const;
// Claves que se mostrarán en el sub-panel de estado
type StatusMetricKey = 'reviewed' | 'pending' | 'unreviewed';

// --- Component Props ---
interface HomeMetricsProps {
  /** Lista de artículos YA FILTRADOS por fecha/autor/sección desde el componente padre. */
  articles: Article[];
  /** Métricas globales YA CALCULADAS por el componente padre. */
  metrics: GlobalMetrics;
}

/**
 * Componente que muestra un dashboard de métricas agregadas (Entidades, Adjetivos, Fuentes, Estadísticas Generales)
 * basado en una lista de artículos y métricas pre-calculadas.
 */
export default function HomeMetrics({ articles, metrics }: HomeMetricsProps) {

  // --- 1. Cálculos de Desglose (requieren iterar 'articles') ---

  /** Calcula el conteo de cada tipo de entidad. */
  const entityMetrics = useMemo(() => {
    const counts: Record<EntityKey, number> = { Personas: 0, Lugares: 0, Otros: 0, Organizaciones: 0 };
    articles.forEach(article => {
      article.entities?.entities_list?.forEach(entity => {
        switch (entity.type) { // Asume que entity.type coincide con las claves de typeConfig
          case 'Persona': counts.Personas++; break;
          case 'Lugar': counts.Lugares++; break;
          case 'Organización': counts.Organizaciones++; break;
          case 'Misceláneo': counts.Otros++; break; // Ajustar si el tipo es diferente
          default: counts.Otros++; break; // Agrupar desconocidos en Otros
        }
      });
    });
    return counts;
  }, [articles]); // Depende solo de los artículos filtrados

  /** Calcula estadísticas de adjetivos (total, mediana/max % ). */
  const adjectivesStats = useMemo(() => {
    let total = 0;
    const percentages: number[] = [];
    articles.forEach(article => {
      total += article.metrics?.adjectives?.num_adjectives?.value ?? 0;
      const percValue = article.metrics?.adjectives?.perc_adjectives?.value;
      if (typeof percValue === 'number') percentages.push(percValue * 100);
    });
    return {
      total,
      median: (d3.median(percentages) ?? 0).toFixed(1),
      max: (d3.max(percentages) ?? 0).toFixed(1),
    } as const;
  }, [articles]); // Depende solo de los artículos filtrados

  /** Calcula métricas de fuentes (Placeholder - Reemplazar con lógica real). */
  const sourceMetrics = useMemo(() => {
    // TODO: Reemplazar con lógica basada en article.metrics.sources o article.sources si es necesario aquí
    const counts: Record<SourceKey, number> = { Links: 0, Dichos: 0, Textuales: 0, Otros: 0 };
    articles.forEach((_article, index) => { // Lógica placeholder simple
        counts.Links += (index % 4 === 0 ? 2 : 0);
        counts.Dichos += (index % 4 === 1 ? 1 : 0);
        counts.Textuales += (index % 4 === 2 ? 3 : 0);
        counts.Otros += (index % 4 === 3 ? 1 : 0);
    });
    return counts;
  }, [articles]); // Depende solo de los artículos filtrados


  // --- 2. Totales y Formateo ---
  const entityTotal = Object.values(entityMetrics).reduce((s, c) => s + c, 0);
  const sourceTotal = Object.values(sourceMetrics).reduce((s, c) => s + c, 0);
  const formatNumber = (n: number): string => new Intl.NumberFormat('es-ES').format(n);

  // --- 3. Renderizado ---

  // Salida temprana si no hay artículos (basado en métricas pre-calculadas)
  if (metrics.articles === 0) {
    return (
      <p className="text-center text-gray-500 py-4">
        No hay artículos para mostrar con los filtros actuales.
      </p>
    );
  }

  return (
    // Grid principal para las tarjetas de métricas
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">

      {/* Tarjeta Entidades */}
      <div className="bg-white rounded-lg p-4 md:p-6 shadow-sm border"> {/* Estilo consistente */}
        <div className="flex justify-between items-center mb-4 md:mb-6">
          <h3 className="text-lg font-medium text-gray-800">Entidades</h3>
          <span className="text-cyan-600 text-2xl font-semibold">{formatNumber(entityTotal)}</span>
        </div>
        <div className="grid grid-cols-4 gap-3 md:gap-4">
          {(Object.keys(entityMetrics) as EntityKey[]).map((key) => {
            const count = entityMetrics[key];
            const pct = entityTotal ? ((count / entityTotal) * 100) : 0;
            const cfg = typeConfig[key];
            return (
              <div key={key} className="flex flex-col items-center text-center gap-1">
                <FontAwesomeIcon icon={cfg.icon} className={`w-5 h-5 ${cfg.color}`} />
                <span className="text-xs text-gray-500 mt-1">{key}</span>
                <span className="text-sm font-medium text-gray-700">{pct.toFixed(1)}%</span>
                <span className="text-xs text-gray-400">({formatNumber(count)})</span>
                <div className="w-full h-1.5 bg-gray-200 rounded-full mt-1 overflow-hidden">
                  <div className={`${cfg.bgColor} h-full rounded-full`} style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tarjeta Adjetivos */}
      <div className="bg-white rounded-lg p-4 md:p-6 shadow-sm border">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-2">
             <h3 className="text-lg font-medium text-gray-800">Adjetivos</h3>
             <FontAwesomeIcon icon={faFont} className="text-purple-500" />
          </div>
          <span className="text-purple-600 text-2xl font-semibold">{formatNumber(adjectivesStats.total)}</span>
        </div>
         {/* Asumiendo que AdjectivesHistogram espera 'articles' pre-filtrados */}
        <div className="w-full mt-2 mb-1">
          <AdjectivesHistogram articles={articles} />
        </div>
        <div className="text-xs text-gray-500 text-center">
             Mediana: {adjectivesStats.median}%
        </div>
      </div>

      {/* Tarjeta Fuentes */}
      <div className="bg-white rounded-lg p-4 md:p-6 shadow-sm border">
        <div className="flex justify-between items-center mb-4 md:mb-6">
          <h3 className="text-lg font-medium text-gray-800">Fuentes</h3>
          <span className="text-amber-700 text-2xl font-semibold">{formatNumber(sourceTotal)}</span>
        </div>
        <div className="grid grid-cols-4 gap-3 md:gap-4">
          {(Object.keys(sourceMetrics) as SourceKey[]).map((key) => {
            const count = sourceMetrics[key];
            const cfg = sourceConfig[key];
            const pct = sourceTotal ? (count / sourceTotal) * 100 : 0;
            return (
              <div key={key} className="flex flex-col items-center text-center gap-1">
                 <FontAwesomeIcon icon={cfg.icon} className={`w-4 h-4 ${cfg.color}`} />
                 <span className="text-xs text-gray-500 mt-1">{key}</span>
                 <span className="text-xs text-gray-400">({formatNumber(count)})</span>
                 <div className={`w-full ${cfg.bgColor} rounded-full h-1.5 mt-1 overflow-hidden`}>
                   <div className={`h-full ${cfg.color.replace('text', 'bg')} rounded-full`} style={{ width: `${pct}%` }} />
                 </div>
              </div>
            );
          })}
        </div>
        <p className="text-xs text-gray-400 mt-4 text-center italic">Métricas de fuentes (placeholder).</p>
      </div>

      {/* Tarjeta Estadísticas de Artículos */}
      {/* ** MODIFICADO: Usa directamente la prop 'metrics' ** */}
      <div className="md:col-span-3 bg-white rounded-lg p-4 md:p-6 shadow-sm border">
        <h3 className="text-lg font-medium text-gray-800 mb-4 md:mb-6">Estadísticas de Artículos</h3>
        {/* Grid para Autores, Artículos y el sub-panel de Estados */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 items-stretch">
          {/* Mapear Autores y Artículos desde metrics */}
          {(['authors', 'articles'] as const).map((key) => {
            const cfg = statusDisplayConfig[key];
            const value = metrics[key];
            return (
              <div key={key} className="flex flex-col items-center justify-center text-center py-4">
                <FontAwesomeIcon icon={cfg.icon} className={`w-8 h-8 ${cfg.color} mb-2`} />
                <div className="text-2xl font-semibold text-gray-900">{formatNumber(value)}</div>
                <div className="text-sm text-gray-500">{cfg.label}</div>
              </div>
            );
          })}

          {/* Sub‑panel de estados de revisión usando metrics */}
          <div className="col-span-2 sm:col-span-3 bg-gray-50 rounded-lg p-2"> {/* Ajustado span y bg */}
            <div className="grid grid-cols-3 gap-2 h-full">
              {(['reviewed', 'pending', 'unreviewed'] as StatusMetricKey[]).map((key) => {
                const cfg = statusDisplayConfig[key];
                const value = metrics[key]; // Obtener valor de la prop metrics
                return (
                  <div key={key} className="flex flex-col items-center justify-center text-center py-4 h-full"> {/* Added h-full */}
                    <FontAwesomeIcon icon={cfg.icon} className={`w-7 h-7 ${cfg.color} mb-2`} /> {/* Adjusted size */}
                    <div className="text-xl font-semibold text-gray-900">{formatNumber(value)}</div> {/* Adjusted size */}
                    <div className="text-xs text-gray-500 mt-0.5">{cfg.label}</div> {/* Adjusted size */}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

    </div> // Fin del grid principal
  );
}