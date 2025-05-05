// src/components/ArticleHeader.tsx
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTag, faFont, faSmile, faQuoteLeft } from '@fortawesome/free-solid-svg-icons';
import type { Article } from '../types';

export type FilterType = 'Entidades' | 'Adjetivos' | 'Sentimientos' | 'Fuentes';

// --- CONFIGURACIÓN DE ESTILOS MEJORADA ---
interface FilterStyleConfig {
    key: FilterType;
    label: string;
    icon: any;
    // Colores base para texto y fondo claro (inactivo)
    color: string;          // e.g., 'text-cyan-600'
    bgColorLight: string;   // e.g., 'bg-cyan-100'
    // Color de fondo sólido (activo) y borde (hover)
    bgColorSolid: string;   // e.g., 'bg-cyan-500'
    borderColorHover: string; // e.g., 'hover:border-cyan-500'
    // Color del anillo de enfoque (opcional, pero bueno para accesibilidad)
    ringColorFocus: string; // e.g., 'focus:ring-cyan-300'
}

const filterOptions: FilterStyleConfig[] = [
    { key: 'Entidades',    label: 'Entidades',    icon: faTag,       color: 'text-cyan-700',   bgColorLight: 'bg-cyan-100',   bgColorSolid: 'bg-cyan-500',   borderColorHover: 'hover:border-cyan-500',   ringColorFocus: 'focus:ring-cyan-300' },
    { key: 'Adjetivos',    label: 'Adjetivos',    icon: faFont,      color: 'text-purple-700', bgColorLight: 'bg-purple-100', bgColorSolid: 'bg-purple-500', borderColorHover: 'hover:border-purple-500', ringColorFocus: 'focus:ring-purple-300' },
    { key: 'Sentimientos', label: 'Sentimientos', icon: faSmile,     color: 'text-pink-700',   bgColorLight: 'bg-pink-100',   bgColorSolid: 'bg-pink-500',   borderColorHover: 'hover:border-pink-500',   ringColorFocus: 'focus:ring-pink-300' },
    { key: 'Fuentes',      label: 'Fuentes',      icon: faQuoteLeft, color: 'text-amber-800',  bgColorLight: 'bg-amber-100',  bgColorSolid: 'bg-amber-600',  borderColorHover: 'hover:border-amber-600',  ringColorFocus: 'focus:ring-amber-400'  },
];
// --- FIN CONFIGURACIÓN DE ESTILOS ---

interface ArticleHeaderProps {
  article: Article;
  activeFilters: string[];
  onFilterChange: (newFilters: string[]) => void;
}

export default function ArticleHeader({ article, activeFilters, onFilterChange }: ArticleHeaderProps) {

    const toggleFilter = (filterKey: FilterType) => {
        const newFilters = activeFilters.includes(filterKey)
            ? activeFilters.filter(f => f !== filterKey)
            : [...activeFilters, filterKey];
        onFilterChange(newFilters);
    };

    const getStatusDisplay = (status: string | undefined): { text: string; className: string } => {
        const normalized = status?.toLowerCase() ?? 'sin revisión';
         switch (normalized) {
            case 'aprobado': case 'reviewed': return { text: 'Aprobado', className: 'text-green-600' };
            case 'pendiente': case 'pending': return { text: 'Pendiente', className: 'text-amber-600' };
            case 'revisar': case 'flagged': return { text: 'Revisar', className: 'text-red-600' };
            default: return { text: 'Sin revisión', className: 'text-gray-500' };
        }
    };
    const statusDisplay = getStatusDisplay(article.status);

    return (
        <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm mb-6">
            {/* Metadata (sin cambios) */}
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-y-2 gap-x-4 mb-4 md:mb-6">
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600">
                    <span>Autor: <span className="font-medium text-gray-800">{article.autor || 'Desconocido'}</span></span>
                    <span>Estado: <span className={`font-medium ${statusDisplay.className}`}>{statusDisplay.text}</span></span>
                </div>
            </div>

            {/* Botones de Filtro con Estilos Mejorados */}
            <div className="flex items-center flex-wrap gap-3"> {/* Aumentado gap */}
                 <span id="highlight-label" className="sr-only">Resaltar elementos:</span>
                {filterOptions.map(({ key, label, icon, color, bgColorLight, bgColorSolid, borderColorHover, ringColorFocus }) => {
                    const isActive = activeFilters.includes(key);
                    return (
                        <button
                            key={key}
                            onClick={() => toggleFilter(key)}
                            // --- CLASES DINÁMICAS MEJORADAS ---
                            className={`
                                flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border-2 transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 ${ringColorFocus} focus:ring-offset-1
                                ${isActive
                                    // Estilo Activo: Fondo sólido, texto blanco, borde transparente, sombra
                                    ? `${bgColorSolid} text-white border-transparent shadow-md`
                                    // Estilo Inactivo: Fondo claro, texto de color, borde transparente, borde de color al pasar el mouse
                                    : `${bgColorLight} ${color} border-transparent ${borderColorHover} hover:shadow-sm`
                                }
                            `}
                            title={`${isActive ? 'Dejar de resaltar' : 'Resaltar'} ${label}`}
                            aria-pressed={isActive}
                            aria-labelledby={`highlight-label filter-button-${key.toLowerCase()}`}
                        >
                            <FontAwesomeIcon icon={icon} className="w-4 h-4" /> {/* Icono ligeramente más grande */}
                            <span id={`filter-button-${key.toLowerCase()}`}>{label}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}