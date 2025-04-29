import React, { useMemo, useState, useEffect } from 'react';
// --- Importar tipos desde ubicación central ---
// import { Article, Metrics } from '../types'; // <-- DESCOMENTA y AJUSTA RUTA si usas tipos centrales
// --- Si no usas tipos centrales, define aquí ---
interface Article { // Asegúrate que esto coincida con tus datos reales y lo esperado por los componentes
  fecha: string;
  autor: string;
  seccion: string; // Si no existe, hazla opcional (seccion?: string) o quítala
  titulo?: string;
  contenido?: string;
  id?: string;
  // Añade otros campos si son necesarios (hora, link_noticia, etc.)
}
interface Metrics {
  totalArticles: number;
  // otras métricas
}
// --- Fin Definición Tipos ---

import ArticleList from '../components/ArticleList';
import HomeMetrics from '../components/HomeMetrics';
import { calculateMetrics } from '../components/articleAnalytics';
import { loadArticles } from '../services/adapters/loadArticles';
import { useDateRange } from '../hooks/useDateRange';
import PeriodFilter from '../components/PeriodFilter';
// --- Asegúrate de tener date-fns v2 o v3 ---
import { startOfDay, endOfDay, isWithinInterval, format } from 'date-fns';
import { normaliseArticleDate } from '../services/adapters/normaliseArticleDate';

/*****************************************************
 * Home Page (v2)
 * ... (comentarios igual) ...
 *****************************************************/

// 🎚 Config
const ARTICLES_PER_PAGE = 10;

// ▸ Tipos auxiliares
type SortField = 'fecha' | 'autor' | 'seccion';
type SortOrder = 'asc' | 'desc';

// Función auxiliar para formatear fechas en logs (versión mejorada)
const formatDate = (date: Date | null): string => {
  if (!date) return 'null';
  try {
    if (date instanceof Date && !isNaN(date.getTime())) {
      // Usamos un formato consistente y legible
      return format(date, 'yyyy-MM-dd HH:mm:ss');
    }
    return `Invalid Date: ${String(date)}`;
  } catch (error) {
    console.error("Error formatting date:", date, error);
    return `Error formatting Date: ${String(date)}`;
  }
};


