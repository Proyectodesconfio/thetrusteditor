// src/components/ArticleContent.tsx
import React, { useMemo } from 'react';
import type { Article, ArticleSentiment, SourceCitation, HighestScoringSentence } from '../types';
import { FilterType } from './ArticleHeader';
// ... (interfaces HighlightRange, ArticleContentProps sin cambios) ...
interface HighlightRange { start: number; end: number; type: FilterType; className: string; data?: any; id: string; }
interface ArticleContentProps { title: string; content: string; author?: string; date?: string; activeFilters: FilterType[]; entities?: Article['entities']; adjectives?: Article['adjectives']; sentiment?: ArticleSentiment | null; sources?: SourceCitation[] | null; }
// ESTILOS (sin cambios respecto a la última versión)
const highlightStylesNew: Record<FilterType | 'POS' | 'NEU' | 'NEG', string> = {
'Entidades': 'bg-cyan-500 text-white px-1.5 py-0.5 rounded-md mx-px font-semibold shadow-sm',
'Adjetivos': 'bg-purple-500 text-white px-1.5 py-0.5 rounded-md mx-px italic shadow-sm',
'Sentimientos': 'px-1 py-0.5 rounded-sm mx-px',
'POS': 'bg-green-200 text-green-900 font-semibold',
'NEU': 'bg-gray-200 text-gray-800',
'NEG': 'bg-red-200 text-red-900 font-semibold',
'Fuentes': 'my-3 p-1 border-l-4 border-amber-500 bg-amber-50 text-amber-900 text-sm rounded-r-md shadow-md',
};
// --- FUNCIÓN PARA PROCESAR HIGHLIGHTS INLINE DENTRO DE UN TEXTO DADO ---
const applyInlineHighlightsToText = (
textSegment: string,
allPossibleInlineHighlights: HighlightRange[], // Lista completa de E, A, S (ya filtrados por activos)
segmentOriginalStartOffset: number // El índice de inicio de textSegment en el content original
): (string | JSX.Element)[] => {
if (!textSegment) return [''];
// Filtrar y ajustar los highlights que realmente caen DENTRO de este textSegment
const relevantInlineHighlights = allPossibleInlineHighlights
    .filter(h => h.type !== 'Fuentes') // Solo procesar inline aquí
    .map(h => ({
        ...h,
        // Ajustar offsets para que sean relativos a este textSegment
        start: h.start - segmentOriginalStartOffset,
        end: h.end - segmentOriginalStartOffset,
    }))
    .filter(h => h.start < textSegment.length && h.end > 0 && h.start < h.end && h.start >= 0) // Dentro de los límites y válidos
    .sort((a, b) => { // Los más largos y externos primero
        if (a.start !== b.start) return a.start - b.start;
        return b.end - a.end;
    });

if (relevantInlineHighlights.length === 0) return [textSegment];

const output: (string | JSX.Element)[] = [];
let cursor = 0;

for (const highlight of relevantInlineHighlights) {
    if (highlight.end <= cursor || highlight.start >= textSegment.length) continue; // Ya procesado o fuera de rango

    const actualStart = Math.max(highlight.start, cursor);

    if (actualStart > cursor) {
        output.push(textSegment.substring(cursor, actualStart));
    }

    const actualEnd = Math.min(highlight.end, textSegment.length);
    const highlightedTextContent = textSegment.substring(actualStart, actualEnd);

    if (highlightedTextContent.length > 0) {
        // Para los inline, recursivamente aplicar los que estén dentro.
        const innerHighlights = relevantInlineHighlights.filter(
            inner_h =>
                inner_h.id !== highlight.id &&
                inner_h.start >= actualStart &&
                inner_h.end <= actualEnd &&
                (inner_h.start > actualStart || inner_h.end < actualEnd)
        );
        output.push(
            <mark key={highlight.id} className={highlight.className} title={typeof highlight.data === 'string' ? highlight.data : highlight.type}>
                {applyInlineHighlightsToText(highlightedTextContent, innerHighlights, actualStart)}
            </mark>
        );
    }
    cursor = Math.max(cursor, actualEnd);
}

if (cursor < textSegment.length) {
    output.push(textSegment.substring(cursor));
}
return output.length > 0 ? output : [textSegment];

};
const renderHighlightedContent = (
content: string,
activeFilters: FilterType[],
entitiesData: Article['entities'] | undefined,
adjectivesData: Article['adjectives'] | undefined,
sentimentData: ArticleSentiment | null | undefined,
sourcesData: SourceCitation[] | null | undefined
): (JSX.Element | string)[] => {
const allHighlights: HighlightRange[] = [];
const activeFilterSet = new Set(activeFilters);

// 1. Recopilar todos los highlights
// ... (código de recopilación de allHighlights como en la respuesta anterior, sin cambios)
if (activeFilterSet.has('Entidades') && entitiesData?.entities_list) { entitiesData.entities_list.forEach((entity, idx) => { if (entity.start_char < entity.end_char) { allHighlights.push({ start: entity.start_char, end: entity.end_char, type: 'Entidades', id: `ent-${idx}`, className: highlightStylesNew['Entidades'], data: entity.type }); } }); }
if (activeFilterSet.has('Adjetivos') && adjectivesData?.adjectives_list) { adjectivesData.adjectives_list.forEach((adj, idx) => { if (adj.start_char < adj.end_char) { allHighlights.push({ start: adj.start_char, end: adj.end_char, type: 'Adjetivos', id: `adj-${idx}`, className: highlightStylesNew['Adjetivos'] }); } }); }
if (activeFilterSet.has('Sentimientos') && sentimentData?.highest_scoring_sentence_per_label) { const processSentence = (sentenceInfo: HighestScoringSentence | undefined, type: 'POS' | 'NEU' | 'NEG') => { if (!sentenceInfo || typeof sentenceInfo.start_char !== 'number' || typeof sentenceInfo.end_char !== 'number' || sentenceInfo.start_char >= sentenceInfo.end_char) return; const combinedClassName = `${highlightStylesNew['Sentimientos']} ${highlightStylesNew[type]}`; allHighlights.push({ start: sentenceInfo.start_char, end: sentenceInfo.end_char, type: 'Sentimientos', id: `sen-${type}`, className: combinedClassName, data: type }); }; processSentence(sentimentData.highest_scoring_sentence_per_label.POS, 'POS'); processSentence(sentimentData.highest_scoring_sentence_per_label.NEU, 'NEU'); processSentence(sentimentData.highest_scoring_sentence_per_label.NEG, 'NEG'); }
if (activeFilterSet.has('Fuentes') && sourcesData) { sourcesData.forEach((source, idx) => { if (source.start_char < source.end_char) { allHighlights.push({ start: source.start_char, end: source.end_char, type: 'Fuentes', id: `src-${idx}`, className: highlightStylesNew['Fuentes'], data: source.components?.referenciado?.text ?? 'Fuente citada' }); } }); }


if (allHighlights.length === 0) {
    return content.split('\n').filter(p => p.trim() !== '').map((p, index) => <p key={`p-${index}`}>{p}</p>);
}

// Ordenar todos los highlights por inicio, y luego los más largos primero
// Esto ayuda a procesar los "contenedores" (como Fuentes o Sentimientos largos) antes que los pequeños dentro de ellos.
allHighlights.sort((a, b) => {
    if (a.start !== b.start) return a.start - b.start;
    return b.end - a.end;
});

// Filtrar solo los highlights que están activos
const activeHighlights = allHighlights.filter(h => activeFilterSet.has(h.type));

// Obtener solo los highlights de tipo inline (Entidades, Adjetivos, y ahora Sentimientos)
// para pasarlos a la función de procesamiento de texto.
const allInlineHighlights = activeHighlights.filter(h => h.type !== 'Fuentes');

const segments: (string | JSX.Element)[] = [];
let lastIndex = 0;

// Primero procesar los bloques de Fuentes, si están activos
const sourceHighlights = activeFilterSet.has('Fuentes') ? activeHighlights.filter(h => h.type === 'Fuentes') : [];

for (const highlight of sourceHighlights) {
    if (highlight.start < lastIndex && highlight.end <= lastIndex) continue;
    const actualStart = Math.max(highlight.start, lastIndex);

    // Texto antes del bloque de Fuente
    if (actualStart > lastIndex) {
        segments.push(...applyInlineHighlightsToText(content.substring(lastIndex, actualStart), allInlineHighlights, lastIndex));
    }

    const sourceText = content.substring(actualStart, highlight.end);
    if (sourceText.length > 0) {
        segments.push(
            <mark key={highlight.id} className={highlight.className} title={typeof highlight.data === 'string' ? highlight.data : highlight.type}>
                {applyInlineHighlightsToText(sourceText, allInlineHighlights, actualStart)}
            </mark>
        );
    }
    lastIndex = Math.max(lastIndex, highlight.end);
}

// Texto restante después del último bloque de Fuente (o todo el texto si no hay Fuentes activas)
if (lastIndex < content.length) {
    segments.push(...applyInlineHighlightsToText(content.substring(lastIndex), allInlineHighlights, lastIndex));
}

// --- Reconstrucción de Párrafos ---
const finalOutput: JSX.Element[] = [];
let currentParagraphContent: (string | JSX.Element)[] = [];
const processSegment = (segment: string | JSX.Element | (string | JSX.Element)[]) => {
    if (Array.isArray(segment)) { segment.forEach(processSegment); }
    else if (typeof segment === 'string') {
        const parts = segment.split('\n');
        parts.forEach((part, partIndex) => {
            if (part.length > 0) currentParagraphContent.push(part);
            if (partIndex < parts.length - 1) {
                if (currentParagraphContent.length > 0) finalOutput.push(<p key={`p-${finalOutput.length}`}>{currentParagraphContent.map((s, si) => <React.Fragment key={`seg-par-${finalOutput.length}-${si}`}>{s}</React.Fragment>)}</p>);
                currentParagraphContent = [];
            }
        });
    } else { currentParagraphContent.push(segment); }
};
segments.forEach(processSegment);
if (currentParagraphContent.length > 0) {
    finalOutput.push(<p key={`p-${finalOutput.length}`}>{currentParagraphContent.map((s, si) => <React.Fragment key={`seg-last-${finalOutput.length}-${si}`}>{s}</React.Fragment>)}</p>);
}
return finalOutput.length > 0 ? finalOutput : [<p key="empty-content">{content || ""}</p>];

};
const ArticleContent: React.FC<ArticleContentProps> = ({
title, content, author, date, activeFilters, entities, adjectives, sentiment, sources
}) => {
const processedContent = useMemo(() => renderHighlightedContent(
content, activeFilters, entities, adjectives, sentiment, sources
), [content, activeFilters, entities, adjectives, sentiment, sources]);
return (
    <div className="bg-white p-4 md:p-6 rounded-lg shadow-md border border-gray-200">
        <h1 className="text-xl md:text-2xl font-bold mb-2 text-gray-900">{title}</h1>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500 mb-6">
            <span>Por: <span className="font-medium text-gray-700">{author || 'Autor Desconocido'}</span></span>
            <span>Fecha: <span className="font-medium text-gray-700">{date || 'Fecha no disponible'}</span></span>
        </div>
        <div className="prose prose-sm sm:prose-base max-w-none text-gray-800 leading-relaxed whitespace-pre-line">
            {processedContent}
        </div>
    </div>
);
};
export default ArticleContent;