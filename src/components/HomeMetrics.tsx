/* ---------------------------------------------------------------------------
 * HomeMetrics.tsx – versión corregida 🔧 (v2)
 * Proyecto Desconfío
 * ---------------------------------------------------------------------------
 * Cambios respecto a la v1 del canvas:
 *   • Rango de fechas realmente inclusivo → usamos endOfDay(range.to).
 *   • Comentario aclaratorio en el filtro.
 *   ⚠️ No toca nada de paginación (eso está en Home.tsx).
 * --------------------------------------------------------------------------- */

// 📦 Dependencias externas
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUser,
  faLocationDot,
  faCalendarDays,
  faBuilding,
  faFont,
  faLink,
  faQuoteLeft,
  faEllipsis,
  faCheck,
  faClock,
  faWarning,
  faNewspaper,
} from '@fortawesome/free-solid-svg-icons';
import { startOfDay, endOfDay, isAfter, isBefore } from 'date-fns';
import * as d3 from 'd3';
import { useMemo } from 'react';

// 📦 Tipos propios
import type { Article } from '../types';

// 📦 Componentes internos
import { AdjectivesHistogram } from './AdjectiveCharts';

// 📦 Helpers
import { normaliseArticleDate } from '../services/adapters/normaliseArticleDate';

/* ---------------------------------------------------------------------------
 * Configuración visual de iconos y colores
 * --------------------------------------------------------------------------- */
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

const statusConfig = {
  Autores:      { icon: faUser,      color: 'text-blue-600',   bgColor: 'bg-blue-100'   },
  Artículos:    { icon: faNewspaper, color: 'text-indigo-600', bgColor: 'bg-indigo-100' },
  Revisados:    { icon: faCheck,     color: 'text-green-600',  bgColor: 'bg-green-100'  },
  Pendientes:   { icon: faClock,     color: 'text-amber-500',  bgColor: 'bg-amber-100'  },
  'Sin revisión': { icon: faWarning, color: 'text-red-500',    bgColor: 'bg-red-100'    },
} as const;

type StatusKey = keyof typeof statusConfig;

/* ---------------------------------------------------------------------------
 * Interfaces de props
 * --------------------------------------------------------------------------- */
interface HomeMetricsProps {
  articles: Article[];
  /** Rango actual del date-picker (puede ser null). */
  range?: {
    from: Date | null;
    to: Date | null;
  };
}

/* ---------------------------------------------------------------------------
 * Componente principal
 * --------------------------------------------------------------------------- */
