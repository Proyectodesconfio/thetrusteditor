// src/pages/ArticleDetail.tsx
import { useState, useEffect, useMemo } from 'react';
import { useParams, Navigate, Link } from 'react-router-dom';

// --- Component Imports ---
import ArticleHeader, { FilterType } from '../components/ArticleHeader';
import ArticleContent from '../components/ArticleContent';
// Componentes detallados para la Sidebar
import EntityMetrics from '../components/EntityMetrics';
import AdjectivesMetrics from '../components/AdjectivesMetrics';
import SourcesMetrics from '../components/SourcesMetrics';
import SentimentAnalysis from '../components/SentimentAnalysis';

// --- Componentes SIMPLES para Resumen Rápido ---
import EntityMetricsSimple from '../components/EntityMetricsSimple';
import AdjectivesMetricsSimple from '../components/AdjectivesMetricsSimple';
import SourcesMetricsSimple from '../components/SourcesMetricsSimple';
import SentimentAnalysisSimple from '../components/SentimentAnalysisSimple';

// --- Data Loading ---
import { loadArticles } from '../services/adapters/loadArticles';

// --- TippyJS Imports ---
import Tippy from '@tippyjs/react';
// Asegúrate de que los CSS de Tippy (tippy.css, scale.css) estén importados globalmente,
// por ejemplo, en tu src/main.tsx o src/App.tsx.

