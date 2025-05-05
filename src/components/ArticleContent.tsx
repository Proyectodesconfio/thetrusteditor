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

// --- Colores y Estilos de Resaltado ---
// Estilos base INLINE para Entidades y Adjetivos
const entityAdjStyles: Record<'Entidades' | 'Adjetivos', string> = {
    'Entidades': 'bg-cyan-100 text-cyan-800 px-1 py-0.5 rounded mx-px', // Inline
    'Adjetivos': 'bg-purple-100 text-purple-800 px-1 py-0.5 rounded mx-px', // Inline
};

// Estilos para Sentimientos (inline, sutil)
const sentimentStyles: Record<'POS' | 'NEU' | 'NEG', string> = {
    'POS': 'bg-green-50 text-green-800 px-1 py-0.5 rounded mx-px', // Fondo muy claro, texto oscuro
    'NEU': 'bg-gray-100 text-gray-800 px-1 py-0.5 rounded mx-px', // Fondo muy claro, texto oscuro
    'NEG': 'bg-red-50 text-red-800 px-1 py-0.5 rounded mx-px',   // Fondo muy claro, texto oscuro
};
// Nota: Puedes experimentar con 'underline decoration-wavy decoration-red-500' etc. si prefieres subrayados

// Estilos para Fuentes (manteniendo bloque para citas, pero mejorado)
const sourceStyle = 'block my-2 p-2 border-l-4 border-amber-300 bg-amber-50 text-amber-900 text-sm rounded-r-md shadow-sm';


