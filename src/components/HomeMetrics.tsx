// src/components/HomeMetrics.tsx
import { useMemo } from 'react'; 
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUser, faLocationDot, faCalendarDays, faBuilding, faFont,
  faLink, faQuoteLeft, faEllipsis, faCheck, faClock, faWarning,
  faNewspaper,
} from '@fortawesome/free-solid-svg-icons';
import { median as d3Median, max as d3Max } from 'd3-array'; // Importar solo median y max

// --- Type Imports ---
import type { Article, GlobalMetrics } from '../types';

// --- Internal Component Imports ---
import { AdjectivesHistogram } from './AdjectiveCharts'; 

// --- Configuraciones de Visualización ---
// Configuración para tipos de Entidad
const typeConfig = {
  Personas:       { icon: faUser,         label: 'Personas',       color: 'text-cyan-600',   bgColor: 'bg-cyan-100'   },
  Lugares:        { icon: faLocationDot,  label: 'Lugares',        color: 'text-teal-600',   bgColor: 'bg-teal-100'   }, // Color diferenciado
  Organizaciones: { icon: faBuilding,     label: 'Organizaciones', color: 'text-sky-600',    bgColor: 'bg-sky-100'    }, // Color diferenciado
  Otros:          { icon: faEllipsis,     label: 'Otros',          color: 'text-gray-500',   bgColor: 'bg-gray-100'   }, // Ajustado 'Otros' para usar faEllipsis
  // Se eliminó 'Fecha' de typeConfig ya que no se usa en la lógica de entityMetrics,
  // y 'Otros' puede agrupar 'Misceláneo' y otros no especificados.
  // Si 'Fecha' es un tipo de entidad común, se puede re-añadir aquí y en la lógica.
} as const;
type EntityKey = keyof typeof typeConfig;

// Configuración para tipos de Fuente (actualmente placeholder)
const sourceConfig = {
  Links:      { icon: faLink,         label: 'Enlaces',    color: 'text-orange-600', bgColor: 'bg-orange-100' }, // Ajustado color
  Dichos:     { icon: faQuoteLeft,    label: 'Citas Dir.', color: 'text-yellow-600', bgColor: 'bg-yellow-100' }, // Ajustado color
  Textuales:  { icon: faCalendarDays, label: 'Citas Ind.', color: 'text-lime-600',   bgColor: 'bg-lime-100'   }, // Icono y color pueden variar
  Otros:      { icon: faEllipsis,     label: 'Otras',      color: 'text-gray-500',   bgColor: 'bg-gray-100'   },
} as const;
type SourceKey = keyof typeof sourceConfig;

// Configuración para las métricas de estado/generales
const statusDisplayConfig = {
  authors:    { label: 'Autores',      icon: faUser,      color: 'text-blue-600' },
  articles:   { label: 'Artículos',    icon: faNewspaper, color: 'text-indigo-600' },
  reviewed:   { label: 'Revisados',    icon: faCheck,     color: 'text-green-600' },
  pending:    { label: 'Pendientes',   icon: faClock,     color: 'text-amber-600' },
  unreviewed: { label: 'Sin revisión', icon: faWarning,   color: 'text-red-600' }, // Color ajustado para consistencia
} as const;
type StatusMetricKey = 'reviewed' | 'pending' | 'unreviewed'; // Para el sub-panel

// --- Props del Componente ---
interface HomeMetricsProps {
  /**
   * Lista de artículos ya filtrados por los criterios seleccionados en la página Home.
   * Se usa para calcular métricas dinámicas (entidades, adjetivos, fuentes).
   */
  articles: Article[];
  /**
   * Métricas globales ya calculadas por el componente padre (página Home).
   * Se usa para la tarjeta de "Estadísticas de Artículos".
   */
  metrics: GlobalMetrics;
}

/**
 * Componente dashboard que muestra tarjetas con métricas agregadas sobre los artículos:
 * Entidades, Adjetivos, Fuentes (placeholder) y Estadísticas Generales.
 * Recibe una lista de artículos filtrados y métricas globales precalculadas.
 */