export default function HomeMetrics({
  articles,
  range = { from: null, to: null }, // valor por defecto para evitar undefined
}: HomeMetricsProps) {
  /* ───────────────────────────────────────────────────────────────────────
   * 1. Filtrado por rango de fechas (dentro de `useMemo` para performance)
   *      ▸ Ahora usamos endOfDay(range.to) => inclusivo por la derecha.
   * ─────────────────────────────────────────────────────────────────────*/
  const articlesByDate = useMemo(() => {
    if (!range?.from || !range?.to) return articles;

    const start = startOfDay(range.from);
    const end   = endOfDay(range.to);   // ← cambio sustancial

    return articles.filter((a) => {
      try {
        const artDate = normaliseArticleDate(a.fecha);
        // isBefore/isAfter excluyen fechas iguales; usamos negación doble
        return artDate
          ? !isBefore(artDate, start) && !isAfter(artDate, end)
          : false; // fecha no válida → descartada
      } catch {
        return false; // error al parsear → descartada
      }
    });
  }, [articles, range?.from, range?.to]);

  /* ───────────────────────────────────────────────────────────────────────
   * 2. Cálculo de métricas  – hooks estables
   * ─────────────────────────────────────────────────────────────────────*/
  const entityMetrics = useMemo(() => {
    return articlesByDate.reduce(
      (acc, article) => {
        article.entities?.entities_list?.forEach((e) => {
          switch (e.type) {
            case 'Persona':       acc.Personas++;       break;
            case 'Lugar':         acc.Lugares++;        break;
            case 'Misceláneo':    acc.Otros++;          break;
            case 'Organización':  acc.Organizaciones++; break;
          }
        });
        return acc;
      },
      { Personas: 0, Lugares: 0, Otros: 0, Organizaciones: 0 },
    );
  }, [articlesByDate]);

  const adjectivesTotal = useMemo(() =>
    articlesByDate.reduce(
      (t, a) => t + (a.metrics?.adjectives?.num_adjectives?.value ?? 0),
      0,
    ), [articlesByDate]);

  // 🚧 TODO real: sustituir por métrica de fuentes auténtica
  const sourceMetrics = useMemo(() => {
    return articlesByDate.reduce(
      (acc, a) => {
        if (a.sources) {
          acc.Links     += 2;
          acc.Dichos    += 1;
          acc.Textuales += 3;
          acc.Otros     += 4;
        }
        return acc;
      },
      { Links: 0, Dichos: 0, Textuales: 0, Otros: 0 },
    );
  }, [articlesByDate]);

  const totalArticles = articlesByDate.length;

  const totalAuthors = useMemo(() =>
    new Set(articlesByDate.map((a) => a.autor).filter(Boolean)).size,
    [articlesByDate]);

  const statusMetrics = useMemo(() =>
    articlesByDate.reduce(
      (acc, _a, i) => {
        if (i % 3 === 0)      acc.Revisados++;
        else if (i % 3 === 1) acc.Pendientes++;
        else                  acc['Sin revisión']++;
        return acc;
      },
      { Revisados: 0, Pendientes: 0, 'Sin revisión': 0 } as Record<StatusKey, number>,
    ), [articlesByDate]);

  const entityTotal   = Object.values(entityMetrics).reduce((s, c) => s + c, 0);
  const sourceTotal   = Object.values(sourceMetrics).reduce((s, c) => s + c, 0);

  const adjectivesStats = useMemo(() => {
    const perc = articlesByDate.map(
      (a) => (a.metrics?.adjectives?.perc_adjectives?.value ?? 0) * 100,
    );
    return {
      median: (d3.median(perc) ?? 0).toFixed(1),
      max:    (d3.max(perc) ?? 0).toFixed(1),
      total:  adjectivesTotal,
    } as const;
  }, [articlesByDate, adjectivesTotal]);

  const nf = (n: number) => new Intl.NumberFormat('es-ES').format(n);

  /* ───────────────────────────────────────────────────────────────────────
   * 3. Salida temprana (placeholder)
   * ─────────────────────────────────────────────────────────────────────*/
  if (totalArticles === 0) {
    return (
      <p className="text-center text-gray-500">
        No hay datos disponibles para el rango seleccionado
      </p>
    );
  }

  /* ───────────────────────────────────────────────────────────────────────
   * 4. Render principal
   * ─────────────────────────────────────────────────────────────────────*/
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
      {/* ─────────────────────── Entidades ─────────────────────── */}
      <div className="bg-white rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-medium">Entidades</h3>
          <span className="text-cyan-500 text-2xl font-medium">{nf(entityTotal)}</span>
        </div>
        <div className="grid grid-cols-4 gap-4">
          {Object.entries(entityMetrics).map(([k, c]) => {
            const key = k as EntityKey;
            const pct = entityTotal ? ((c / entityTotal) * 100).toFixed(1) : '0.0';
            const cfg = typeConfig[key] ?? { icon: faEllipsis, color: 'text-gray-500' };
            return (
              <div key={key} className="flex flex-col gap-1">
                <FontAwesomeIcon icon={cfg.icon} className={`w-4 h-4 ${cfg.color}`} />
                <div className="flex flex-col">
                  <span className="text-sm text-gray-500">{key}</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-sm font-medium text-gray-700">{pct}%</span>
                    <span className="text-xs text-gray-400">({nf(c)})</span>
                  </div>
                </div>
                <div
                  className={`h-1.5 ${cfg.color.replace('text', 'bg')} rounded-full`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* ─────────────────────── Adjetivos ─────────────────────── */}
      <div className="bg-white rounded-lg p-6">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-medium">Adjetivos</h3>
            <FontAwesomeIcon icon={faFont} className="text-purple-500" />
          </div>
          <span className="text-purple-500 text-2xl font-medium">{nf(adjectivesStats.total)}</span>
        </div>
        <div className="w-full">
          {/* Histograma reutilizable */}
          <AdjectivesHistogram articles={articlesByDate} />
        </div>
      </div>

      {/* ─────────────────────── Fuentes ─────────────────────── */}
      <div className="bg-white rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-medium">Fuentes</h3>
          <span className="text-amber-700 text-2xl font-medium">{nf(sourceTotal)}</span>
        </div>
        <div className="grid grid-cols-4 gap-4">
          {Object.entries(sourceMetrics).map(([k, c]) => {
            const key = k as SourceKey;
            const cfg = sourceConfig[key] ?? { icon: faEllipsis, color: 'text-gray-500', bgColor: 'bg-gray-100' };
            const pct = sourceTotal ? (c / sourceTotal) * 100 : 0;
            return (
              <div key={key} className="flex flex-col gap-1">
                <FontAwesomeIcon icon={cfg.icon} className={`w-4 h-4 ${cfg.color} mb-1`} />
                <div className="flex gap-2 items-center">
                  <span className="text-sm text-gray-500">{key}</span>
                  <span className="text-sm text-gray-400">{nf(c)}</span>
                </div>
                <div className={`w-full ${cfg.bgColor} rounded-full h-1.5`}>
                  <div
                    className={`h-full ${cfg.color.replace('text', 'bg')} rounded-full`} id="bar"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ─────────────────── Estadísticas de artículos ─────────────────── */}
      <div className="md:col-span-3 bg-white rounded-lg p-6">
        <h3 className="text-xl font-medium mb-6">Estadísticas de artículos</h3>
        <div className="grid grid-cols-5 gap-4 items-stretch">
          {[
            { label: 'Autores',   value: totalAuthors,   cfg: statusConfig.Autores   },
            { label: 'Artículos', value: totalArticles,  cfg: statusConfig.Artículos },
          ].map(({ label, value, cfg }) => (
            <div key={label} className="flex flex-col items-center justify-center py-4">
              <FontAwesomeIcon icon={cfg.icon} className={`w-8 h-8 ${cfg.color} mb-2`} />
              <div className="text-center">
                <div className="text-2xl font-semibold text-gray-900">{nf(value)}</div>
                <div className="text-sm text-gray-500">{label}</div>
              </div>
            </div>
          ))}

          {/* Sub‑panel de estados de revisión */}
          <div className="col-span-3 bg-gray-100 rounded-lg">
            <div className="grid grid-cols-3 gap-4 h-full">
              {(['Revisados', 'Pendientes', 'Sin revisión'] as StatusKey[]).map((key) => {
                const cfg = statusConfig[key];
                return (
                  <div key={key} className="flex flex-col items-center justify-center py-4">
                    <FontAwesomeIcon icon={cfg.icon} className={`w-8 h-8 ${cfg.color} mb-2`} />
                    <div className="text-center">
                      <div className="text-2xl font-semibold text-gray-900">{nf(statusMetrics[key])}</div>
                      <div className="text-sm text-gray-500">{key}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>  );
} 