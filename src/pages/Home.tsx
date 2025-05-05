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

// --- Helper Function ---
/**
 * Extrae la sección principal de una cadena de sección completa.
 * Ej: "Deportes / Fútbol / Instituto" -> "Deportes"
 * Ej: "Política" -> "Política"
 * @param fullSection La cadena completa de la sección (puede ser undefined).
 * @returns La sección principal o undefined si la entrada es inválida.
 */
const getMainSection = (fullSection: string | undefined): string | undefined => {
  if (!fullSection) {
    return undefined; // Si no hay sección, devuelve undefined
  }
  // Divide por '/', toma la primera parte y quita espacios extra
  return fullSection.split('/')[0].trim();
};


// --- Pagination Helper ---
const generatePaginationItems = (
    currentPage: number,
    totalPages: number,
    siblings = 1
): (number | typeof DOTS)[] => {
    const totalVisibleBlocks = siblings * 2 + 5; // siblings on each side + first + last + 2*DOTS + current
    if (totalPages <= totalVisibleBlocks) {
        return Array.from({ length: totalPages }, (_, i) => i + 1); // 1 2 3 4 5
    }

    const leftSiblingIndex = Math.max(currentPage - siblings, 1);
    const rightSiblingIndex = Math.min(currentPage + siblings, totalPages);

    // We do not show dots when there is only one page number to be inserted between the extremes of sibling and the page limits i.e 1 and totalPages.
    // Hence represents the condition '$startPage > 2' and '$endPage < totalPages - 1'.
    const shouldShowLeftDots = leftSiblingIndex > 2;
    const shouldShowRightDots = rightSiblingIndex < totalPages - 1;

    const firstPageIndex = 1;
    const lastPageIndex = totalPages;

    if (!shouldShowLeftDots && shouldShowRightDots) { // Case: 1 2 3 4 5 ... 10
        const leftItemCount = siblings * 2 + 3; // includes 1, current, siblings, one DOTS, last page
        const leftRange = Array.from({ length: leftItemCount }, (_, i) => i + 1);
        return [...leftRange, DOTS, totalPages];
    }

    if (shouldShowLeftDots && !shouldShowRightDots) { // Case: 1 ... 6 7 8 9 10
        const rightItemCount = siblings * 2 + 3;
        const rightRange = Array.from(
            { length: rightItemCount },
            (_, i) => totalPages - rightItemCount + 1 + i
        );
        return [firstPageIndex, DOTS, ...rightRange];
    }

    if (shouldShowLeftDots && shouldShowRightDots) { // Case: 1 ... 4 5 6 ... 10
        const middleRange = Array.from(
            { length: rightSiblingIndex - leftSiblingIndex + 1 },
            (_, i) => leftSiblingIndex + i
        );
        return [firstPageIndex, DOTS, ...middleRange, DOTS, lastPageIndex];
    }

    // Fallback (should not happen with logic above but safe)
    return Array.from({ length: totalPages }, (_, i) => i + 1);
};


/**
 * Home page component.
 * Displays articles with filtering (by date, author, main section), sorting, and smart pagination.
 */