export default function HomeMetrics({ articles, metrics }: HomeMetricsProps) {

  // --- 1. Cálculos de Métricas Dinámicas (basadas en la lista 'articles') ---

  /** Calcula el conteo de cada tipo de entidad y el total. */
  const { entityMetrics, entityTotal } = useMemo(() => {
    // Inicializar contadores basados en las claves de typeConfig
    const counts = Object.fromEntries(
        Object.keys(typeConfig).map(key => [key, 0])
    ) as Record<EntityKey, number>;

    let total = 0;
    articles.forEach(article => {
      article.entities?.entities_list?.forEach(entity => {
        total++; // Contar cada entidad individual para el total general de la tarjeta
        // Mapear el tipo de entidad de los datos a las claves de typeConfig
        switch (entity.type) {
          case 'Persona': counts.Personas++; break;
          case 'Lugar': counts.Lugares++; break;
          case 'Organización': counts.Organizaciones++; break;
          // Agrupar 'Misceláneo' y cualquier otro tipo no especificado en 'Otros'
          case 'Misceláneo':
          default:
            counts.Otros++; break;
        }
      });
    });
    return { entityMetrics: counts, entityTotal: total };
  }, [articles]);

  /** Calcula estadísticas de adjetivos: total, mediana y máximo del porcentaje. */
  const adjectivesStats = useMemo(() => {
    let totalAdjectivesCount = 0;
    const percentages: number[] = [];
    articles.forEach(article => {
      totalAdjectivesCount += article.metrics?.adjectives?.num_adjectives?.value ?? 0;
      const percValue = article.metrics?.adjectives?.perc_adjectives?.value;
      if (typeof percValue === 'number' && !isNaN(percValue)) {
        percentages.push(percValue * 100); // Guardar como porcentaje (0-100)
      }
    });
    return {
      total: totalAdjectivesCount,
      // Usar d3Median y d3Max importados específicamente
      median: (d3Median(percentages) ?? 0).toFixed(1),
      max: (d3Max(percentages) ?? 0).toFixed(1), // No debería ser necesario, pero por si acaso
    } as const;
  }, [articles]);

  /** Calcula métricas de fuentes (actualmente con lógica placeholder). */
  const { sourceMetrics, sourceTotal } = useMemo(() => {
    // TODO: Reemplazar con lógica real basada en article.metrics.sources (métricas de fuentes)
    // o article.sources (array de SourceCitation) según lo que se quiera mostrar.
    const counts: Record<SourceKey, number> = { Links: 0, Dichos: 0, Textuales: 0, Otros: 0 };
    let total = 0;
    articles.forEach((_article, index) => { // Lógica placeholder simple
        const linksCount = (index % 4 === 0 ? 2 : 0);
        const dichosCount = (index % 4 === 1 ? 1 : 0);
        const textualesCount = (index % 4 === 2 ? 3 : 0);
        const otrosCount = (index % 4 === 3 ? 1 : 0);
        counts.Links += linksCount;
        counts.Dichos += dichosCount;
        counts.Textuales += textualesCount;
        counts.Otros += otrosCount;
        total += linksCount + dichosCount + textualesCount + otrosCount;
    });
    return { sourceMetrics: counts, sourceTotal: total };
  }, [articles]);


  // --- 2. Formateador de Números ---
  const formatNumber = (n: number): string => {
    try {
      return new Intl.NumberFormat('es-ES').format(n);
    } catch (e) {
      return String(n); // Fallback si Intl no está disponible o falla
    }
  };

  // --- 3. Renderizado del Componente ---

  // Mensaje si no hay artículos para mostrar (basado en métricas globales)
  if (metrics.articles === 0) {
    return (
      <div className="py-8 text-center"> {/* Aumentado padding */}
        <p className="text-gray-500 italic">
          No hay artículos para mostrar con los filtros actuales.
        </p>
      </div>
    );
  }

  return (
    // Grid principal para las tarjetas de métricas
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6"> {/* Ajustado para 2 cols en md */}

      {/* Tarjeta Entidades */}
      <div className="bg-white rounded-lg p-4 md:p-5 shadow-sm border flex flex-col"> {/* Ajustado padding */}
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-base md:text-lg font-semibold text-gray-700">Entidades</h3> {/* Ajustado tamaño y color */}
          <span className={`${typeConfig.Personas.color} text-xl md:text-2xl font-bold`}>{formatNumber(entityTotal)}</span> {/* Color consistente con 'Personas' */}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4 mt-auto"> {/* Responsive cols */}
          {(Object.keys(entityMetrics) as EntityKey[]).map((key) => {
            // No mostrar si el conteo es 0 para este tipo
            if (entityMetrics[key] === 0) return null;

            const count = entityMetrics[key];
            // El porcentaje aquí es sobre el total de *este tipo* vs el total de *todas las entidades* en la tarjeta
            const pctOfCardTotal = entityTotal > 0 ? ((count / entityTotal) * 100) : 0;
            const cfg = typeConfig[key]; // Configuración específica del tipo (icono, color, etc.)
            return (
              <div key={key} className="flex flex-col items-center text-center gap-1" title={`${cfg.label}: ${count} (${pctOfCardTotal.toFixed(1)}%)`}>
                <FontAwesomeIcon icon={cfg.icon} className={`w-4 h-4 ${cfg.color}`} />
                <span className="text-xs text-gray-500 mt-0.5">{cfg.label}</span>
                <span className="text-sm font-medium text-gray-700">{formatNumber(count)}</span>
                {/* Podríamos mostrar el % aquí si es útil: <span className="text-xs text-gray-400">{pctOfCardTotal.toFixed(0)}%</span> */}
                <div className="w-full h-1.5 bg-gray-200 rounded-full mt-1 overflow-hidden">
                  <div className={`${cfg.bgColor} h-full rounded-full`} style={{ width: `${pctOfCardTotal}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tarjeta Adjetivos */}
      <div className="bg-white rounded-lg p-4 md:p-5 shadow-sm border flex flex-col"> {/* Ajustado padding */}
        <div className="flex justify-between items-center mb-3"> {/* Reducido mb */}
          <div className="flex items-center gap-2">
             <h3 className="text-base md:text-lg font-semibold text-gray-700">Adjetivos</h3>
             <FontAwesomeIcon icon={faFont} className="text-purple-500 w-4 h-4" /> {/* Tamaño consistente */}
          </div>
          <span className="text-purple-600 text-xl md:text-2xl font-bold">{formatNumber(adjectivesStats.total)}</span>
        </div>
        {/* Histograma de Adjetivos (si hay artículos) */}
        {articles.length > 0 ? (
            <div className="w-full mt-1 mb-2 flex-grow flex items-center"> {/* flex-grow para centrar histograma */}
                <AdjectivesHistogram articles={articles} />
            </div>
        ) : (
            <div className="flex-grow flex items-center justify-center text-xs text-gray-400 italic">No hay datos para el histograma.</div>
        )}
        <div className="text-xs text-gray-500 text-center mt-auto">
             Mediana de % de adjetivos: {adjectivesStats.median}%
        </div>
      </div>

      {/* Tarjeta Fuentes */}
      <div className="bg-white rounded-lg p-4 md:p-5 shadow-sm border flex flex-col"> {/* Ajustado padding */}
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-base md:text-lg font-semibold text-gray-700">Fuentes</h3>
          <span className="text-orange-600 text-xl md:text-2xl font-bold">{formatNumber(sourceTotal)}</span> {/* Color consistente con 'Links' */}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4 mt-auto"> {/* Responsive cols */}
          {(Object.keys(sourceMetrics) as SourceKey[]).map((key) => {
            if (sourceMetrics[key] === 0 && key !== 'Otros') return null; // Mostrar 'Otros' incluso si es 0 si otros tienen valor

            const count = sourceMetrics[key];
            const cfg = sourceConfig[key];
            const pctOfCardTotal = sourceTotal > 0 ? (count / sourceTotal) * 100 : 0;
            return (
              <div key={key} className="flex flex-col items-center text-center gap-1" title={`${cfg.label}: ${count}`}>
                 <FontAwesomeIcon icon={cfg.icon} className={`w-4 h-4 ${cfg.color}`} />
                 <span className="text-xs text-gray-500 mt-0.5">{cfg.label}</span>
                 <span className="text-xs text-gray-400">({formatNumber(count)})</span>
                 {/* Barra solo si el % es significativo */}
                 {pctOfCardTotal > 0 && (
                    <div className={`w-full ${cfg.bgColor} rounded-full h-1.5 mt-1 overflow-hidden`}>
                        <div className={`h-full ${cfg.color.replace('text-', 'bg-')} rounded-full`} style={{ width: `${pctOfCardTotal}%` }} />
                    </div>
                 )}
              </div>
            );
          })}
        </div>
        <p className="text-xs text-gray-400 mt-3 text-center italic">Métricas de fuentes (placeholder).</p>
      </div>

      {/* Tarjeta Estadísticas de Artículos (ocupa todo el ancho en md y lg si son 3 columnas) */}
      <div className="md:col-span-2 lg:col-span-3 bg-white rounded-lg p-4 md:p-5 shadow-sm border"> {/* Ajustado padding y col-span */}
        <h3 className="text-base md:text-lg font-semibold text-gray-700 mb-4">Estadísticas de Artículos</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 items-stretch"> {/* Ajustado para más columnas */}
          {/* Métricas de Autores y Artículos */}
          {(['authors', 'articles'] as const).map((key) => {
            const cfg = statusDisplayConfig[key];
            const value = metrics[key]; // Directamente de la prop metrics
            return (
              <div key={key} className="flex flex-col items-center justify-center text-center py-3">
                <FontAwesomeIcon icon={cfg.icon} className={`w-7 h-7 ${cfg.color} mb-1.5`} />
                <div className="text-xl md:text-2xl font-semibold text-gray-800">{formatNumber(value)}</div>
                <div className="text-xs md:text-sm text-gray-500">{cfg.label}</div>
              </div>
            );
          })}

          {/* Sub‑panel de estados de revisión (ocupa el espacio restante en el grid) */}
          <div className="col-span-2 sm:col-span-1 md:col-span-3 bg-gray-50 rounded-lg p-2 md:p-3">
            <div className="grid grid-cols-3 gap-2 h-full">
              {(['reviewed', 'pending', 'unreviewed'] as StatusMetricKey[]).map((key) => {
                const cfg = statusDisplayConfig[key];
                const value = metrics[key]; // Directamente de la prop metrics
                return (
                  <div key={key} className="flex flex-col items-center justify-center text-center py-3 h-full">
                    <FontAwesomeIcon icon={cfg.icon} className={`w-6 h-6 ${cfg.color} mb-1.5`} />
                    <div className="text-lg md:text-xl font-semibold text-gray-800">{formatNumber(value)}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{cfg.label}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}