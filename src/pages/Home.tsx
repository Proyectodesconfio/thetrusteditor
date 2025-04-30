import React, { useMemo, useState, useEffect } from 'react';

// --- Core Component Imports ---
import ArticleList from '../components/ArticleList';
import HomeMetrics from '../components/HomeMetrics';
import PeriodFilter from '../components/PeriodFilter';

// --- Data & Logic Imports ---
import { loadArticles } from '../services/adapters/loadArticles';
import { normaliseArticleDate } from '../services/adapters/normaliseArticleDate';
import { calculateMetrics } from '../components/articleAnalytics';
import { useDateRange } from '../hooks/useDateRange';

// --- Type Imports ---
// TODO: Ajusta la ruta si tu archivo de tipos está en otro lugar (ej: '../../types')
// Asegúrate que estos tipos (especialmente Article) definan *exactamente* la estructura
// de tus datos, incluyendo campos opcionales (ej: seccion?: string) si aplica.
import { Article, Metrics } from '../types';

// --- Utility Imports ---
// Asegúrate de tener date-fns v2 o v3 instalada (`npm install date-fns@latest`)
import { startOfDay, endOfDay, isWithinInterval } from 'date-fns';

/**
 * Configuration for the Home page pagination.
 */
const ARTICLES_PER_PAGE = 10;

/**
 * Defines the possible fields for sorting articles.
 */
type SortField = 'fecha' | 'autor' | 'seccion'; // Verify 'seccion' exists in the imported Article type

/**
 * Defines the possible sort orders.
 */
type SortOrder = 'asc' | 'desc';

/**
 * Home page component.
 * Displays a list of articles filterable by date range, author, and section,
 * with client-side sorting and pagination.
 */