const Home: React.FC = () => {

  // --- 1. Data Fetching ---
  const articles = useMemo(() => loadArticles() as Article[], []);

  // --- 2. State Management ---
  const { range, setRange } = useDateRange();
  const [selectedAutor, setSelectedAutor] = useState<string>('');
  const [selectedSeccion, setSelectedSeccion] = useState<string>(''); // State for MAIN section
  const [sortField, setSortField] = useState<SortField>('fecha');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [currentPage, setCurrentPage] = useState<number>(1);

  // --- 3. Derived Data & Memoized Calculations ---

  /** Filters articles by date range. (No change needed) */
  const articlesByDate = useMemo(() => {
    if (!range.from || !range.to || isNaN(range.from.getTime()) || isNaN(range.to.getTime())) return articles;
    try {
      const start = startOfDay(range.from);
      const end = endOfDay(range.to);
      return articles.filter((article) => {
        try {
          const date = normaliseArticleDate(article.fecha);
          return date && !isNaN(date.getTime()) ? isWithinInterval(date, { start, end }) : false;
        } catch {
          return false;
        }
      });
    } catch {
      return articles; // Fallback in case of date range errors
    }
  }, [articles, range]);

  /**
   * MODIFIED: Generates options for filters (autores and MAIN SECTIONS).
   * Calculates which options are available based on the other active filter.
   */
  const { autores, secciones, autoresDisponibles, seccionesDisponibles } = useMemo(() => {
    const autoresSet = new Set<string>();
    const seccionesPrincipalesSet = new Set<string>(); // Use this for main sections

    // Get all unique authors and main sections from date-filtered articles
    articlesByDate.forEach(a => {
      if (a.autor) {
        autoresSet.add(a.autor);
      }
      const mainSection = getMainSection(a.seccion); // Get main section
      if (mainSection) {
        seccionesPrincipalesSet.add(mainSection); // Add main section to Set
      }
    });

    // Convert Sets to sorted arrays for dropdowns
    const autores = Array.from(autoresSet).sort((a, b) => a.localeCompare(b, 'es'));
    const secciones = Array.from(seccionesPrincipalesSet).sort((a, b) => a.localeCompare(b, 'es')); // Now contains only main sections

    // Calculate available authors based on the selected MAIN section
    const autoresDisponibles = new Set<string>();
    articlesByDate
      .filter(a => !selectedSeccion || getMainSection(a.seccion) === selectedSeccion) // Filter by selected MAIN section
      .forEach(a => {
        if (a.autor) autoresDisponibles.add(a.autor);
      });

    // Calculate available MAIN sections based on the selected author
    const seccionesDisponibles = new Set<string>();
    articlesByDate
      .filter(a => !selectedAutor || a.autor === selectedAutor) // Filter by selected author
      .forEach(a => {
        const mainSection = getMainSection(a.seccion); // Get main section
        if (mainSection) seccionesDisponibles.add(mainSection); // Add available main section
      });

    return {
      autores,
      secciones, // Contains unique, sorted main sections
      autoresDisponibles,
      seccionesDisponibles, // Contains available main sections
    };
  }, [articlesByDate, selectedAutor, selectedSeccion]); // Dependencies are correct

  /**
   * MODIFIED: Applies secondary filters (author, MAIN SECTION) and sorting.
   */
  const filteredAndSorted = useMemo(() => {
    const dateCache = new Map<string, Date | null>();

    // Apply author and MAIN section filters
    const filtered = articlesByDate.filter(art => {
      const mainSectionOfArticle = getMainSection(art.seccion); // Get article's main section
      const matchesAutor = !selectedAutor || art.autor === selectedAutor;
      const matchesSeccion = !selectedSeccion || mainSectionOfArticle === selectedSeccion; // Compare with selected main section
      return matchesAutor && matchesSeccion;
    });

    // Pre-calculate dates for sorting if needed (no change here)
    if (sortField === 'fecha') {
      filtered.forEach(art => {
        if (!dateCache.has(art.fecha)) {
          try { dateCache.set(art.fecha, normaliseArticleDate(art.fecha)); }
          catch { dateCache.set(art.fecha, null); }
        }
      });
    }

    // Apply sorting
    const sorted = [...filtered].sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'fecha':
          const dateA = dateCache.get(a.fecha);
          const dateB = dateCache.get(b.fecha);
          if (dateA && dateB && !isNaN(dateA.getTime()) && !isNaN(dateB.getTime())) {
            comparison = dateA.getTime() - dateB.getTime(); // Base ASC
          } else if (dateA && !isNaN(dateA.getTime())) {
            comparison = -1; // Valid date A comes first
          } else if (dateB && !isNaN(dateB.getTime())) {
            comparison = 1;  // Valid date B comes first
          } else {
            comparison = 0; // Both invalid or same
          }
          break;
        case 'autor':
          comparison = (a.autor || '').localeCompare(b.autor || '', 'es', { sensitivity: 'base' });
          break;
        case 'seccion':
          // MODIFIED: Sort by MAIN section
          const mainA = getMainSection(a.seccion) || ''; // Handle undefined case
          const mainB = getMainSection(b.seccion) || ''; // Handle undefined case
          comparison = mainA.localeCompare(mainB, 'es', { sensitivity: 'base' });
          break;
      }
      // Apply sort order (ASC or DESC)
      return sortOrder === 'desc' ? (comparison * -1) : comparison;
    });

    return sorted;
  }, [articlesByDate, selectedAutor, selectedSeccion, sortField, sortOrder]); // Dependencies are correct

  // Calculate total pages based on the final filtered/sorted list
  const totalPages = Math.max(1, Math.ceil(filteredAndSorted.length / ARTICLES_PER_PAGE));

  // Get the articles for the current page
  const currentArticles = useMemo(() => {
    // Ensure currentPage is valid after filtering changes totalPages
    const safeCurrentPage = Math.min(currentPage, totalPages);
    if (currentPage !== safeCurrentPage) {
       // This could be moved to the useEffect below for better state management flow
       // but leaving it here for directness in calculation. Consider potential re-renders.
       // setCurrentPage(safeCurrentPage); // Be cautious with direct state setting inside useMemo
    }
    const pageIndex = Math.max(0, safeCurrentPage - 1); // Use safeCurrentPage
    const start = pageIndex * ARTICLES_PER_PAGE;
    const end = start + ARTICLES_PER_PAGE;
    return filteredAndSorted.slice(start, end);
  }, [filteredAndSorted, currentPage, totalPages]); // Include totalPages

  /** Calculates global metrics based on the fully filtered list. */
  const metrics: GlobalMetrics = useMemo(() => calculateMetrics(filteredAndSorted), [filteredAndSorted]);

  // --- 4. Effects ---
  // Reset to page 1 when filters or sorting change, or when date-filtered articles change
  useEffect(() => {
    // Also reset if the current page becomes invalid due to fewer total pages
    const newTotalPages = Math.max(1, Math.ceil(filteredAndSorted.length / ARTICLES_PER_PAGE));
    if (currentPage > newTotalPages) {
      setCurrentPage(1);
    } else if (currentPage !== 1) {
      // Reset only if it wasn't already page 1 (minor optimization)
      setCurrentPage(1);
    }
    // Dependency array covers all factors that change the filtered list or sorting
  }, [selectedAutor, selectedSeccion, sortField, sortOrder, filteredAndSorted.length]); // Use length as proxy for list changes


  // --- 5. Pagination Items ---
  // Recalculate pagination items when current page or total pages change
  const paginationItems = useMemo(() => generatePaginationItems(currentPage, totalPages), [currentPage, totalPages]);

  // --- 6. Render ---
  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-4">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">The trust editor</h1>
          <p className="text-lg text-gray-600">Una herramienta con IA para ayudar a las redacciones a mejorar las noticias</p>
        </header>

        {/* Pass calculated metrics and the fully filtered list to HomeMetrics */}
        <HomeMetrics articles={filteredAndSorted} metrics={metrics} />

        <section className="mt-8 md:mt-12">
          {/* Filter Controls Row */}
          <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6 lg:gap-8">
            {/* Display count from the fully filtered list */}
            <h2 className="text-xl font-semibold whitespace-nowrap">Notas ({filteredAndSorted.length})</h2>
            {/* Period Filter (no changes needed) */}
            <PeriodFilter value={range} onChange={setRange} />

            {/* Right-aligned controls container */}
            <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6 lg:gap-8 md:ml-auto">

              {/* Author Select (JSX unchanged, uses corrected data) */}
              <select value={selectedAutor} onChange={(e) => setSelectedAutor(e.target.value)} className="w-full md:w-48 px-3 py-2 border rounded-md text-sm" aria-label="Filtrar por autor">
                <option value="">Todos los autores</option>
                {autores.map((author) => (<option key={author} value={author} disabled={!autoresDisponibles.has(author)}>{author}</option>))}
              </select>

              {/* MAIN Section Select (JSX unchanged, uses corrected data) */}
              <select value={selectedSeccion} onChange={(e) => setSelectedSeccion(e.target.value)} className="w-full md:w-48 px-3 py-2 border rounded-md text-sm" aria-label="Filtrar por sección principal">
                <option value="">Todas las secciones</option>
                {/* 'secciones' now contains only main sections */}
                {secciones.map((section) => (<option key={section} value={section} disabled={!seccionesDisponibles.has(section)}>{section}</option>))}
              </select>

              {/* Sort Controls (JSX unchanged, logic handled in useMemo) */}
              <div className="flex items-center gap-2 flex-wrap justify-start md:justify-end">
                <span className="text-sm text-gray-600 shrink-0">Ordenar por:</span>
                {(['fecha', 'autor', 'seccion'] as SortField[]).map((field) => (
                  <button
                    key={field}
                    onClick={() => {
                      const newOrder = field === sortField ? (sortOrder === 'asc' ? 'desc' : 'asc') : 'desc'; // Default to desc for new field
                      setSortField(field);
                      setSortOrder(newOrder);
                    }}
                    className={`px-3 py-1 text-sm border rounded-md hover:bg-gray-100 flex items-center gap-1 whitespace-nowrap ${ sortField === field ? 'bg-blue-50 border-blue-300 text-blue-700 font-medium' : 'bg-white border-gray-300 text-gray-700' }`}
                    aria-label={`Ordenar por ${field === 'seccion' ? 'sección' : field}`}
                  >
                    {/* Capitalize labels, handle 'seccion' specifically */}
                    {field === 'seccion' ? 'Sección' : field.charAt(0).toUpperCase() + field.slice(1)}
                    {/* Show sort direction indicator */}
                    {sortField === field && (<span aria-hidden="true">{sortOrder === 'asc' ? '↑' : '↓'}</span>)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Article List (passes `currentArticles` which are correctly filtered/paged) */}
          <div className="mt-6">
            <ArticleList articles={currentArticles} />
            {/* No results messages */}
            {currentArticles.length === 0 && articles.length > 0 && ( <p className="text-center text-gray-500 py-8">No se encontraron artículos con los filtros seleccionados.</p> )}
            {articles.length === 0 && ( <p className="text-center text-gray-500 py-8">No hay artículos cargados.</p> )}
          </div>

          {/* Pagination (uses `paginationItems`, `currentPage`, `totalPages`) */}
          {totalPages > 1 && (
            <nav className="mt-6 flex justify-center items-center gap-2 flex-wrap" aria-label="Paginación">
              {/* Previous Button */}
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 border rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Anterior
              </button>
              {/* Page Number Buttons/Dots */}
              {paginationItems.map((item, index) =>
                item === DOTS ? (
                  <span key={`${DOTS}-${index}`} className="px-4 py-2 text-sm text-gray-500">
                    …
                  </span>
                ) : (
                  <button
                    key={item}
                    onClick={() => setCurrentPage(item)}
                    className={`px-4 py-2 border rounded-md text-sm font-medium ${
                      currentPage === item
                        ? 'bg-blue-500 text-white border-blue-500 z-10'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                    aria-current={currentPage === item ? 'page' : undefined}
                  >
                    {item}
                  </button>
                )
              )}
              {/* Next Button */}
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 border rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
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