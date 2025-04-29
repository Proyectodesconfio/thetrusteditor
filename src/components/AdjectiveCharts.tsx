import * as d3 from 'd3';
import { useRef, useEffect } from 'react';
import type { Article } from '../types';

/**
 * Gráfico de distribución de adjetivos que muestra puntos sobre una barra
 * con la mediana resaltada
 */
export const AdjectivesDistribution = ({ articles }: { articles: Article[] }) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!articles?.length || !containerRef.current) return;

    const containerWidth = containerRef.current.getBoundingClientRect().width;
    const percentages = articles.map(
      (a) => (a?.metrics?.adjectives?.perc_adjectives?.value ?? 0) * 100,
    );

    /* -- Gráfico de puntos sobre barra -------------------------------------------------- */
    const width = containerWidth;
    const height = 60;
    const margin = { top: 20, right: 0, bottom: 10, left: 0 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const median = d3.median(percentages) ?? 0;
    const xScale = d3.scaleLinear().domain([0, 100]).range([0, innerWidth]);

    // Limpiar render previo
    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3
      .select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Barra base
    svg
      .append('rect')
      .attr('x', 0)
      .attr('y', innerHeight / 2 - 2)
      .attr('width', innerWidth)
      .attr('height', 4)
      .attr('rx', 2)
      .attr('fill', '#E9D5FF');

    // Puntos individuales
    percentages.forEach((p) => {
      svg
        .append('circle')
        .attr('cx', xScale(p))
        .attr('cy', innerHeight / 2)
        .attr('r', 3)
        .attr('fill', '#A855F7');
    });

    // Línea y etiqueta de mediana
    svg
      .append('line')
      .attr('x1', xScale(median))
      .attr('x2', xScale(median))
      .attr('y1', 5)
      .attr('y2', innerHeight)
      .attr('stroke', '#A855F7')
      .attr('stroke-width', 4);

    svg
      .append('text')
      .attr('x', xScale(median))
      .attr('y', 0)
      .attr('text-anchor', 'middle')
      .attr('font-size', '12px')
      .attr('fill', '#6B7280')
      .text(`Mediana ${median.toFixed(1)}%`);
  }, [articles]);

  return (
    <div ref={containerRef} className="w-full">
      <svg ref={svgRef} />
    </div>
  );
};

/**
 * Histograma de adjetivos que muestra la distribución de porcentajes
 * con la mediana resaltada
 */
export const AdjectivesHistogram = ({ articles }: { articles: Article[] }) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!articles?.length || !containerRef.current) return;

    const containerWidth = containerRef.current.getBoundingClientRect().width;
    const percentages = articles
      .map((a) => (a?.metrics?.adjectives?.perc_adjectives?.value ?? 0) * 100)
      .filter((v) => v <= 100);

    /* -- Histograma -------------------------------------------------------------------- */
    const bins = Array(20).fill(0);
    percentages.forEach((p) => {
      const idx = Math.min(Math.floor(p / 5), 19);
      bins[idx]++;
    });

    const maxBin = Math.max(...bins);

    const width = containerWidth;
    const height = 100;
    const margin = { top: 20, right: 20, bottom: 20, left: 20 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const xScale = d3.scaleLinear().domain([0, 100]).range([0, innerWidth]);
    const yScale = d3.scaleLinear().domain([0, maxBin]).range([innerHeight, 0]);

    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3
      .select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Barras
    bins.forEach((count, i) => {
      svg
        .append('rect')
        .attr('x', xScale(i * 5))
        .attr('y', yScale(count))
        .attr('width', innerWidth / 20 - 1)
        .attr('height', innerHeight - yScale(count))
        .attr('fill', '#A855F7')
        .attr('fill-opacity', 0.35)
        .attr('rx', 2);
    });

    // Eje X
    svg
      .append('line')
      .attr('x1', 0)
      .attr('x2', innerWidth)
      .attr('y1', innerHeight)
      .attr('y2', innerHeight)
      .attr('stroke', '#6B7280')
      .attr('stroke-width', 1);

    // Marcas X
    [0, 50, 100].forEach((v) => {
      svg
        .append('line')
        .attr('x1', xScale(v))
        .attr('x2', xScale(v))
        .attr('y1', innerHeight)
        .attr('y2', innerHeight + 5)
        .attr('stroke', '#9CA3AF')
        .attr('stroke-width', 1);

      svg
        .append('text')
        .attr('x', xScale(v))
        .attr('y', innerHeight + 15)
        .attr('text-anchor', 'middle')
        .attr('font-size', '12px')
        .attr('fill', '#6B7280')
        .text(`${v}%`);
    });

    const median = d3.median(percentages) ?? 0;
    svg
      .append('line')
      .attr('x1', xScale(median))
      .attr('x2', xScale(median))
      .attr('y1', 0)
      .attr('y2', innerHeight)
      .attr('stroke', '#A855F7')
      .attr('stroke-width', 2);

    svg
      .append('text')
      .attr('x', xScale(median))
      .attr('y', -5)
      .attr('text-anchor', 'middle')
      .attr('font-size', '12px')
      .attr('fill', '#6B7280')
      .text(`Mediana ${median.toFixed(1)}%`);
  }, [articles]);

  return (
    <div ref={containerRef} className="w-full">
      <svg ref={svgRef} />
    </div>
  );
};