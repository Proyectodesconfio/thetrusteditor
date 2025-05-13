// src/pages/Home.tsx
import React, { useMemo, useState, useEffect, useRef } from 'react';

// --- Core Component Imports ---
import ArticleList from '../components/ArticleList';
import HomeMetrics from '../components/HomeMetrics';

// --- Data & Logic Imports ---
import { loadArticles } from '../services/adapters/loadArticles';
import { normaliseArticleDate } from '../services/adapters/normaliseArticleDate';
import { calculateMetrics } from '../components/articleAnalytics';

// --- Type Imports ---
import { Article, GlobalMetrics } from '../types';

// --- Utility Imports ---
import { subHours, isFuture } from 'date-fns'; // AÑADIDO isFuture

// --- Constants ---
const INITIAL_VISIBLE_COUNT = 15;
const LOAD_MORE_COUNT = 10;

// --- Types ---
type SortField = 'fecha' | 'autor' | 'seccion';
type SortOrder = 'asc' | 'desc';

// --- Helper Function ---
const getMainSection = (fullSection: string | undefined): string | undefined => {
  if (!fullSection) {
    return undefined;
  }
  return fullSection.split('/')[0].trim();
};

/**
 * Home page component.
 * Displays articles from the last 48 hours (and not in the future)
 * with filtering (author, main section), sorting, and infinite scroll.
 */