export default function ArticleDetail() {
  const { id } = useParams<{ id: string }>();

  // --- State Management ---
  const allFilterKeys: FilterType[] = ['Entidades', 'Adjetivos', 'Sentimientos', 'Fuentes'];
  const [activeFilters, setActiveFilters] = useState<FilterType[]>(allFilterKeys);

  // --- Data Fetching & Article Selection ---
  const articles = useMemo(() => loadArticles(), []);
  const article = useMemo(() => articles.find(a => a.id === id), [articles, id]);

  // --- Debugging (Conditional) ---
  useEffect(() => {
    if (id && article) {
      if (import.meta.env.MODE === 'development') {
        // Los console.log pueden ser útiles durante el desarrollo.
        // console.log(`ArticleDetail: Cargando ID: ${id}`);
        // console.log(`ArticleDetail: Filtros Activos Iniciales:`, activeFilters);
      }
    } else if (id && !article && articles.length > 0) {
      // console.error(`ArticleDetail: Artículo con ID "${id}" no encontrado después de cargar la lista.`);
    } else if (!id) {
      // console.error("ArticleDetail: No se encontró ID en los parámetros de la URL.");
    }
  }, [id, article, articles.length, activeFilters]);


  // --- Manejo de Artículo No Encontrado o Carga ---
  if (!id) {
    return <Navigate to="/" replace />;
  }

  if (!article) {
    if (articles.length > 0) {
        return (
          <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center pt-24 pb-12 px-4 text-center">
            <h1 className="text-3xl font-bold text-red-600 mb-4">Artículo no encontrado</h1>
            <p className="text-lg text-gray-600 mb-6">
              No pudimos encontrar un artículo con el ID: <code className="bg-gray-200 px-1 rounded">{id}</code>.
            </p>
            <Link to="/" className="text-blue-600 hover:underline font-medium">
              Volver a la página principal
            </Link>
          </div>
        );
    }
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center pt-24 pb-12 px-4">
            <p className="text-lg text-gray-500 animate-pulse">Cargando artículo...</p>
        </div>
    );
  }

  // --- Definiciones de Contenido para Tooltips de Tarjetas Simples ---
  const entityTooltipContent = (
    <div className="p-2.5 text-xs bg-slate-700 text-white rounded-md shadow-xl max-w-[240px] text-left leading-normal">
      <p className="font-bold text-sm mb-1 text-cyan-400">Entidades Nombradas</p>
      <p>Muestra el conteo total de entidades (personas, lugares, organizaciones o varias) identificadas en el texto del artículo. Los iconos inferiores representan los tipos de entidades más frecuentes.</p>
    </div>
  );

  const adjectiveTooltipContent = (
    <div className="p-2.5 text-xs bg-slate-700 text-white rounded-md shadow-xl max-w-[240px] text-left leading-normal">
      <p className="font-bold text-sm mb-1 text-purple-400">Adjetivos</p>
      <p>Indica el número total de adjetivos y su porcentaje relativo dentro del artículo, representado por la barra de progreso.</p>
      {article.metrics?.adjectives && (
        <p className="mt-1.5 text-gray-300 text-[11px]">
          Total: {article.metrics.adjectives.num_adjectives?.value ?? 0},
          Ref. %: {article.metrics.adjectives.perc_adjectives?.reference?.toFixed(1) ?? 'N/A'}%
        </p>
      )}
    </div>
  );

  const sourceTooltipContent = (
    <div className="p-2.5 text-xs bg-slate-700 text-white rounded-md shadow-xl max-w-[240px] text-left leading-normal">
      <p className="font-bold text-sm mb-1 text-amber-400">Fuentes y Citas</p>
      <p>Número total de citas directas o referencias a fuentes de información identificadas en el contenido del artículo.</p>
      {article.metrics?.sources && (
        <p className={`mt-1.5 font-medium text-[11px] ${ (article.metrics.sources.num_afirmaciones?.value ?? 0) < 3 ? 'text-red-400' : 'text-green-400'}`}>
            {article.metrics.sources.num_afirmaciones?.value ?? 0} cita{ (article.metrics.sources.num_afirmaciones?.value ?? 0) !== 1 ? 's' : ''} encontrada{(article.metrics.sources.num_afirmaciones?.value ?? 0) !== 1 ? 's' : ''}.
        </p>
      )}
    </div>
  );

  const sentimentTooltipContent = (
    <div className="p-2.5 text-xs bg-slate-700 text-white rounded-md shadow-xl max-w-[240px] text-left leading-normal">
      <p className="font-bold text-sm mb-1" style={{ color: article.sentiment?.global_sentiment ? (article.sentiment.global_sentiment[0] === 'POS' ? 'lightgreen' : article.sentiment.global_sentiment[0] === 'NEG' ? 'lightcoral' : 'lightgray') : 'lightgray' }}>
        Sentimiento General
      </p>
      <p>Análisis del tono predominante del artículo, clasificado como Positivo, Neutro o Negativo, junto con su nivel de confianza.</p>
      {article.sentiment?.global_sentiment && (
        <p className="mt-1.5 text-gray-300 text-[11px]">
            Tono: <span className="font-medium">{article.sentiment.global_sentiment[0]}</span>,
            Confianza: <span className="font-medium">{(article.sentiment.global_sentiment[1] * 100).toFixed(1)}%</span>
        </p>
      )}
    </div>
  );


  // --- Renderizado del Detalle del Artículo ---
  return (
    <div className="min-h-screen bg-gray-100 pt-20 pb-12 px-4 md:px-6 lg:px-8">
      <div className="max-w-screen-xl mx-auto">
        <div className="mb-6 md:mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">The trust editor</h1>
            <p className="text-sm md:text-base text-gray-600">Una herramienta con IA para ayudar a las redacciones a mejorar las noticias.</p>
        </div>

        <div className="mb-8 md:mb-10">
          <h2 className="text-xl md:text-2xl font-semibold text-gray-700 mb-4 md:mb-6">Resumen Rápido</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6 items-stretch">
            <Tippy content={entityTooltipContent} placement="bottom" animation="scale" delay={[200,0]} arrow={true}>
              <div className="h-full cursor-default bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow">
                <EntityMetricsSimple entities={article.entities} />
              </div>
            </Tippy>
            <Tippy content={adjectiveTooltipContent} placement="bottom" animation="scale" delay={[200,0]} arrow={true}>
              <div className="h-full cursor-default bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow">
                <AdjectivesMetricsSimple metrics={article.metrics} />
              </div>
            </Tippy>
            <Tippy content={sourceTooltipContent} placement="bottom" animation="scale" delay={[200,0]} arrow={true}>
              <div className="h-full cursor-default bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow">
                <SourcesMetricsSimple metrics={article.metrics} />
              </div>
            </Tippy>
            <Tippy content={sentimentTooltipContent} placement="bottom" animation="scale" delay={[200,0]} arrow={true}>
              <div className="h-full cursor-default bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow">
                <SentimentAnalysisSimple sentiment={article.sentiment} />
              </div>
            </Tippy>
          </div>
        </div>

        <div>
          <h2 className="text-xl md:text-2xl font-semibold text-gray-700 mb-4 md:mb-6">Análisis Detallado</h2>
          <ArticleHeader
            article={article}
            activeFilters={activeFilters}
            onFilterChange={setActiveFilters}
          />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 mt-6">
            <div className="lg:col-span-2 bg-white p-4 md:p-6 rounded-lg shadow-md border border-gray-200">
              <ArticleContent
                title={article.titulo}
                content={article.cuerpo ?? ''}
                author={article.autor}
                date={article.fecha}
                activeFilters={activeFilters}
                entities={article.entities}
                adjectives={article.adjectives}
                sentiment={article.sentiment}
                sources={article.sources}
              />
            </div>
            {/* Columna Derecha: Barra Lateral con Métricas Detalladas */}
            <div className="space-y-6">
              <SentimentAnalysis sentiment={article.sentiment} />
              <SourcesMetrics metrics={article.metrics} sources={article.sources} />
              <EntityMetrics entities={article.entities} />
              <AdjectivesMetrics metrics={article.metrics} adjectives={article.adjectives} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}