// --- Función de Resaltado (Lógica simplificada para claridad) ---
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

    // 1. Recopilar todos los highlights posibles
    if (activeFilterSet.has('Entidades') && entitiesData?.entities_list) {
        entitiesData.entities_list.forEach((entity, idx) => highlights.push({
            start: entity.start_char, end: entity.end_char, type: 'Entidades', id: `ent-${idx}`,
            className: entityAdjStyles['Entidades'], data: entity.type
        }));
    }
    if (activeFilterSet.has('Adjetivos') && adjectivesData?.adjectives_list) {
        adjectivesData.adjectives_list.forEach((adj, idx) => highlights.push({
            start: adj.start_char, end: adj.end_char, type: 'Adjetivos', id: `adj-${idx}`,
            className: entityAdjStyles['Adjetivos']
        }));
    }
    if (activeFilterSet.has('Sentimientos') && sentimentData?.highest_scoring_sentence_per_label) {
        // --- APLICAR ESTILOS INLINE PARA SENTIMIENTOS ---
        const processSentence = (sentenceInfo: HighestScoringSentence | undefined, type: 'POS' | 'NEU' | 'NEG') => {
            if (!sentenceInfo || sentenceInfo.start_char >= sentenceInfo.end_char) return;
            highlights.push({
                start: sentenceInfo.start_char, end: sentenceInfo.end_char, type: 'Sentimientos', id: `sen-${type}`,
                className: sentimentStyles[type], // Usa los estilos inline definidos arriba
                data: type
            });
        };
        processSentence(sentimentData.highest_scoring_sentence_per_label.POS, 'POS');
        processSentence(sentimentData.highest_scoring_sentence_per_label.NEU, 'NEU');
        processSentence(sentimentData.highest_scoring_sentence_per_label.NEG, 'NEG');
    }
    if (activeFilterSet.has('Fuentes') && sourcesData) {
        sourcesData.forEach((source, idx) => {
             // Asegurar que las fuentes también tengan rangos válidos
            if (source.start_char < source.end_char) {
                highlights.push({
                    start: source.start_char, end: source.end_char, type: 'Fuentes', id: `src-${idx}`,
                    className: sourceStyle, // Estilo de bloque para citas
                    data: source.components?.referenciado?.text ?? 'Fuente citada'
                });
            }
        });
    }

    // Si no hay highlights que aplicar, devolver párrafos simples
    if (highlights.length === 0) {
        // Divide por saltos de línea y filtra párrafos vacíos
        return content.split('\n').filter(p => p.trim() !== '').map((p, index) => <p key={`p-${index}`}>{p}</p>);
    }

    // Ordenar highlights por inicio, luego por fin (más largos primero si empiezan igual)
    highlights.sort((a, b) => {
        if (a.start !== b.start) return a.start - b.start;
        return b.end - a.end; // Más largos primero para anidamiento visual correcto
    });

    // --- Lógica de Renderizado Anidado ---
    // Esta función recursiva maneja el anidamiento de <mark>s
    const buildNestedJsx = (text: string, rangeStart: number, rangeEnd: number, availableHighlights: HighlightRange[]): (string | JSX.Element)[] => {
        const output: (string | JSX.Element)[] = [];
        let cursor = rangeStart;

        // Encuentra highlights que *inician* dentro del rango actual [rangeStart, rangeEnd)
        const applicableHighlights = availableHighlights.filter(h => h.start >= rangeStart && h.start < rangeEnd);

        applicableHighlights.forEach((highlight, i) => {
            // Añadir texto normal antes del highlight actual
            if (highlight.start > cursor) {
                output.push(text.substring(cursor, highlight.start));
            }

            // Determinar el fin real de este highlight (no puede exceder rangeEnd)
            const actualEnd = Math.min(highlight.end, rangeEnd);

            // Filtrar los highlights que pueden estar *dentro* del actual
            const innerHighlights = availableHighlights.filter(h => h.id !== highlight.id && h.start >= highlight.start && h.end <= actualEnd);

            // Renderizar el highlight actual, procesando su contenido recursivamente
            output.push(
                <mark key={highlight.id} className={highlight.className} title={typeof highlight.data === 'string' ? highlight.data : highlight.type}>
                    {buildNestedJsx(text, highlight.start, actualEnd, innerHighlights)}
                </mark>
            );

            // Mover cursor al final de este highlight
            cursor = actualEnd;
        });

        // Añadir texto restante después del último highlight dentro de este rango
        if (cursor < rangeEnd) {
            output.push(text.substring(cursor, rangeEnd));
        }

        return output;
    };

    // Procesar todo el contenido inicial
    const processedJsx = buildNestedJsx(content, 0, content.length, highlights);

    // --- Dividir en Párrafos ---
    // Similar a antes, pero manejando arrays anidados de JSX/string
    const finalOutput: JSX.Element[] = [];
    let currentParagraphContent: (string | JSX.Element)[] = [];

    const processSegment = (segment: string | JSX.Element | (string | JSX.Element)[]) => {
        if (Array.isArray(segment)) {
            segment.forEach(processSegment); // Procesar elementos del array recursivamente
        } else if (typeof segment === 'string') {
            const parts = segment.split('\n');
            parts.forEach((part, partIndex) => {
                if (part.length > 0) {
                    currentParagraphContent.push(part);
                }
                // Si encontramos un salto de línea original y no es el último trozo
                if (partIndex < parts.length - 1) {
                    if (currentParagraphContent.length > 0) {
                        finalOutput.push(<p key={`p-${finalOutput.length}`}>{currentParagraphContent}</p>);
                    }
                    currentParagraphContent = []; // Empezar nuevo párrafo
                }
            });
        } else { // Es un elemento JSX (<mark>)
            currentParagraphContent.push(segment);
        }
    };

    processSegment(processedJsx); // Procesar el resultado anidado

    // Añadir el último párrafo si tiene contenido
    if (currentParagraphContent.length > 0) {
        finalOutput.push(<p key={`p-${finalOutput.length}`}>{currentParagraphContent}</p>);
    }

    // Devolver los párrafos o un párrafo vacío si no hay nada
    return finalOutput.length > 0 ? finalOutput : [<p key="empty-content"></p>];
};


// --- Componente Principal ---
const ArticleContent: React.FC<ArticleContentProps> = ({
    title, content, author, date, activeFilters, entities, adjectives, sentiment, sources
}) => {
    // Usar useMemo para evitar recalcular en cada render si las props no cambian
    const processedContent = useMemo(() => renderHighlightedContent(
        content, activeFilters, entities, adjectives, sentiment, sources
    ), [content, activeFilters, entities, adjectives, sentiment, sources]); // Dependencias correctas

    return (
        // Contenedor principal del artículo
        <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm border"> {/* Añadido borde sutil */}
            {/* Título */}
            <h1 className="text-xl md:text-2xl font-bold mb-2 text-gray-900">{title}</h1>
            {/* Metadata */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500 mb-6">
                <span>Por: <span className="font-medium text-gray-700">{author || 'Desconocido'}</span></span>
                <span>Fecha: <span className="font-medium text-gray-700">{date || 'N/A'}</span></span>
            </div>
            {/* Contenido Procesado */}
            {/* prose-sm sm:prose-base aplica estilos de tipografía base */}
            {/* max-w-none evita que prose limite el ancho */}
            {/* whitespace-pre-wrap preserva saltos de línea y espacios */}
            <div className="prose prose-sm sm:prose-base max-w-none whitespace-pre-wrap text-gray-800 leading-relaxed"> {/* Mejorado line-height */}
                {processedContent}
            </div>
        </div>
    );
};

export default ArticleContent;