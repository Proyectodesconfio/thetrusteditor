// src/components/ArticleHeader.tsx
// import React from 'react'; // REMOVED - No se usa explícitamente
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTag, faFont, faSmile, faQuoteLeft } from '@fortawesome/free-solid-svg-icons';
import type { Article } from '../types';

/**
 * Define los tipos válidos para las claves de los botones de filtro,
 * usados para controlar el resaltado de elementos en el contenido del artículo.
 */
export type FilterType = 'Entidades' | 'Adjetivos' | 'Sentimientos' | 'Fuentes';

/**
 * Define la configuración de estilo para cada botón de filtro.
 */
interface FilterStyleConfig {
    key: FilterType;
    label: string;          // Etiqueta textual del botón
    icon: any;              // Icono de FontAwesome
    color: string;          // Color del texto (ej: 'text-cyan-700')
    bgColorLight: string;   // Color de fondo claro para estado inactivo (ej: 'bg-cyan-100')
    bgColorSolid: string;   // Color de fondo sólido para estado activo (ej: 'bg-cyan-500')
    borderColorHover: string; // Color del borde al pasar el mouse sobre un botón inactivo (ej: 'hover:border-cyan-500')
    ringColorFocus: string; // Color del anillo de enfoque para accesibilidad (ej: 'focus:ring-cyan-300')
}

// Array de configuración para cada botón de filtro.
const filterOptions: FilterStyleConfig[] = [
    { key: 'Entidades',    label: 'Entidades',    icon: faTag,       color: 'text-cyan-700',   bgColorLight: 'bg-cyan-100',   bgColorSolid: 'bg-cyan-500',   borderColorHover: 'hover:border-cyan-500',   ringColorFocus: 'focus:ring-cyan-300' },
    { key: 'Adjetivos',    label: 'Adjetivos',    icon: faFont,      color: 'text-purple-700', bgColorLight: 'bg-purple-100', bgColorSolid: 'bg-purple-500', borderColorHover: 'hover:border-purple-500', ringColorFocus: 'focus:ring-purple-300' },
    { key: 'Sentimientos', label: 'Sentimientos', icon: faSmile,     color: 'text-pink-700',   bgColorLight: 'bg-pink-100',   bgColorSolid: 'bg-pink-500',   borderColorHover: 'hover:border-pink-500',   ringColorFocus: 'focus:ring-pink-300' },
    { key: 'Fuentes',      label: 'Fuentes',      icon: faQuoteLeft, color: 'text-amber-800',  bgColorLight: 'bg-amber-100',  bgColorSolid: 'bg-amber-600',  borderColorHover: 'hover:border-amber-600',  ringColorFocus: 'focus:ring-amber-400'  },
];

/**
 * Props para el componente ArticleHeader.
 */
interface ArticleHeaderProps {
  /** El objeto completo del artículo con sus metadatos. */
  article: Article;
  /** Array de strings que indica qué filtros de resaltado están activos. */
  activeFilters: string[]; // Debería ser FilterType[] para mayor seguridad
  /** Función callback que se invoca al cambiar los filtros activos. */
  onFilterChange: (newFilters: string[]) => void; // Debería ser (newFilters: FilterType[]) => void
}

/**
 * Componente que renderiza la cabecera de la vista de detalle de un artículo.
 * Muestra metadatos como autor y estado, y botones interactivos para alternar
 * el resaltado de diferentes elementos analizados en el contenido del artículo.
 */
export default function ArticleHeader({ article, activeFilters, onFilterChange }: ArticleHeaderProps) {

    /** Alterna el estado activo de una clave de filtro específica. */
    const toggleFilter = (filterKey: FilterType) => {
        // Comprueba si el filtro ya está activo
        const currentIndex = activeFilters.indexOf(filterKey);
        let newActiveFilters = [...activeFilters];

        if (currentIndex === -1) {
            newActiveFilters.push(filterKey); // Añadir si no está activo
        } else {
            newActiveFilters.splice(currentIndex, 1); // Quitar si ya está activo
        }
        onFilterChange(newActiveFilters);
    };

    /** Determina el texto y la clase de color para el estado del artículo. */
    const getStatusDisplay = (status: string | undefined): { text: string; className: string } => {
        const normalized = status?.trim().toLowerCase() ?? 'sin revisión'; // Normalizar y valor por defecto
         switch (normalized) {
            case 'aprobado': case 'reviewed': return { text: 'Aprobado', className: 'text-green-600 font-semibold' }; // Añadido font-semibold
            case 'pendiente': case 'pending': return { text: 'Pendiente', className: 'text-amber-600 font-semibold' };
            case 'revisar': case 'flagged': return { text: 'Revisar', className: 'text-red-600 font-semibold' };
            default: return { text: 'Sin revisión', className: 'text-gray-500' }; // Quitado font-semibold para diferenciar
        }
    };
    const statusDisplay = getStatusDisplay(article.status);

    return (
        <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm border mb-6"> {/* Añadido border para consistencia */}
            {/* Sección de Metadatos del Artículo */}
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-y-2 gap-x-4 mb-4 md:mb-6">
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600">
                    <span>Autor: <span className="font-medium text-gray-800">{article.autor || 'Desconocido'}</span></span>
                    <span>Estado: <span className={`${statusDisplay.className}`}>{statusDisplay.text}</span></span>
                </div>
            </div>

            {/* Sección de Botones de Filtro para Resaltado */}
            <div className="flex items-center flex-wrap gap-3">
                 {/* Etiqueta oculta para accesibilidad del grupo de botones */}
                 <span id="highlight-label" className="sr-only">Resaltar elementos en el texto:</span>
                {filterOptions.map(({ key, label, icon, color, bgColorLight, bgColorSolid, borderColorHover, ringColorFocus }) => {
                    const isActive = activeFilters.includes(key);
                    return (
                        <button
                            key={key}
                            onClick={() => toggleFilter(key)}
                            className={`
                                flex items-center gap-2 px-3.5 py-1.5 rounded-full text-sm font-medium border-2 
                                transition-all duration-150 ease-in-out 
                                focus:outline-none focus-visible:ring-2 ${ringColorFocus} focus-visible:ring-offset-1
                                ${isActive
                                    ? `${bgColorSolid} text-white border-transparent shadow-sm hover:opacity-90` // Ligero efecto hover en activo
                                    : `${bgColorLight} ${color} border-transparent ${borderColorHover} hover:shadow-sm hover:${bgColorLight.replace('100', '200')}` // Hover más notorio en inactivo
                                }
                            `}
                            title={`${isActive ? 'Quitar resaltado de' : 'Resaltar'} ${label.toLowerCase()}`}
                            aria-pressed={isActive}
                            aria-labelledby={`filter-button-${key.toLowerCase()} highlight-label`} // Combinar etiquetas
                        >
                            <FontAwesomeIcon icon={icon} className="w-3.5 h-3.5" /> {/* Icono */}
                            <span id={`filter-button-${key.toLowerCase()}`}>{label}</span> {/* Etiqueta */}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}