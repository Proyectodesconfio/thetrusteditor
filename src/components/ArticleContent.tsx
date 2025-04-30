// src/components/ArticleContent.tsx
import React, { useMemo } from 'react';
import type { Article, ArticleSentiment, SourceCitation, HighestScoringSentence } from '../types';
import { FilterType } from './ArticleHeader';

interface HighlightRange {
    start: number;
    end: number;
    type: FilterType;
    className: string;
    data?: any;
    // Añadir un ID único para el key de React
    id: string;
}

interface ArticleContentProps {
    title: string;
    content: string;
    author: string;
    date: string;
    activeFilters: string[];
    entities?: Article['entities'];
    adjectives?: Article['adjectives'];
    sentiment?: ArticleSentiment | null;
    sources?: SourceCitation[] | null;
}

// --- Colores y Estilos ---
const highlightStyles: Record<FilterType, string> = {
    'Entidades': 'bg-cyan-100 text-cyan-800 px-0.5 rounded mx-px',
    'Adjetivos': 'bg-purple-100 text-purple-800 px-0.5 rounded mx-px',
    'Sentimientos': 'block my-1.5 px-2 py-1 border-l-4 rounded-r-md italic', // Base style for block
    'Fuentes': 'block my-1 border border-dashed px-1 rounded mx-px bg-amber-50 text-amber-800 border-amber-300', // Base style for block
};