const Home: React.FC = () => {
  /********************
   * 1. Datos fuente
   *******************/
  const articles = useMemo(() => loadArticles() as Article[], []);

  // Log inicial (mejorado)
  useEffect(() => {
    console.log('===== DATOS CARGADOS =====');
    console.log(`Total de artículos cargados: ${articles.length}`);
    if (articles.length > 0) {
        console.log('Ejemplo primer artículo:', articles[0]);
        // Verificar campos clave
        console.log(`  Tiene fecha: ${'fecha' in articles[0]}, Tiene autor: ${'autor' in articles[0]}, Tiene seccion: ${'seccion' in articles[0]}`);
    }

    const sampleArticles = articles.slice(0, 3);
    console.log('Muestra de fechas (original -> normalizada):');
    sampleArticles.forEach((article, index) => {
        try {
            const normalizedDate = normaliseArticleDate(article.fecha);
            console.log(`[${index}] "${article.fecha}" -> ${formatDate(normalizedDate)}`);
        } catch (error) {
            const err = error as Error;
            console.error(`[${index}] Error normalizando "${article.fecha}": ${err.message}`);
        }
    });
    // ... (verificación fechas problemáticas opcional)
  }, [articles]);

  /********************
   * 2. Filtro de fecha (con start/end of day)
   *******************/
  const { range, setRange } = useDateRange();

  // Log rango
  useEffect(() => {
    console.log('===== RANGO DE FECHAS ACTUALIZADO =====');
    console.log(`Desde: ${formatDate(range.from)}`);
    console.log(`Hasta: ${formatDate(range.to)}`);
  }, [range]);

  // useMemo articlesByDate (con start/end of day y manejo de errores)
  const articlesByDate = useMemo(() => {
    console.log('===== FILTRADO POR FECHAS =====');
    if (!range.from || !range.to || isNaN(range.from.getTime()) || isNaN(range.to.getTime())) {
      console.warn('Rango inválido/incompleto. Saltando filtro.');
      return articles;
    }

    let start: Date, end: Date;
    try {
        start = startOfDay(range.from);
        end = endOfDay(range.to);
        console.log(`Aplicando filtro: ${formatDate(start)} - ${formatDate(end)}`);
    } catch (dateError) {
        console.error('❌ Error ajustando rango:', dateError);
        return articles;
    }

    let filteredCount = 0;
    const filtered = articles.filter((a) => {
      let date: Date | null = null;
      try {
        date = normaliseArticleDate(a.fecha);
        if (!date || isNaN(date.getTime())) return false; // Excluir fechas inválidas

        // Asegúrate que isWithinInterval se importa y funciona
        const isWithin = isWithinInterval(date, { start, end });
        if (isWithin) filteredCount++;
        return isWithin;
      } catch (error) {
        // Loguear error solo una vez por fecha problemática si es necesario
        return false;
      }
    });

    console.log(`Filtrado completado: ${filteredCount} artículos dentro del rango.`);
    return filtered;
  }, [articles, range]);

  /********************
   * 3. Filtros Autor / Sección + Ordenamiento
   *******************/
  const [selectedAutor, setSelectedAutor] = useState('');
  const [selectedSeccion, setSelectedSeccion] = useState('');
  const [sortField, setSortField] = useState<SortField>('fecha');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [currentPage, setCurrentPage] = useState(1);

  // useMemo opciones select (con lógica de disponibilidad)
  const { autores, secciones, autoresDisponibles, seccionesDisponibles } = useMemo(() => {
      const autoresSet = new Set(articlesByDate.map((a) => a.autor).filter(Boolean));
      const seccionesSet = new Set(articlesByDate.map((a) => a.seccion).filter(Boolean)); // Usa a.seccion

      const autoresDisponibles = new Set(
          articlesByDate
              .filter((a) => !selectedSeccion || a.seccion === selectedSeccion)
              .map((a) => a.autor)
              .filter(Boolean),
      );
      const seccionesDisponibles = new Set(
          articlesByDate
              .filter((a) => !selectedAutor || a.autor === selectedAutor)
              .map((a) => a.seccion) // Usa a.seccion
              .filter(Boolean),
      );

      return {
          autores: Array.from(autoresSet).sort((a, b) => a.localeCompare(b, 'es')),
          secciones: Array.from(seccionesSet).sort((a, b) => a.localeCompare(b, 'es')),
          autoresDisponibles,
          seccionesDisponibles,
      };
  }, [articlesByDate, selectedAutor, selectedSeccion]);

  // useEffect para ajustar página (importante)
  useEffect(() => {
      setCurrentPage(1); // Resetear a página 1 cuando cambian los filtros/orden
  }, [selectedAutor, selectedSeccion, sortField, sortOrder, articlesByDate]); // Depende de articlesByDate también

  // useMemo filteredAndSorted (con ordenamiento robusto)
  const filteredAndSorted = useMemo(() => {
    console.log('===== ORDENAMIENTO Y FILTRADO FINAL =====');
    let dateCache = new Map<string, Date | null>(); // Cache para optimizar orden por fecha

    const filtered = articlesByDate.filter(art =>
         (!selectedAutor || art.autor === selectedAutor) &&
         (!selectedSeccion || art.seccion === selectedSeccion) // Usa art.seccion
     );
     console.log(`Artículos tras filtro A/S: ${filtered.length}`);

     // Pre-cachear fechas si se ordena por fecha
     if (sortField === 'fecha') {
         filtered.forEach(art => {
             if (!dateCache.has(art.fecha)) {
                 try { dateCache.set(art.fecha, normaliseArticleDate(art.fecha)); }
                 catch { dateCache.set(art.fecha, null); }
             }
         });
     }

     const sorted = [...filtered].sort((a, b) => {
         let cmp = 0;
         if (sortField === 'fecha') {
             const dateA = dateCache.get(a.fecha);
             const dateB = dateCache.get(b.fecha);
             if (dateA && !isNaN(dateA.getTime()) && dateB && !isNaN(dateB.getTime())) { cmp = dateB.getTime() - dateA.getTime(); }
             else if (dateA && !isNaN(dateA.getTime())) { cmp = -1; } // A válida, B no
             else if (dateB && !isNaN(dateB.getTime())) { cmp = 1; } // B válida, A no
             else { cmp = (a.fecha || '').localeCompare(b.fecha || ''); } // Ambas inválidas/null
         } else if (sortField === 'autor') {
             cmp = (a.autor || '').localeCompare(b.autor || '', 'es', { sensitivity: 'base' });
         } else if (sortField === 'seccion') { // Usa a.seccion
             cmp = (a.seccion || '').localeCompare(b.seccion || '', 'es', { sensitivity: 'base' });
         }
         return sortOrder === 'asc' ? cmp : -cmp;
     });
     console.log(`Ordenamiento completado.`);
     return sorted;

  }, [articlesByDate, selectedAutor, selectedSeccion, sortField, sortOrder]);

  /********************
   * 4. Paginación
   *******************/
  const totalPages = Math.max(1, Math.ceil(filteredAndSorted.length / ARTICLES_PER_PAGE));
  const currentArticles = useMemo(() => {
    const pageIndex = Math.max(0, currentPage - 1); // currentPage es base 1
    const start = pageIndex * ARTICLES_PER_PAGE;
    const end = start + ARTICLES_PER_PAGE;
    const paginated = filteredAndSorted.slice(start, end);
    console.log(`===== PAGINACIÓN (Página ${currentPage}/${totalPages}) =====`);
    console.log(`Mostrando ${start + 1}-${start + paginated.length} de ${filteredAndSorted.length}`);
    return paginated;
  }, [filteredAndSorted, currentPage, totalPages]);

  /********************
   * 5. Métricas
   *******************/
   const metrics: Metrics = useMemo(() => {
       console.log("Calculando métricas...");
       const calculated = calculateMetrics(filteredAndSorted);
       console.log("Métricas:", calculated);
       return calculated;
   }, [filteredAndSorted]);


  /********************
   * 6. Render (Estilos Originales Restaurados)
   *******************/
  console.log("Rendering Home...");
  return (
    // --- Estructura y clases externas originales ---
    <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Encabezado Original */}
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">The trust editor</h1>
          <p className="text-lg text-gray-600">Una herramienta con IA para ayudar a las redacciones a mejorar las noticias</p>
        </header>

        {/* Métricas (Pasando props corregidas) */}
        <HomeMetrics articles={filteredAndSorted} metrics={metrics} />

        {/* --- Sección Filtros/Lista con Estructura y Clases Originales --- */}
        <section className="mt-8 md:mt-12"> {/* Sin bg-white, shadow, etc. */}
          {/* --- Div Flex Principal Original --- */}
          <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-8">
            {/* Título Notas y Filtro Fecha */}
            <h2 className="text-xl font-semibold">Notas ({filteredAndSorted.length})</h2> {/* Añadido contador */}
            <PeriodFilter value={range} onChange={setRange} />

            {/* --- Div Alineado a la Derecha Original --- */}
            <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-8 md:ml-auto">
              {/* Autor Select (Clases originales, lógica de filtro mantenida) */}
              <select
                value={selectedAutor}
                onChange={(e) => setSelectedAutor(e.target.value)} // Reset de página manejado por useEffect
                className="w-48 px-3 py-2 border rounded-md text-sm" // Clases originales
                aria-label="Filtrar por autor"
              >
                <option value="">Todos los autores</option>
                {/* Mapear sobre 'autores', deshabilitar si no está en 'autoresDisponibles' */}
                {autores.map((a) => (
                    <option key={a} value={a} disabled={!autoresDisponibles.has(a)}>
                        {a} {!autoresDisponibles.has(a) ? '' : ''} {/* Texto disabled opcional */}
                    </option>
                  ))}
              </select>

              {/* Sección Select (Clases originales, lógica de filtro mantenida) */}
              <select
                value={selectedSeccion}
                onChange={(e) => setSelectedSeccion(e.target.value)} // Reset de página manejado por useEffect
                className="w-48 px-3 py-2 border rounded-md text-sm" // Clases originales
                aria-label="Filtrar por sección"
              >
                <option value="">Todas las secciones</option>
                 {/* Mapear sobre 'secciones', deshabilitar si no está en 'seccionesDisponibles' */}
                {secciones.map((s) => (
                    <option key={s} value={s} disabled={!seccionesDisponibles.has(s)}>
                         {s} {!seccionesDisponibles.has(s) ? '' : ''} {/* Texto disabled opcional */}
                    </option>
                  ))}
              </select>

              {/* Ordenar (Clases originales) */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Ordenar por:</span>
                {(['fecha','autor','seccion'] as SortField[]).map((id) => (
                  <button
                    key={id}
                    onClick={() => {
                       // Lógica de cambio de orden (asc/desc al repetir click)
                       const newOrder = id === sortField ? (sortOrder === 'asc' ? 'desc' : 'asc') : 'desc'; // Default desc
                       setSortField(id);
                       setSortOrder(newOrder);
                    }}
                    // --- Clases originales para botones de orden ---
                    className={`px-3 py-1 text-sm border rounded-md hover:bg-gray-50 flex items-center gap-1 ${
                        sortField === id ? 'bg-blue-50 border-blue-200' : '' // Estilo activo original
                    }`}
                    aria-label={`Ordenar por ${id}`}
                  >
                    {id.charAt(0).toUpperCase() + id.slice(1)}
                    {/* Flecha de orden */}
                    {sortField === id && (
                        <span aria-hidden="true">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </button>
                ))}
              </div> {/* Fin div ordenar */}
            </div> {/* Fin div alineado derecha */}
          </div> {/* Fin div flex principal */}

          {/* Listado (Sin cambios estructurales) */}
          <div className="mt-6">
            <ArticleList articles={currentArticles} />
            {/* Mensaje si no hay resultados */}
            {currentArticles.length === 0 && filteredAndSorted.length === 0 && articles.length > 0 && (
                <p className="text-center text-gray-500 py-8">No se encontraron artículos con los filtros seleccionados.</p>
            )}
             {articles.length === 0 && (
                <p className="text-center text-gray-500 py-8">No hay artículos cargados.</p>
            )}
          </div>

          {/* Paginación (Clases y Lógica Original Simple) */}
          {totalPages > 1 && (
            // --- Nav con clases originales ---
            <nav className="mt-6 flex justify-center gap-2">
              {/* Botón Anterior (Clases originales) */}
              <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border rounded-md disabled:opacity-50" // Clases originales
              >
                  Anterior
              </button>
              {/* --- Lógica simple original para números de página --- */}
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setCurrentPage(p)}
                   // --- Clases originales para botones de página ---
                  className={`px-4 py-2 border rounded-md ${
                    currentPage === p ? 'bg-blue-500 text-white' : 'hover:bg-gray-50' // Estilo activo y hover originales
                  }`}
                  aria-current={currentPage === p ? 'page' : undefined}
                 >
                    {p}
                 </button>
              ))}
              {/* Botón Siguiente (Clases originales) */}
              <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border rounded-md disabled:opacity-50" // Clases originales
              >
                  Siguiente
              </button>
            </nav>
          )} {/* Fin Paginación */}
        </section> {/* Fin Sección Filtros/Lista */}
      </div> {/* Fin Contenedor Principal */}
    </div> /* Fin Div Externo */
  );
};

export default Home;