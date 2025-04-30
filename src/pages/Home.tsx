// src/pages/Home.tsx
import React, { useMemo, useState, useEffect } from 'react';

// --- Core Component Imports ---
import ArticleList from '../components/ArticleList';
import HomeMetrics from '../components/HomeMetrics';
import PeriodFilter from '../components/PeriodFilter';

// --- Data & Logic Imports ---
import { loadArticles } from '../services/adapters/loadArticles';
import { normaliseArticleDate } from '../services/adapters/normaliseArticleDate';
import { calculateMetrics } from '../components/articleAnalytics'; // Asegúrate que es la versión actualizada
import { useDateRange } from '../hooks/useDateRange';

// --- Type Imports ---
import { Article, GlobalMetrics } from '../types'; // Usar GlobalMetrics

// --- Utility Imports ---
import { startOfDay, endOfDay, isWithinInterval } from 'date-fns';

// --- Constants ---
const ARTICLES_PER_PAGE = 10;
const DOTS = '...';

// --- Types ---
type SortField = 'fecha' | 'autor' | 'seccion';
type SortOrder = 'asc' | 'desc';

// --- Pagination Helper ---
const generatePaginationItems = (
    currentPage: number,
    totalPages: number,
    siblings = 1
): (number | typeof DOTS)[] => {
    // ... (Función de paginación completa) ...
    const totalVisibleBlocks = siblings * 2 + 5;
    if (totalPages <= totalVisibleBlocks) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const leftSiblingIndex = Math.max(currentPage - siblings, 1);
    const rightSiblingIndex = Math.min(currentPage + siblings, totalPages);
    const shouldShowLeftDots = leftSiblingIndex > 2;
    const shouldShowRightDots = rightSiblingIndex < totalPages - 1;
    if (!shouldShowLeftDots && shouldShowRightDots) { const leftItemCount = siblings * 2 + 3; const leftRange = Array.from({ length: leftItemCount }, (_, i) => i + 1); return [...leftRange, DOTS, totalPages]; }
    if (shouldShowLeftDots && !shouldShowRightDots) { const rightItemCount = siblings * 2 + 3; const rightRange = Array.from({ length: rightItemCount }, (_, i) => totalPages - rightItemCount + 1 + i); return [1, DOTS, ...rightRange]; }
    if (shouldShowLeftDots && shouldShowRightDots) { const middleRange = Array.from({ length: rightSiblingIndex - leftSiblingIndex + 1 }, (_, i) => leftSiblingIndex + i); return [1, DOTS, ...middleRange, DOTS, totalPages]; }
    return Array.from({ length: totalPages }, (_, i) => i + 1);
};


/**
 * Home page component.
 * Displays articles with filtering, sorting, and smart pagination.
 */