const sentimentColors: Record<'POS' | 'NEU' | 'NEG', { bg: string; text: string; border: string }> = {
    'POS': { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-300' },
    'NEU': { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-300' },
    'NEG': { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-300' },
};

// --- Función de Resaltado ---
const renderHighlightedContent = (
    content: string,
    activeFilters: string[],
    entitiesData: Article['entities'] | undefined,
    adjectivesData: Article['adjectives'] | undefined,
    sentimentData: ArticleSentiment | null | undefined,
    sourcesData: SourceCitation[] | null | undefined
): (JSX.Element | string)[] => {

    const highlights: HighlightRange[] = [];
    const activeFilterSet = new Set(activeFilters);
    let highlightCounter = 0; // Para generar IDs únicos

    // 1. Recopilar todos los highlights posibles
    if (activeFilterSet.has('Entidades') && entitiesData?.entities_list) {
        entitiesData.entities_list.forEach((entity, idx) => highlights.push({
            start: entity.start_char, end: entity.end_char, type: 'Entidades', id: `ent-${idx}`,
            className: highlightStyles['Entidades'], data: entity.type
        }));
    }
    if (activeFilterSet.has('Adjetivos') && adjectivesData?.adjectives_list) {
        adjectivesData.adjectives_list.forEach((adj, idx) => highlights.push({
            start: adj.start_char, end: adj.end_char, type: 'Adjetivos', id: `adj-${idx}`,
            className: highlightStyles['Adjetivos']
        }));
    }
    if (activeFilterSet.has('Sentimientos') && sentimentData?.highest_scoring_sentence_per_label) {
        const processSentence = (sentenceInfo: HighestScoringSentence | undefined, type: 'POS' | 'NEU' | 'NEG') => {
            if (!sentenceInfo) return;
            const colors = sentimentColors[type];
            highlights.push({
                start: sentenceInfo.start_char, end: sentenceInfo.end_char, type: 'Sentimientos', id: `sen-${type}`,
                className: `${highlightStyles['Sentimientos']} ${colors.bg} ${colors.text} ${colors.border}`,
                data: type
            });
        };
        processSentence(sentimentData.highest_scoring_sentence_per_label.POS, 'POS');
        processSentence(sentimentData.highest_scoring_sentence_per_label.NEU, 'NEU');
        processSentence(sentimentData.highest_scoring_sentence_per_label.NEG, 'NEG');
    }
    if (activeFilterSet.has('Fuentes') && sourcesData) {
        sourcesData.forEach((source, idx) => highlights.push({
            start: source.start_char, end: source.end_char, type: 'Fuentes', id: `src-${idx}`,
            className: highlightStyles['Fuentes'],
            data: source.components?.referenciado?.text
        }));
    }

    // Si no hay filtros activos o no se encontraron highlights
    if (highlights.length === 0) {
        return content.split('\n').filter(p => p.trim() !== '').map((p, index) => <p key={`p-${index}`}>{p}</p>);
    }

    // 2. Crear "eventos" de inicio y fin para cada highlight
    type PointEvent = { index: number; type: 'START' | 'END'; highlight: HighlightRange };
    const points: PointEvent[] = [];
    highlights.forEach(h => {
        // Ignorar highlights inválidos o de longitud cero
        if (h.start >= h.end) return;
        points.push({ index: h.start, type: 'START', highlight: h });
        points.push({ index: h.end, type: 'END', highlight: h });
    });

    // Ordenar eventos por índice, los END van antes que los START en el mismo índice
    points.sort((a, b) => {
        if (a.index !== b.index) return a.index - b.index;
        return a.type === 'END' ? -1 : 1; // ENDs first
    });

    // 3. Construir el resultado iterando por los puntos
    const result: (JSX.Element | string)[] = [];
    let lastIndex = 0;
    const activeHighlightStack: HighlightRange[] = []; // Pila para manejar anidamiento

    points.forEach(point => {
        // Añadir texto normal antes del punto actual
        if (point.index > lastIndex) {
            result.push(content.substring(lastIndex, point.index));
        }

        if (point.type === 'START') {
            activeHighlightStack.push(point.highlight); // Añadir a la pila
        } else { // END event
            // Quitar de la pila (buscar por ID por si acaso)
            const stackIndex = activeHighlightStack.findIndex(h => h.id === point.highlight.id);
            if (stackIndex > -1) {
                activeHighlightStack.splice(stackIndex, 1);
            }
        }

        // Actualizar el índice
        lastIndex = point.index;

        // Determinar las clases combinadas del highlight activo (el último en la pila)
        // Esto es una simplificación: solo toma el estilo del más interno/último añadido.
        // Una combinación real de clases requeriría lógica CSS más compleja.
        const currentHighlight = activeHighlightStack.length > 0 ? activeHighlightStack[activeHighlightStack.length - 1] : null;

        // Si hay un highlight activo para el *siguiente* segmento (hasta el próximo punto)
        // Esto es parte de la lógica que necesitaría una librería de rangos,
        // por ahora, el enfoque anterior de reconstruir párrafos es más simple,
        // aunque menos preciso con anidamientos visuales profundos.

        // --- VAMOS A VOLVER AL ENFOQUE MÁS SIMPLE DE ANIDACIÓN DE MARKS ---
        // La lógica de puntos es más precisa pero compleja de implementar correctamente aquí.
        // El enfoque anterior con ordenamiento y renderizado iterativo anidará
        // las etiquetas <mark> y dependerá del CSS para la visualización.
    });

    // --- Reconstrucción de Párrafos (Misma lógica simplificada que antes) ---
    // Re-usando la lógica anterior que anida <mark>s
    highlights.sort((a, b) => a.start - b.start); // Asegurar orden inicial
    const nestedResult: (JSX.Element | string)[] = [];
    let currentIndex = 0;

    highlights.forEach((highlight, i) => {
        // Permitir solapamientos parciales, pero evitar duplicados exactos
         if (highlight.start < currentIndex && highlight.end <= currentIndex) {
            return; // Totalmente contenido y ya procesado
         }
         // Corregir inicio si se solapa
         const actualStart = Math.max(highlight.start, currentIndex);

        // Añadir texto normal antes
        if (actualStart > currentIndex) {
            nestedResult.push(content.substring(currentIndex, actualStart));
        }
        // Añadir el resaltado (asegurándose de no ir más allá del contenido)
         const actualEnd = Math.min(highlight.end, content.length);
         if (actualEnd > actualStart) { // Solo renderizar si hay longitud
            nestedResult.push(
                <mark key={highlight.id} className={highlight.className} title={typeof highlight.data === 'string' ? highlight.data : highlight.type}>
                    {content.substring(actualStart, actualEnd)}
                </mark>
            );
        }
        // Actualizar índice al final de este highlight (permite anidamiento)
        currentIndex = actualEnd;
    });

    // Añadir texto restante
    if (currentIndex < content.length) {
        nestedResult.push(content.substring(currentIndex));
    }


    // Dividir el resultado final en párrafos
    const finalOutput: JSX.Element[] = [];
    let currentParagraph: (JSX.Element | string)[] = [];
    nestedResult.forEach((segment) => {
        if (typeof segment === 'string') {
            const parts = segment.split('\n');
            parts.forEach((part, partIndex) => {
                if (part.length > 0) currentParagraph.push(part);
                if (partIndex < parts.length - 1) { // Hubo un \n
                    if (currentParagraph.length > 0) finalOutput.push(<p key={`p-${finalOutput.length}`}>{currentParagraph.map((s, si) => <React.Fragment key={si}>{s}</React.Fragment>)}</p>);
                    currentParagraph = [];
                }
            });
        } else { // Es un <mark>
            currentParagraph.push(segment);
        }
    });
    if (currentParagraph.length > 0) finalOutput.push(<p key={`p-${finalOutput.length}`}>{currentParagraph.map((s, si) => <React.Fragment key={si}>{s}</React.Fragment>)}</p>);

    return finalOutput.length > 0 ? finalOutput : [<p key="empty">{content || ""}</p>];
};


// --- Componente Principal ---
const ArticleContent: React.FC<ArticleContentProps> = ({
    title, content, author, date, activeFilters, entities, adjectives, sentiment, sources
}) => {
    const processedContent = useMemo(() => renderHighlightedContent(
        content, activeFilters, entities, adjectives, sentiment, sources
    ), [content, activeFilters, entities, adjectives, sentiment, sources]);

    return (
        <article className="bg-white rounded-lg p-4 md:p-6 shadow-sm">
            <h1 className="text-xl md:text-2xl font-bold mb-2 text-gray-900">{title}</h1>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500 mb-6">
                <span>Por: <span className="font-medium text-gray-700">{author || 'Desconocido'}</span></span>
                <span>Fecha: <span className="font-medium text-gray-700">{date || 'N/A'}</span></span>
            </div>
            <div className="prose prose-sm sm:prose-base max-w-none whitespace-pre-wrap text-gray-800">
                {processedContent}
            </div>
        </article>
    );
};

export default ArticleContent;