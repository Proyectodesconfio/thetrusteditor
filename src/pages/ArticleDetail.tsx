// src/pages/ArticleDetail.tsx
import React, { useState, useEffect } from 'react';
import { useParams, Navigate, Link } from 'react-router-dom';

// --- Component Imports ---
import ArticleHeader, { FilterType } from '../components/ArticleHeader'; // Import FilterType
import ArticleContent from '../components/ArticleContent';
import EntityMetrics from '../components/EntityMetrics';
import AdjectivesMetrics from '../components/AdjectivesMetrics';
import SourcesMetrics from '../components/SourcesMetrics';
import EntityMetricsSimple from '../components/EntityMetricsSimple';
import AdjectivesMetricsSimple from '../components/AdjectivesMetricsSimple';
import SentimentAnalysis from '../components/SentimentAnalysis';
import SentimentAnalysisSimple from '../components/SentimentAnalysisSimple';

// --- Data Loading ---
import { loadArticles } from '../services/adapters/loadArticles'; // Ensure path is correct

// --- Type Imports ---
import type { Article, GlobalMetrics } from '../types'; // Ensure path and types are correct


export default function ArticleDetail() {
  const { id } = useParams<{ id: string }>();

  // --- State Management ---
  // Define all possible filter keys using the imported type
  const allFilterKeys: FilterType[] = ['Entidades', 'Adjetivos', 'Sentimientos', 'Fuentes'];
  // Initialize activeFilters state with all keys to have them active by default
  const [activeFilters, setActiveFilters] = useState<string[]>(allFilterKeys); // <-- MODIFIED: All active initially

  // --- Data Fetching & Article Selection ---
  // TODO: Optimize - Consider fetching only the required article instead of all.
  const articles = loadArticles();
  const article = articles.find(a => a.id === id);

  // --- Debugging (Conditional) ---
  useEffect(() => {
    if (id && article) {
      // Log only during development
      if (process.env.NODE_ENV === 'development') {
        console.log(`ArticleDetail: Loading ID: ${id}`);
        console.log(`ArticleDetail: Initial Active Filters:`, activeFilters);
        console.log(`ArticleDetail: Found Article:`, article);
        console.log(`ArticleDetail: Sentiment Data:`, article.sentiment);
        console.log(`ArticleDetail: Entities Data:`, article.entities);
        console.log(`ArticleDetail: Adjectives Data:`, article.adjectives);
        console.log(`ArticleDetail: Sources Data:`, article.sources); // Check if sources array exists
        console.log(`ArticleDetail: Metrics Data:`, article.metrics);
      }
    } else if (id && !article) {
      console.error(`ArticleDetail: Article with ID "${id}" not found.`);
    } else {
      console.error("ArticleDetail: No ID found in URL parameters.");
    }
    // Dependency array includes article to re-log if data somehow changes,
    // but activeFilters is intentionally excluded to only log initial state/data load.
  }, [id, article]);


  // --- Handling Not Found ---
  if (!id) {
    // Should ideally be handled by routing, but good failsafe
    return <Navigate to="/" replace />;
  }
  if (!article) {
    // Render a user-friendly "Not Found" component/page
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

  // --- Render Article Detail ---
  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Page Sub-Header */}
        <div className="mb-8">
            <h1 className="text-2xl md:text-3xl font-bold mb-2">The trust editor</h1>
            <p className="text-sm md:text-base text-gray-500">Una herramienta con IA para ayudar a las redacciones a mejorar las noticias</p>
        </div>

        {/* --- Overview Section (Adjusted Layout) --- */}
        <div className="mb-8 md:mb-12">
          <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">Resumen Rápido</h2>
          {/* Using 4 columns on medium screens, Entities spans 2 */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6 items-stretch">
             <div className="md:col-span-2 h-full"><EntityMetricsSimple entities={article.entities} /></div>
             <div className="h-full"><AdjectivesMetricsSimple metrics={article.metrics} /></div>
             <div className="h-full"><SentimentAnalysisSimple sentiment={article.sentiment} /></div>
          </div>
        </div>

        {/* --- Main Article Section --- */}
        <div>
             <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">Análisis Detallado</h2>
             {/* Article Header receives current filters and the function to update them */}
             <ArticleHeader
                article={article}
                activeFilters={activeFilters}
                onFilterChange={setActiveFilters}
             />
             {/* Main Content Grid */}
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mt-6">
                 {/* Left Column: Article Content */}
                 <div className="md:col-span-2 bg-white p-6 rounded-lg shadow-sm">
                     {/* ArticleContent receives current filters and all necessary data */}
                     <ArticleContent
                         title={article.titulo}
                         content={article.cuerpo ?? ''}
                         author={article.autor}
                         date={article.fecha ?? ''}
                         activeFilters={activeFilters} // Pass current state
                         entities={article.entities}
                         adjectives={article.adjectives}
                         sentiment={article.sentiment} // Pass detailed sentiment object
                         sources={article.sources}     // Pass detailed sources array
                     />
                 </div>
                 {/* Right Column: Detailed Metrics Sidebar */}
                 <div className="space-y-6">
                    {/* Ensure these components correctly handle potentially undefined props if applicable */}
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