// src/pages/ArticleDetail.tsx
import { useState, useEffect, useMemo } from 'react'; // 'React' import no es necesario si no se usa explícitamente
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

// --- Type Imports ---
// import type { Article } from '../types'; // Ya no se usa directamente aquí

export default function ArticleDetail() {
  const { id } = useParams<{ id: string }>();

  // --- State Management ---
  const allFilterKeys: FilterType[] = ['Entidades', 'Adjetivos', 'Sentimientos', 'Fuentes'];
  const [activeFilters, setActiveFilters] = useState<string[]>(allFilterKeys);

  // --- Data Fetching & Article Selection ---
  const articles = useMemo(() => loadArticles(), []);
  const article = useMemo(() => articles.find(a => a.id === id), [articles, id]);

  // --- Debugging (Conditional) ---
  useEffect(() => {
    if (id && article) {
      // CORREGIDO: Usar import.meta.env.MODE en lugar de process.env.NODE_ENV para Vite
      if (import.meta.env.MODE === 'development') {
        console.log(`ArticleDetail: Loading ID: ${id}`);
        console.log(`ArticleDetail: Initial Active Filters:`, activeFilters);
        // console.log(`ArticleDetail: Found Article:`, article); // Log completo puede ser muy grande
        console.log(`ArticleDetail: Sentiment Data Keys:`, Object.keys(article.sentiment || {}));
        console.log(`ArticleDetail: Entities List Length:`, article.entities?.entities_list?.length ?? 0);
        console.log(`ArticleDetail: Adjectives List Length:`, article.adjectives?.adjectives_list?.length ?? 0);
        console.log(`ArticleDetail: Sources Array Length:`, article.sources?.length ?? 0);
        console.log(`ArticleDetail: Metrics Keys:`, Object.keys(article.metrics || {}));
        console.log(`ArticleDetail: Metrics Sources Keys:`, Object.keys(article.metrics?.sources || {}));
      }
    } else if (id && !article && articles.length > 0) {
      console.error(`ArticleDetail: Article with ID "${id}" not found after loading articles.`);
    } else if (!id) {
      console.error("ArticleDetail: No ID found in URL parameters.");
    }
  }, [id, article, articles.length, activeFilters]); // Añadido activeFilters si se loguea

  // --- Handling Not Found ---
  if (!id) {
    return <Navigate to="/" replace />;
  }

  if (!article) {
    if (articles.length > 0) { // Artículos cargados, pero este ID no encontrado
      return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center pt-24 pb-12 px-4 text-center">
          <h1 className="text-3xl font-bold text-red-600 mb-4">Artículo No Encontrado</h1>
          <p className="text-lg text-gray-600 mb-6">
            No pudimos encontrar un artículo con el ID: <code className="bg-gray-200 px-1 rounded">{id}</code>.
          </p>
          <Link to="/" className="text-blue-600 hover:underline font-medium">
            Volver a la página principal
          </Link>
        </div>
      );
    }
    // Aún cargando artículos o fallo total en la carga
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center pt-24 pb-12 px-4">
        <p className="text-lg text-gray-500">Cargando artículo...</p>
      </div>
    );
  }

  // --- Render Article Detail ---
  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">The trust editor</h1>
          <p className="text-sm md:text-base text-gray-500">Una herramienta con IA para ayudar a las redacciones a mejorar las noticias</p>
        </div>

        <div className="mb-8 md:mb-12">
          <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">Resumen Rápido</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 items-stretch">
            <div className="h-full"><EntityMetricsSimple entities={article.entities} /></div>
            <div className="h-full"><AdjectivesMetricsSimple metrics={article.metrics} /></div>
            <div className="h-full"><SourcesMetricsSimple metrics={article.metrics} /></div>
            <div className="h-full"><SentimentAnalysisSimple sentiment={article.sentiment} /></div>
          </div>
        </div>

        <div>
          <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">Análisis Detallado</h2>
          <ArticleHeader
            article={article}
            activeFilters={activeFilters}
            onFilterChange={setActiveFilters}
          />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 mt-6">
            <div className="lg:col-span-2 bg-white p-4 md:p-6 rounded-lg shadow-sm border">
              <ArticleContent
                title={article.titulo}
                content={article.cuerpo ?? ''}
                // CORREGIDO: Proporcionar un valor por defecto si article.autor es undefined
                // Asumiendo que ArticleContentProps.author espera string
                author={article.autor ?? 'Desconocido'}
                date={article.fecha ?? 'Fecha no disponible'} // Similar para date
                activeFilters={activeFilters}
                entities={article.entities}
                adjectives={article.adjectives}
                sentiment={article.sentiment}
                sources={article.sources}
              />
            </div>
            <div className="space-y-6">
              <SentimentAnalysis sentiment={article.sentiment} />
              <EntityMetrics entities={article.entities} />
              <AdjectivesMetrics metrics={article.metrics} adjectives={article.adjectives} />
              <SourcesMetrics metrics={article.metrics} sources={article.sources} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}