const Home: React.FC = () => {

  // --- 1. Data Fetching ---

  // Load articles on initial mount and memoize the result.
  // `loadArticles` should ideally return `Article[]` or be cast correctly.
  const articles = useMemo(() => loadArticles() as Article[], []);

  // --- 2. State Management ---

  // Date range state from custom hook.
  const { range, setRange } = useDateRange();

  // State for secondary filters (author, section).
  const [selectedAutor, setSelectedAutor] = useState<string>('');
  const [selectedSeccion, setSelectedSeccion] = useState<string>('');

  // State for sorting configuration.
  const [sortField, setSortField] = useState<SortField>('fecha');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  // State for pagination.
  const [currentPage, setCurrentPage] = useState<number>(1);

  // --- 3. Derived Data & Memoized Calculations ---

  /**
   * Filters articles based on the selected date range (`range`).
   * Includes articles from the start of the 'from' date to the end of the 'to' date.
   */
  const articlesByDate = useMemo(() => {
    // Ensure valid date range exists before filtering.
    if (!range.from || !range.to || isNaN(range.from.getTime()) || isNaN(range.to.getTime())) {
      return articles; // Return all articles if range is incomplete or invalid
    }

    try {
      // Calculate interval boundaries to include the entire start and end days.
      const start = startOfDay(range.from);
      const end = endOfDay(range.to);

      return articles.filter((article) => {
        try {
          const date = normaliseArticleDate(article.fecha);
          // Exclude articles with unparseable or invalid dates.
          if (!date || isNaN(date.getTime())) return false;
          // Check if the article date falls within the calculated interval.
          return isWithinInterval(date, { start, end });
        } catch (filterError) {
          // Log infrequent errors during development if needed, but exclude article on error.
          // console.error(`Error filtering article by date: ${article.id || article.fecha}`, filterError);
          return false;
        }
      });
    } catch (dateAdjustmentError) {
      // Handle potential errors from startOfDay/endOfDay if dates are extremely invalid.
      // console.error("Error adjusting date range boundaries:", dateAdjustmentError);
      return articles; // Fallback to all articles on critical range error
    }
  }, [articles, range]);

  /**
   * Generates lists of unique authors and sections based on currently date-filtered articles.
   * Also calculates which authors/sections are available given the *other* active filter.
   */
  const { autores, secciones, autoresDisponibles, seccionesDisponibles } = useMemo(() => {
    // Use Sets for efficient unique value collection. Filter out empty values.
    const autoresSet = new Set(articlesByDate.map((a) => a.autor).filter(Boolean));
    const seccionesSet = new Set(articlesByDate.map((a) => a.seccion).filter(Boolean)); // Assumes a.seccion exists

    // Determine available options considering cross-filtering.
    const autoresDisponibles = new Set(
      articlesByDate
        .filter((a) => !selectedSeccion || a.seccion === selectedSeccion)
        .map((a) => a.autor)
        .filter(Boolean)
    );
    const seccionesDisponibles = new Set(
      articlesByDate
        .filter((a) => !selectedAutor || a.autor === selectedAutor)
        .map((a) => a.seccion) // Assumes a.seccion exists
        .filter(Boolean)
    );

    // Return sorted arrays and sets for availability checks.
    return {
      autores: Array.from(autoresSet).sort((a, b) => a.localeCompare(b, 'es')),
      secciones: Array.from(seccionesSet).sort((a, b) => a.localeCompare(b, 'es')),
      autoresDisponibles,
      seccionesDisponibles,
    };
  }, [articlesByDate, selectedAutor, selectedSeccion]);

  /**
   * Applies secondary filters (author, section) and sorts the date-filtered articles.
   * Uses a cache for date normalization when sorting by date for performance.
   */
  const filteredAndSorted = useMemo(() => {
    // Cache for normalized dates to avoid re-calculating during sort.
    const dateCache = new Map<string, Date | null>();

    // Apply author and section filters.
    const filtered = articlesByDate.filter(art =>
      (!selectedAutor || art.autor === selectedAutor) &&
      (!selectedSeccion || art.seccion === selectedSeccion) // Assumes art.seccion exists
    );

    // Pre-normalize and cache dates only if sorting by date.
    if (sortField === 'fecha') {
      filtered.forEach(art => {
        if (!dateCache.has(art.fecha)) {
          try {
            dateCache.set(art.fecha, normaliseArticleDate(art.fecha));
          } catch {
            dateCache.set(art.fecha, null); // Cache null on normalization error
          }
        }
      });
    }

    // Sort the filtered articles. Create a new array to avoid mutating the filtered list.
    const sorted = [...filtered].sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'fecha':
          const dateA = dateCache.get(a.fecha);
          const dateB = dateCache.get(b.fecha);
          // Robust date comparison: valid dates first, then compare times, fallback to string compare.
          if (dateA && !isNaN(dateA.getTime()) && dateB && !isNaN(dateB.getTime())) {
            comparison = dateB.getTime() - dateA.getTime(); // Default descending
          } else if (dateA && !isNaN(dateA.getTime())) {
            comparison = -1; // Place valid date A before invalid date B
          } else if (dateB && !isNaN(dateB.getTime())) {
            comparison = 1;  // Place valid date B before invalid date A
          } else {
            comparison = (a.fecha || '').localeCompare(b.fecha || ''); // Fallback for two invalid dates
          }
          break;
        case 'autor':
          comparison = (a.autor || '').localeCompare(b.autor || '', 'es', { sensitivity: 'base' });
          break;
        case 'seccion': // Assumes a.seccion and b.seccion exist on the Article type
          comparison = (a.seccion || '').localeCompare(b.seccion || '', 'es', { sensitivity: 'base' });
          break;
      }
      // Apply sort order (asc/desc).
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return sorted;
  }, [articlesByDate, selectedAutor, selectedSeccion, sortField, sortOrder]);

  /**
   * Calculates the total number of pages based on the filtered and sorted articles.
   */
  const totalPages = Math.max(1, Math.ceil(filteredAndSorted.length / ARTICLES_PER_PAGE));

  /**
   * Extracts the articles to display on the current page.
   */
  const currentArticles = useMemo(() => {
    const pageIndex = Math.max(0, currentPage - 1); // currentPage is 1-based
    const start = pageIndex * ARTICLES_PER_PAGE;
    const end = start + ARTICLES_PER_PAGE;
    return filteredAndSorted.slice(start, end);
  }, [filteredAndSorted, currentPage, totalPages]);

  /**
   * Calculates display metrics based on the final filtered and sorted list.
   */
  const metrics: Metrics = useMemo(() => {
    // `calculateMetrics` should return an object compatible with the `Metrics` type.
    return calculateMetrics(filteredAndSorted);
  }, [filteredAndSorted]);


  // --- 4. Effects ---

  /**
   * Effect to reset the current page to 1 whenever filters or sorting change,
   * preventing viewing a non-existent page after data reduction.
   */
  useEffect(() => {
    if (currentPage !== 1) {
        setCurrentPage(1);
    }
    // We only reset *if* not already on page 1 to avoid potential minor re-renders.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedAutor, selectedSeccion, sortField, sortOrder, articlesByDate]); // Reset when underlying data changes too


  // --- 5. Render Logic ---

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">The trust editor</h1>
          <p className="text-lg text-gray-600">Una herramienta con IA para ayudar a las redacciones a mejorar las noticias</p>
        </header>

        {/* Display Metrics */}
        {/* Ensure HomeMetrics props match: expects `articles` and `metrics` */}
        <HomeMetrics articles={filteredAndSorted} metrics={metrics} />

        {/* Filters and Article List Section */}
        <section className="mt-8 md:mt-12">
          {/* Filter Controls Row */}
          <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-8">
            <h2 className="text-xl font-semibold">Notas ({filteredAndSorted.length})</h2>
            <PeriodFilter value={range} onChange={setRange} />

            {/* Right-aligned filter/sort controls */}
            <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-8 md:ml-auto">
              {/* Author Filter */}
              <select
                value={selectedAutor}
                onChange={(e) => setSelectedAutor(e.target.value)}
                className="w-48 px-3 py-2 border rounded-md text-sm"
                aria-label="Filtrar por autor"
              >
                <option value="">Todos los autores</option>
                {autores.map((author) => (
                  <option key={author} value={author} disabled={!autoresDisponibles.has(author)}>
                    {author}
                  </option>
                ))}
              </select>

              {/* Section Filter */}
              <select
                value={selectedSeccion}
                onChange={(e) => setSelectedSeccion(e.target.value)}
                className="w-48 px-3 py-2 border rounded-md text-sm"
                aria-label="Filtrar por sección"
              >
                <option value="">Todas las secciones</option>
                {secciones.map((section) => (
                  <option key={section} value={section} disabled={!seccionesDisponibles.has(section)}>
                    {section}
                  </option>
                ))}
              </select>

              {/* Sort Controls */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Ordenar por:</span>
                {(['fecha', 'autor', 'seccion'] as SortField[]).map((field) => (
                  <button
                    key={field}
                    onClick={() => {
                      const newOrder = field === sortField ? (sortOrder === 'asc' ? 'desc' : 'asc') : 'desc';
                      setSortField(field);
                      setSortOrder(newOrder);
                    }}
                    className={`px-3 py-1 text-sm border rounded-md hover:bg-gray-50 flex items-center gap-1 ${
                      sortField === field ? 'bg-blue-50 border-blue-200' : '' // Active style
                    }`}
                    aria-label={`Ordenar por ${field}`}
                  >
                    {/* Capitalize field name */}
                    {field.charAt(0).toUpperCase() + field.slice(1)}
                    {/* Display sort direction indicator */}
                    {sortField === field && (
                      <span aria-hidden="true">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Article List Display */}
          <div className="mt-6">
            {/* Ensure ArticleList expects `articles: Article[]` */}
            <ArticleList articles={currentArticles} />
            {/* Display message when no articles match filters */}
            {currentArticles.length === 0 && articles.length > 0 && (
              <p className="text-center text-gray-500 py-8">No se encontraron artículos con los filtros seleccionados.</p>
            )}
            {/* Display message when no articles are loaded at all */}
            {articles.length === 0 && (
               <p className="text-center text-gray-500 py-8">No hay artículos cargados.</p>
            )}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <nav className="mt-6 flex justify-center gap-2" aria-label="Paginación">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 border rounded-md disabled:opacity-50"
              >
                Anterior
              </button>
              {/* Simple page number buttons */}
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNumber) => (
                <button
                  key={pageNumber}
                  onClick={() => setCurrentPage(pageNumber)}
                  className={`px-4 py-2 border rounded-md ${
                    currentPage === pageNumber ? 'bg-blue-500 text-white' : 'hover:bg-gray-50' // Active style
                  }`}
                  aria-current={currentPage === pageNumber ? 'page' : undefined}
                >
                  {pageNumber}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 border rounded-md disabled:opacity-50"
              >
                Siguiente
              </button>
            </nav>
          )}
        </section>
      </div>
    </div>
  );
};

export default Home;