// src/components/ArticleContent.tsx
import React, { useMemo } from 'react';
// Ahora HighestScoringSentence debería ser importable correctamente
import type { Article, ArticleSentiment, SourceCitation, HighestScoringSentence } from '../types';
import { FilterType } from './ArticleHeader';

interface HighlightRange {
    start: number;
    end: number;
    type: FilterType;
    className: string;
    data?: any; // Datos adicionales asociados al resaltado (ej: tipo de entidad, sentimiento)
    id: string;  // ID único para la key de React al renderizar
}

interface ArticleContentProps {
    title: string;
    content: string;
    // MODIFICADO: Permitir que author y date sean opcionales o undefined
    author?: string; // Puede ser string o undefined
    date?: string;   // Puede ser string o undefined
    activeFilters: string[];
    entities?: Article['entities'];
    adjectives?: Article['adjectives'];
    sentiment?: ArticleSentiment | null;
    sources?: SourceCitation[] | null;
}

// --- Constantes de Estilos ---
const entityAdjStyles: Record<'Entidades' | 'Adjetivos', string> = {
    'Entidades': 'bg-cyan-100 text-cyan-800 px-1 py-0.5 rounded mx-px',
    'Adjetivos': 'bg-purple-100 text-purple-800 px-1 py-0.5 rounded mx-px',
};

const sentimentStyles: Record<'POS' | 'NEU' | 'NEG', string> = {
    'POS': 'bg-green-50 text-green-800 px-1 py-0.5 rounded mx-px',
    'NEU': 'bg-gray-100 text-gray-800 px-1 py-0.5 rounded mx-px',
    'NEG': 'bg-red-50 text-red-800 px-1 py-0.5 rounded mx-px',
};

