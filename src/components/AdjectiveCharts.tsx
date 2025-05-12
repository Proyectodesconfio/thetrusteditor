// src/components/AdjectiveCharts.tsx
import { useRef, useEffect } from 'react';
import { median as d3Median } from 'd3-array';
import { scaleLinear as d3ScaleLinear } from 'd3-scale';
import { select as d3Select } from 'd3-selection';
// Nota: Si se usaran ejes formales de D3, se importaría 'd3-axis'.

import type { Article } from '../types';

// --- Constantes de Estilo (Opcional, para centralizar colores) ---
const CHART_PRIMARY_COLOR = '#A855F7'; // Púrpura principal
const CHART_SECONDARY_COLOR = '#E9D5FF'; // Púrpura claro (fondo barra/bins)
const CHART_TEXT_COLOR = '#6B7280';    // Gris para texto
const CHART_AXIS_COLOR = '#9CA3AF';    // Gris más claro para líneas de eje

interface AdjectiveChartProps {
  articles: Article[];
}

/**
 * Gráfico de Distribución de Adjetivos.
 * Muestra puntos individuales para el porcentaje de adjetivos de cada artículo
 * sobre una barra horizontal, con la mediana resaltada con una línea vertical.
 */
export const AdjectivesDistribution = ({ articles }: AdjectiveChartProps) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // No dibujar si no hay artículos o el contenedor no está listo.
    if (!articles || articles.length === 0 || !containerRef.current) {
        // Opcional: Limpiar SVG si estaba dibujado y ahora no hay datos
        if (svgRef.current) d3Select(svgRef.current).selectAll('*').remove();
        return;
    }

    const containerWidth = containerRef.current.getBoundingClientRect().width;
    // Extraer los porcentajes de adjetivos de cada artículo, convirtiéndolos a escala 0-100.
    const percentages = articles.map(
      (a) => (a?.metrics?.adjectives?.perc_adjectives?.value ?? 0) * 100,
    );

    // --- Configuración del Gráfico de Puntos ---
    const width = containerWidth;
    const height = 60; // Altura fija para este gráfico simple
    const margin = { top: 20, right: 10, bottom: 10, left: 10 }; // Márgenes ajustados
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Calcular la mediana de los porcentajes.
    const medianValue = d3Median(percentages) ?? 0;
    // Escala lineal para mapear porcentajes (0-100) al ancho del SVG.
    const xScale = d3ScaleLinear().domain([0, 100]).range([0, innerWidth]);

    // Limpiar cualquier renderizado previo del SVG.
    const svgElement = d3Select(svgRef.current);
    svgElement.selectAll('*').remove();

    // Crear el grupo principal del SVG con los márgenes aplicados.
    const svg = svgElement
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Barra base horizontal.
    svg
      .append('rect')
      .attr('x', 0)
      .attr('y', innerHeight / 2 - 2) // Centrada verticalmente
      .attr('width', innerWidth)
      .attr('height', 4)
      .attr('rx', 2) // Bordes redondeados
      .attr('fill', CHART_SECONDARY_COLOR);

    // Puntos individuales para cada porcentaje de artículo.
    percentages.forEach((p) => {
      svg
        .append('circle')
        .attr('cx', xScale(p))
        .attr('cy', innerHeight / 2) // Centrados en la barra
        .attr('r', 3)
        .attr('fill', CHART_PRIMARY_COLOR);
    });

    // Línea vertical para la mediana.
    svg
      .append('line')
      .attr('x1', xScale(medianValue))
      .attr('x2', xScale(medianValue))
      .attr('y1', 0) // Desde un poco arriba de la barra
      .attr('y2', innerHeight + 5) // Hasta un poco abajo de la barra
      .attr('stroke', CHART_PRIMARY_COLOR)
      .attr('stroke-width', 2); // Ancho ajustado

    // Etiqueta de texto para la mediana.
    svg
      .append('text')
      .attr('x', xScale(medianValue))
      .attr('y', -4) // Posición encima de la línea de mediana
      .attr('text-anchor', 'middle')
      .style('font-size', '11px') // Estilo de fuente
      .attr('fill', CHART_TEXT_COLOR)
      .text(`Mediana: ${medianValue.toFixed(1)}%`);

  }, [articles, containerRef.current]); // Depender de articles y el contenedor actual para redibujar si cambian

  return (
    <div ref={containerRef} className="w-full my-2"> {/* Añadido margen vertical */}
      <svg ref={svgRef} />
    </div>
  );
};

/**
 * Histograma de Adjetivos.
 * Muestra la distribución de los porcentajes de adjetivos en "bins" (rangos),
 * con la mediana de los datos originales resaltada.
 */