const Home: React.FC = () => {

  // --- 1. Data Fetching ---
  const articles = useMemo(() => loadArticles() as Article[], []);

  // --- 2. State Management ---
  const { range, setRange } = useDateRange();
  const [selectedAutor, setSelectedAutor] = useState<string>('');
  const [selectedSeccion, setSelectedSeccion] = useState<string>('');
  const [sortField, setSortField] = useState<SortField>('fecha'); // Default sort
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');  // Default order
  const [currentPage, setCurrentPage] = useState<number>(1);

  // --- 3. Derived Data & Memoized Calculations ---

  /** Filters articles by date range. */
  const articlesByDate = useMemo(() => {
    if (!range.from || !range.to || isNaN(range.from.getTime()) || isNaN(range.to.getTime())) return articles;
    try {
      const start = startOfDay(range.from); const end = endOfDay(range.to);
      return articles.filter((article) => {
        try {
          const date = normaliseArticleDate(article.fecha);
          return date && !isNaN(date.getTime()) ? isWithinInterval(date, { start, end }) : false;
        } catch { return false; }
      });
    } catch { return articles; }
  }, [articles, range]);

  /** Generates options for filters based on available data. */
  const { autores, secciones, autoresDisponibles, seccionesDisponibles } = useMemo(() => {
    const autoresSet = new Set(articlesByDate.map((a) => a.autor).filter(Boolean));
    const seccionesSet = new Set(articlesByDate.map((a) => a.seccion).filter(Boolean));
    const autoresDisponibles = new Set(articlesByDate.filter((a) => !selectedSeccion || a.seccion === selectedSeccion).map((a) => a.autor).filter(Boolean));
    const seccionesDisponibles = new Set(articlesByDate.filter((a) => !selectedAutor || a.autor === selectedAutor).map((a) => a.seccion).filter(Boolean));
    return {
      autores: Array.from(autoresSet).sort((a, b) => a.localeCompare(a, 'es')), // Corrected sort order A-Z
      secciones: Array.from(seccionesSet).sort((a, b) => a.localeCompare(a, 'es')), // Corrected sort order A-Z
      autoresDisponibles,
      seccionesDisponibles,
    };
  }, [articlesByDate, selectedAutor, selectedSeccion]);

  /** Applies secondary filters and sorting. */
  const filteredAndSorted = useMemo(() => {
    const dateCache = new Map<string, Date | null>();
    const filtered = articlesByDate.filter(art =>
      (!selectedAutor || art.autor === selectedAutor) &&
      (!selectedSeccion || art.seccion === selectedSeccion)
    );
    if (sortField === 'fecha') {
      filtered.forEach(art => {
        if (!dateCache.has(art.fecha)) {
          try { dateCache.set(art.fecha, normaliseArticleDate(art.fecha)); }
          catch { dateCache.set(art.fecha, null); }
        }
      });
    }
    const sorted = [...filtered].sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'fecha':
          const dateA = dateCache.get(a.fecha); const dateB = dateCache.get(b.fecha);
          if (dateA && dateB && !isNaN(dateA.getTime()) && !isNaN(dateB.getTime())) { comparison = dateA.getTime() - dateB.getTime(); } // Base ASC
          else if (dateA && !isNaN(dateA.getTime())) { comparison = -1; }
          else if (dateB && !isNaN(dateB.getTime())) { comparison = 1; }
          else { comparison = 0; }
          break;
        case 'autor':
          comparison = (a.autor || '').localeCompare(b.autor || '', 'es', { sensitivity: 'base' });
          break;
        case 'seccion':
          comparison = (a.seccion || '').localeCompare(b.seccion || '', 'es', { sensitivity: 'base' });
          break;
      }
      return sortOrder === 'desc' ? (comparison * -1) : comparison;
    });
    return sorted;
  }, [articlesByDate, selectedAutor, selectedSeccion, sortField, sortOrder]);

  const totalPages = Math.max(1, Math.ceil(filteredAndSorted.length / ARTICLES_PER_PAGE));
  const currentArticles = useMemo(() => {
    const pageIndex = Math.max(0, currentPage - 1);
    const start = pageIndex * ARTICLES_PER_PAGE; const end = start + ARTICLES_PER_PAGE;
    return filteredAndSorted.slice(start, end);
  }, [filteredAndSorted, currentPage, totalPages]);

  /** Calculates global metrics using the updated calculateMetrics function. */
  const metrics: GlobalMetrics = useMemo(() => calculateMetrics(filteredAndSorted), [filteredAndSorted]);

  // --- 4. Effects ---
  useEffect(() => { if (currentPage !== 1) setCurrentPage(1); }, [selectedAutor, selectedSeccion, sortField, sortOrder, articlesByDate]);

  // --- 5. Pagination Items ---
  const paginationItems = useMemo(() => generatePaginationItems(currentPage, totalPages), [currentPage, totalPages]);

  // --- 6. Render ---
  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-4">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">The trust editor</h1>
          <p className="text-lg text-gray-600">Una herramienta con IA para ayudar a las redacciones a mejorar las noticias</p>
        </header>

        {/* Pass calculated metrics and filtered list to HomeMetrics */}
        <HomeMetrics articles={filteredAndSorted} metrics={metrics} />

        <section className="mt-8 md:mt-12">
          {/* Filter Controls Row */}
          <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6 lg:gap-8">
            <h2 className="text-xl font-semibold whitespace-nowrap">Notas ({filteredAndSorted.length})</h2>
            <PeriodFilter value={range} onChange={setRange} />
            {/* Right-aligned controls container */}
            <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6 lg:gap-8 md:ml-auto">
              {/* Selects */}
              <select value={selectedAutor} onChange={(e) => setSelectedAutor(e.target.value)} className="w-full md:w-48 px-3 py-2 border rounded-md text-sm" aria-label="Filtrar por autor">
                <option value="">Todos los autores</option>
                {autores.map((author) => (<option key={author} value={author} disabled={!autoresDisponibles.has(author)}>{author}</option>))}
              </select>
              <select value={selectedSeccion} onChange={(e) => setSelectedSeccion(e.target.value)} className="w-full md:w-48 px-3 py-2 border rounded-md text-sm" aria-label="Filtrar por sección">
                <option value="">Todas las secciones</option>
                {secciones.map((section) => (<option key={section} value={section} disabled={!seccionesDisponibles.has(section)}>{section}</option>))}
              </select>
              {/* Sort Controls */}
              <div className="flex items-center gap-2 flex-wrap justify-start md:justify-end">
                <span className="text-sm text-gray-600 shrink-0">Ordenar por:</span>
                {(['fecha', 'autor', 'seccion'] as SortField[]).map((field) => (
                  <button
                    key={field}
                    onClick={() => {
                      const newOrder = field === sortField ? (sortOrder === 'asc' ? 'desc' : 'asc') : 'desc';
                      setSortField(field); setSortOrder(newOrder);
                    }}
                    className={`px-3 py-1 text-sm border rounded-md hover:bg-gray-100 flex items-center gap-1 whitespace-nowrap ${ sortField === field ? 'bg-blue-50 border-blue-300 text-blue-700 font-medium' : 'bg-white border-gray-300 text-gray-700' }`}
                    aria-label={`Ordenar por ${field}`}
                  >
                    {field.charAt(0).toUpperCase() + field.slice(1)}
                    {sortField === field && (<span aria-hidden="true">{sortOrder === 'asc' ? '↑' : '↓'}</span>)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Article List */}
          <div className="mt-6">
            <ArticleList articles={currentArticles} />
            {/* ... No results messages ... */}
            {currentArticles.length === 0 && articles.length > 0 && ( <p className="text-center text-gray-500 py-8">No se encontraron artículos con los filtros seleccionados.</p> )}
            {articles.length === 0 && ( <p className="text-center text-gray-500 py-8">No hay artículos cargados.</p> )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <nav className="mt-6 flex justify-center items-center gap-2 flex-wrap" aria-label="Paginación">
              <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-4 py-2 border rounded-md text-sm disabled:opacity-50 ...">Anterior</button>
              {paginationItems.map((item, index) => item === DOTS ? <span key={`${DOTS}-${index}`} className="...">…</span> : <button key={item} onClick={() => setCurrentPage(item)} className={`... ${ currentPage === item ? '...' : '...' }`} aria-current={currentPage === item ? 'page' : undefined}>{item}</button>)}
              <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-4 py-2 border rounded-md text-sm disabled:opacity-50 ...">Siguiente</button>
            </nav>
          )}
        </section>
      </div>
    </div>
  );
};

export default Home;