const sourceStyle = 'block my-2 p-2 border-l-4 border-amber-300 bg-amber-50 text-amber-900 text-sm rounded-r-md shadow-sm';

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

    // 1. Recopilar todos los highlights
    if (activeFilterSet.has('Entidades') && entitiesData?.entities_list) {
        entitiesData.entities_list.forEach((entity, idx) => {
            if (entity.start_char < entity.end_char) { // Asegurar rango válido
                highlights.push({
                    start: entity.start_char, end: entity.end_char, type: 'Entidades', id: `ent-${idx}`,
                    className: entityAdjStyles['Entidades'], data: entity.type
                });
            }
        });
    }
    if (activeFilterSet.has('Adjetivos') && adjectivesData?.adjectives_list) {
        adjectivesData.adjectives_list.forEach((adj, idx) => {
            if (adj.start_char < adj.end_char) { // Asegurar rango válido
                highlights.push({
                    start: adj.start_char, end: adj.end_char, type: 'Adjetivos', id: `adj-${idx}`,
                    className: entityAdjStyles['Adjetivos']
                });
            }
        });
    }
    if (activeFilterSet.has('Sentimientos') && sentimentData?.highest_scoring_sentence_per_label) {
        const processSentence = (sentenceInfo: HighestScoringSentence | undefined, type: 'POS' | 'NEU' | 'NEG') => {
            // Asegurar que sentenceInfo existe y el rango es válido
            if (!sentenceInfo || typeof sentenceInfo.start_char !== 'number' || typeof sentenceInfo.end_char !== 'number' || sentenceInfo.start_char >= sentenceInfo.end_char) return;
            highlights.push({
                start: sentenceInfo.start_char, end: sentenceInfo.end_char, type: 'Sentimientos', id: `sen-${type}`,
                className: sentimentStyles[type], data: type
            });
        };
        processSentence(sentimentData.highest_scoring_sentence_per_label.POS, 'POS');
        processSentence(sentimentData.highest_scoring_sentence_per_label.NEU, 'NEU');
        processSentence(sentimentData.highest_scoring_sentence_per_label.NEG, 'NEG');
    }
    if (activeFilterSet.has('Fuentes') && sourcesData) {
        sourcesData.forEach((source, idx) => {
            if (source.start_char < source.end_char) { // Asegurar rango válido
                highlights.push({
                    start: source.start_char, end: source.end_char, type: 'Fuentes', id: `src-${idx}`,
                    className: sourceStyle, data: source.components?.referenciado?.text ?? 'Fuente citada'
                });
            }
        });
    }

    if (highlights.length === 0) {
        return content.split('\n').filter(p => p.trim() !== '').map((p, index) => <p key={`p-${index}`}>{p}</p>);
    }

    highlights.sort((a, b) => {
        if (a.start !== b.start) return a.start - b.start;
        return b.end - a.end;
    });

    // --- Lógica de Renderizado Anidado ---
    const buildNestedJsx = (text: string, rangeStart: number, rangeEnd: number, availableHighlights: HighlightRange[]): (string | JSX.Element)[] => {
        const output: (string | JSX.Element)[] = [];
        let cursor = rangeStart;

        const applicableHighlights = availableHighlights.filter(h => h.start >= rangeStart && h.start < rangeEnd);

        // CORREGIDO: Eliminado parámetro 'i' no usado
        applicableHighlights.forEach((highlight) => {
            if (highlight.start > cursor) {
                output.push(text.substring(cursor, highlight.start));
            }
            const actualEnd = Math.min(highlight.end, rangeEnd);
            const innerHighlights = availableHighlights.filter(h => h.id !== highlight.id && h.start >= highlight.start && h.end <= actualEnd);
            output.push(
                <mark key={highlight.id} className={highlight.className} title={typeof highlight.data === 'string' ? highlight.data : highlight.type}>
                    {buildNestedJsx(text, highlight.start, actualEnd, innerHighlights)}
                </mark>
            );
            cursor = actualEnd;
        });

        if (cursor < rangeEnd) {
            output.push(text.substring(cursor, rangeEnd));
        }
        return output;
    };

    const processedJsx = buildNestedJsx(content, 0, content.length, highlights);

    // --- Dividir en Párrafos ---
    const finalOutput: JSX.Element[] = [];
    let currentParagraphContent: (string | JSX.Element)[] = [];

    const processSegment = (segment: string | JSX.Element | (string | JSX.Element)[]) => {
        if (Array.isArray(segment)) {
            segment.forEach(processSegment);
        } else if (typeof segment === 'string') {
            const parts = segment.split('\n');
            parts.forEach((part, partIndex) => {
                if (part.length > 0) {
                    currentParagraphContent.push(part);
                }
                if (partIndex < parts.length - 1) {
                    if (currentParagraphContent.length > 0) {
                        finalOutput.push(<p key={`p-${finalOutput.length}`}>{currentParagraphContent}</p>);
                    }
                    currentParagraphContent = [];
                }
            });
        } else {
            currentParagraphContent.push(segment);
        }
    };

    processSegment(processedJsx);

    if (currentParagraphContent.length > 0) {
        finalOutput.push(<p key={`p-${finalOutput.length}`}>{currentParagraphContent}</p>);
    }
    return finalOutput.length > 0 ? finalOutput : [<p key="empty-content">{content || ""}</p>]; // Mostrar contenido original si no hay párrafos procesados
};

// --- Componente Principal ---
const ArticleContent: React.FC<ArticleContentProps> = ({
    title, content, author, date, activeFilters, entities, adjectives, sentiment, sources
}) => {
    const processedContent = useMemo(() => renderHighlightedContent(
        content, activeFilters, entities, adjectives, sentiment, sources
    ), [content, activeFilters, entities, adjectives, sentiment, sources]);

    return (
        <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm border">
            <h1 className="text-xl md:text-2xl font-bold mb-2 text-gray-900">{title}</h1>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500 mb-6">
                {/* MODIFICADO: Usar valores por defecto para author y date */}
                <span>Por: <span className="font-medium text-gray-700">{author || 'Autor Desconocido'}</span></span>
                <span>Fecha: <span className="font-medium text-gray-700">{date || 'Fecha no disponible'}</span></span>
            </div>
            <div className="prose prose-sm sm:prose-base max-w-none whitespace-pre-wrap text-gray-800 leading-relaxed">
                {processedContent}
            </div>
        </div>
    );
};

export default ArticleContent;