export const AdjectivesHistogram = ({ articles }: AdjectiveChartProps) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!articles || articles.length === 0 || !containerRef.current) {
        if (svgRef.current) d3Select(svgRef.current).selectAll('*').remove();
        return;
    }

    const containerWidth = containerRef.current.getBoundingClientRect().width;
    // Extraer porcentajes y filtrar aquellos que excedan 100 (si es posible en los datos).
    const percentages = articles
      .map((a) => (a?.metrics?.adjectives?.perc_adjectives?.value ?? 0) * 100)
      .filter((v) => v >= 0 && v <= 100); // Asegurar que los % estén entre 0 y 100

    if (percentages.length === 0) { // Si no hay datos válidos después de filtrar
        if (svgRef.current) d3Select(svgRef.current).selectAll('*').remove();
        // Opcional: Mostrar un mensaje "No hay datos válidos para el histograma"
        return;
    }

    // --- Configuración del Histograma ---
    const numBins = 20; // Número de "contenedores" o barras en el histograma
    const binSize = 100 / numBins; // Tamaño de cada bin (ej: 5 para 20 bins en un rango 0-100)
    const bins = Array(numBins).fill(0); // Array para almacenar el conteo de cada bin

    // Agrupar porcentajes en los bins.
    percentages.forEach((p) => {
      const binIndex = Math.min(Math.floor(p / binSize), numBins - 1);
      bins[binIndex]++;
    });

    const maxBinCount = Math.max(...bins); // El conteo más alto en un solo bin (para la escala Y)

    // --- Dimensiones y Márgenes del SVG ---
    const width = containerWidth;
    const height = 100; // Altura fija
    const margin = { top: 20, right: 15, bottom: 30, left: 15 }; // Márgenes ajustados
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Escalas D3.
    const xScale = d3ScaleLinear().domain([0, 100]).range([0, innerWidth]); // Porcentaje (0-100) a ancho
    const yScale = d3ScaleLinear().domain([0, maxBinCount]).range([innerHeight, 0]); // Conteo a altura (invertido)

    // Limpiar SVG.
    const svgElement = d3Select(svgRef.current);
    svgElement.selectAll('*').remove();

    const svg = svgElement
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Dibujar las barras del histograma.
    const barWidth = innerWidth / numBins - 1; // Ancho de cada barra con un pequeño espacio
    bins.forEach((count, i) => {
      if (count === 0) return; // No dibujar barras para bins vacíos
      svg
        .append('rect')
        .attr('x', xScale(i * binSize))
        .attr('y', yScale(count))
        .attr('width', barWidth)
        .attr('height', innerHeight - yScale(count))
        .attr('fill', CHART_PRIMARY_COLOR)
        .attr('fill-opacity', 0.5) // Opacidad para ver superposiciones si las hubiera
        .attr('rx', 2);
    });

    // Eje X (línea base).
    svg
      .append('line')
      .attr('x1', 0)
      .attr('x2', innerWidth)
      .attr('y1', innerHeight)
      .attr('y2', innerHeight)
      .attr('stroke', CHART_AXIS_COLOR)
      .attr('stroke-width', 1);

    // Marcas y etiquetas del Eje X (0%, 50%, 100%).
    [0, 50, 100].forEach((value) => {
      svg // Línea de marca
        .append('line')
        .attr('x1', xScale(value))
        .attr('x2', xScale(value))
        .attr('y1', innerHeight)
        .attr('y2', innerHeight + 4) // Longitud de la marca
        .attr('stroke', CHART_AXIS_COLOR)
        .attr('stroke-width', 1);

      svg // Etiqueta de texto
        .append('text')
        .attr('x', xScale(value))
        .attr('y', innerHeight + 16) // Posición debajo de la marca
        .attr('text-anchor', 'middle')
        .style('font-size', '10px') // Tamaño ajustado
        .attr('fill', CHART_TEXT_COLOR)
        .text(`${value}%`);
    });

    // Línea y etiqueta de la Mediana.
    const medianValue = d3Median(percentages) ?? 0;
    svg
      .append('line')
      .attr('x1', xScale(medianValue))
      .attr('x2', xScale(medianValue))
      .attr('y1', -2) // Desde un poco arriba del área de barras
      .attr('y2', innerHeight)
      .attr('stroke', CHART_PRIMARY_COLOR)
      .attr('stroke-width', 1.5);

    svg
      .append('text')
      .attr('x', xScale(medianValue))
      .attr('y', -5) // Posición encima de la línea
      .attr('text-anchor', 'middle')
      .style('font-size', '11px')
      .attr('fill', CHART_TEXT_COLOR)
      .text(`Mediana: ${medianValue.toFixed(1)}%`);

  }, [articles, containerRef.current]);

  return (
    <div ref={containerRef} className="w-full my-2"> {/* Añadido margen vertical */}
      <svg ref={svgRef} />
    </div>
  );
};