const Home: React.FC = () => {

  // --- 1. Data Fetching ---
  const allArticles = useMemo(() => loadArticles() as Article[], []);

  // --- 2. State Management ---
  const [selectedAutor, setSelectedAutor] = useState<string>('');
  const [selectedSeccion, setSelectedSeccion] = useState<string>('');
  const [sortField, setSortField] = useState<SortField>('fecha');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [visibleCount, setVisibleCount] = useState<number>(INITIAL_VISIBLE_COUNT);
  const observerTargetRef = useRef<HTMLDivElement | null>(null);

  // --- 3. Derived Data & Memoized Calculations ---

  /** MODIFIED: Filter articles to include only those from the last 48 hours AND NOT IN THE FUTURE */
  const articlesLast48h = useMemo(() => {
    const now = new Date(); // Momento actual
    const timeLimit48hAgo = subHours(now, 48); // Límite de 48 horas hacia atrás

    // console.log(`[Home.tsx] Filtrando artículos entre: ${timeLimit48hAgo.toISOString()} y ${now.toISOString()}`);

    return allArticles.filter((article) => {
      try {
        const articleDate = normaliseArticleDate(article.fecha);

        // Si la fecha no es válida, excluir el artículo
        if (!articleDate || isNaN(articleDate.getTime())) {
          // console.warn(`[Home.tsx] Fecha inválida para artículo ID: ${article.id}, valor: ${article.fecha}`);
          return false;
        }

        // Condición 1: La fecha del artículo debe ser posterior o igual al límite de 48 horas.
        const isWithinLast48h = articleDate >= timeLimit48hAgo;

        // Condición 2: La fecha del artículo NO debe ser futura.
        const isNotFuture = !isFuture(articleDate); // Usar isFuture de date-fns

        // El artículo se incluye si cumple AMBAS condiciones.
        return isWithinLast48h && isNotFuture;

      } catch (e) {
        // console.warn(`[Home.tsx] Error al parsear fecha para artículo ID: ${article.id}, valor: ${article.fecha}`, e);
        return false; // Excluir artículos con errores de parseo de fecha
      }
    });
  }, [allArticles]);

  const { autores, secciones, autoresDisponibles, seccionesDisponibles } = useMemo(() => {
    const autoresSet = new Set<string>();
    const seccionesPrincipalesSet = new Set<string>();
    articlesLast48h.forEach(a => {
      if (a.autor) autoresSet.add(a.autor);
      const mainSection = getMainSection(a.seccion);
      if (mainSection) seccionesPrincipalesSet.add(mainSection);
    });
    const autoresArr = Array.from(autoresSet).sort((a, b) => a.localeCompare(b, 'es'));
    const seccionesArr = Array.from(seccionesPrincipalesSet).sort((a, b) => a.localeCompare(b, 'es'));
    const autoresDisp = new Set<string>();
    articlesLast48h
      .filter(a => !selectedSeccion || getMainSection(a.seccion) === selectedSeccion)
      .forEach(a => { if (a.autor) autoresDisp.add(a.autor); });
    const seccionesDisp = new Set<string>();
    articlesLast48h
      .filter(a => !selectedAutor || a.autor === selectedAutor)
      .forEach(a => {
        const mainSection = getMainSection(a.seccion);
        if (mainSection) seccionesDisp.add(mainSection);
      });
    return { autores: autoresArr, secciones: seccionesArr, autoresDisponibles: autoresDisp, seccionesDisponibles: seccionesDisp };
  }, [articlesLast48h, selectedAutor, selectedSeccion]);

  const filteredAndSorted = useMemo(() => {
    const dateCache = new Map<string, Date | null>();
    const filtered = articlesLast48h.filter(art => {
      const mainSectionOfArticle = getMainSection(art.seccion);
      const matchesAutor = !selectedAutor || art.autor === selectedAutor;
      const matchesSeccion = !selectedSeccion || mainSectionOfArticle === selectedSeccion;
      return matchesAutor && matchesSeccion;
    });
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
          const dateA = dateCache.get(a.fecha);
          const dateB = dateCache.get(b.fecha);
          if (dateA && dateB && !isNaN(dateA.getTime()) && !isNaN(dateB.getTime())) {
            comparison = dateA.getTime() - dateB.getTime();
          } else if (dateA && !isNaN(dateA.getTime())) { comparison = -1; }
          else if (dateB && !isNaN(dateB.getTime())) { comparison = 1; }
          else { comparison = 0; }
          break;
        case 'autor':
          comparison = (a.autor || '').localeCompare(b.autor || '', 'es', { sensitivity: 'base' });
          break;
        case 'seccion':
          const mainA = getMainSection(a.seccion) || '';
          const mainB = getMainSection(b.seccion) || '';
          comparison = mainA.localeCompare(mainB, 'es', { sensitivity: 'base' });
          break;
      }
      return sortOrder === 'desc' ? (comparison * -1) : comparison;
    });
    return sorted;
  }, [articlesLast48h, selectedAutor, selectedSeccion, sortField, sortOrder]);

  const metrics: GlobalMetrics = useMemo(() => calculateMetrics(filteredAndSorted), [filteredAndSorted]);
  const visibleArticles = useMemo(() => {
    return filteredAndSorted.slice(0, visibleCount);
  }, [filteredAndSorted, visibleCount]);

  // --- 4. Effects ---
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const target = entries[0];
        if (target.isIntersecting) {
          if (visibleCount < filteredAndSorted.length) {
            setVisibleCount(prevCount => prevCount + LOAD_MORE_COUNT);
          }
        }
      },
      { root: null, rootMargin: '0px', threshold: 1.0 }
    );
    const currentTarget = observerTargetRef.current;
    if (currentTarget) observer.observe(currentTarget);
    return () => {
      if (currentTarget) observer.unobserve(currentTarget);
      observer.disconnect();
    };
  }, [filteredAndSorted.length, visibleCount]);

  useEffect(() => {
    setVisibleCount(INITIAL_VISIBLE_COUNT);
  }, [selectedAutor, selectedSeccion, sortField, sortOrder]);

  // --- 6. Render ---
  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-4">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">The trust editor</h1>
          <p className="text-lg text-gray-600">Una herramienta con IA para ayudar a las redacciones a mejorar las noticias</p>
        </header>
        <HomeMetrics metrics={metrics} />
        <section className="mt-8 md:mt-12">
          <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6 lg:gap-8 mb-6">
            <h2 className="text-xl font-semibold whitespace-nowrap">Notas ({filteredAndSorted.length})</h2>
            <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6 lg:gap-8 md:ml-auto">
              <select value={selectedAutor} onChange={(e) => setSelectedAutor(e.target.value)} className="w-full md:w-48 px-3 py-2 border rounded-md text-sm bg-white shadow-sm" aria-label="Filtrar por autor">
                <option value="">Todos los autores</option>
                {autores.map((author) => (<option key={author} value={author} disabled={!autoresDisponibles.has(author)}>{author}</option>))}
              </select>
              <select value={selectedSeccion} onChange={(e) => setSelectedSeccion(e.target.value)} className="w-full md:w-48 px-3 py-2 border rounded-md text-sm bg-white shadow-sm" aria-label="Filtrar por sección principal">
                <option value="">Todas las secciones</option>
                {secciones.map((section) => (<option key={section} value={section} disabled={!seccionesDisponibles.has(section)}>{section}</option>))}
              </select>
              <div className="flex items-center gap-2 flex-wrap justify-start md:justify-end">
                <span className="text-sm text-gray-600 shrink-0">Ordenar por:</span>
                {(['fecha', 'autor', 'seccion'] as SortField[]).map((field) => (
                  <button
                    key={field}
                    onClick={() => {
                      const newOrder = field === sortField ? (sortOrder === 'asc' ? 'desc' : 'asc') : 'desc';
                      setSortField(field); setSortOrder(newOrder);
                    }}
                    className={`px-3 py-1 text-sm border rounded-md hover:bg-gray-100 flex items-center gap-1 whitespace-nowrap shadow-sm ${ sortField === field ? 'bg-blue-100 border-blue-300 text-blue-800 font-medium' : 'bg-white border-gray-300 text-gray-700' }`}
                    aria-label={`Ordenar por ${field === 'seccion' ? 'sección' : field}`}
                  >
                    {field === 'seccion' ? 'Sección' : field.charAt(0).toUpperCase() + field.slice(1)}
                    {sortField === field && (<span aria-hidden="true">{sortOrder === 'asc' ? '↑' : '↓'}</span>)}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-6">
            <ArticleList articles={visibleArticles} />
            {filteredAndSorted.length === 0 && articlesLast48h.length > 0 && (
              <p className="text-center text-gray-500 py-8">No se encontraron artículos en las últimas 48 horas (y no futuros) con los filtros seleccionados.</p>
            )}
            {articlesLast48h.length === 0 && allArticles.length > 0 && (
              <p className="text-center text-gray-500 py-8">No hay artículos publicados en las últimas 48 horas (y no futuros).</p>
            )}
            {allArticles.length === 0 && (
              <p className="text-center text-gray-500 py-8">No hay artículos cargados.</p>
            )}
          </div>
          <div ref={observerTargetRef} className="h-16 flex justify-center items-center text-center">
            {visibleCount < filteredAndSorted.length && (
                <span className="text-gray-500 text-sm animate-pulse">
                  Cargando más notas...
                </span>
            )}
             {visibleArticles.length > 0 && visibleCount >= filteredAndSorted.length && (
                 <span className="text-gray-400 text-xs">Has llegado al final.</span>
             )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Home;