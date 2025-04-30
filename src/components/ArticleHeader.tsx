// src/components/ArticleHeader.tsx
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// Importar iconos necesarios
import { faTag, faFont, faSmile, faQuoteLeft } from '@fortawesome/free-solid-svg-icons';
// Importar tipo Article desde la ubicación central
import type { Article } from '../types'; // Asegúrate que la ruta '../types' sea correcta

/**
 * Defines the valid keys/types for the filter buttons used for highlighting.
 * Ensures consistency between the header buttons and the content processing logic.
 */
export type FilterType = 'Entidades' | 'Adjetivos' | 'Sentimientos' | 'Fuentes';

/**
 * Configuration data for rendering each filter button.
 * Maps filter types to labels, icons, and styling classes.
 */
const filterOptions: { key: FilterType; label: string; icon: any; color: string; bgColor: string }[] = [
    // Las claves 'key' deben coincidir exactamente con los valores usados en activeFilters y en ArticleContent
    { key: 'Entidades',    label: 'Entidades',    icon: faTag,       color: 'text-cyan-600',   bgColor: 'bg-cyan-100'   },
    { key: 'Adjetivos',    label: 'Adjetivos',    icon: faFont,      color: 'text-purple-600', bgColor: 'bg-purple-100' },
    { key: 'Sentimientos', label: 'Sentimientos', icon: faSmile,     color: 'text-pink-600',   bgColor: 'bg-pink-100'   },
    { key: 'Fuentes',      label: 'Fuentes',      icon: faQuoteLeft, color: 'text-amber-700',  bgColor: 'bg-amber-100'  },
];

/**
 * Props required by the ArticleHeader component.
 */
interface ArticleHeaderProps {
  /** The full article object containing metadata to display. */
  article: Article;
  /** An array of currently active filter keys (strings matching FilterType). */
  activeFilters: string[];
  /** Callback function triggered when a filter button is clicked, passing the new array of active filters. */
  onFilterChange: (newFilters: string[]) => void;
}

/**
 * Renders the header section for the article detail view.
 * Displays key article metadata (author, status) and provides interactive buttons
 * to toggle highlighting of different analysed elements in the article content.
 */
export default function ArticleHeader({ article, activeFilters, onFilterChange }: ArticleHeaderProps) {

    /** Toggles the active state of a specific filter key. */
    const toggleFilter = (filterKey: FilterType) => {
        const newFilters = activeFilters.includes(filterKey)
            ? activeFilters.filter(f => f !== filterKey) // Remove if already active
            : [...activeFilters, filterKey];             // Add if not active
        onFilterChange(newFilters);
    };

    /** Determines the display text and CSS color class for the article's status. */
    const getStatusDisplay = (status: string | undefined): { text: string; className: string } => {
        const normalized = status?.toLowerCase() ?? 'sin revisión'; // Default if status is undefined/null
         switch (normalized) {
            // Map known status values to display text and color
            case 'aprobado': case 'reviewed': return { text: 'Aprobado', className: 'text-green-600' };
            case 'pendiente': case 'pending': return { text: 'Pendiente', className: 'text-amber-600' };
            case 'revisar': case 'flagged': return { text: 'Revisar', className: 'text-red-600' };
            // Fallback for unknown or default status
            default: return { text: 'Sin revisión', className: 'text-gray-500' };
        }
    };
    // Calculate status display properties based on the article's status
    const statusDisplay = getStatusDisplay(article.status);

    return (
        // Container for the header card
        <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm mb-6">
            {/* Top row for metadata */}
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-y-2 gap-x-4 mb-4 md:mb-6">
                {/* Display Author and Status */}
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600">
                    <span>Autor: <span className="font-medium text-gray-800">{article.autor || 'Desconocido'}</span></span>
                    <span>Estado: <span className={`font-medium ${statusDisplay.className}`}>{statusDisplay.text}</span></span>
                </div>
                 {/* The "Resaltar:" label is now visually hidden below for accessibility */}
            </div>

            {/* Bottom row for filter buttons */}
            <div className="flex items-center flex-wrap gap-2">
                 {/* Visually hidden label for the button group - Accessibility */}
                 <span id="highlight-label" className="sr-only">Resaltar elementos:</span>
                {/* Map through filter configurations to render buttons */}
                {filterOptions.map(({ key, label, icon, color, bgColor }) => {
                    // Check if the current filter button is active
                    const isActive = activeFilters.includes(key);
                    return (
                        <button
                            key={key}
                            onClick={() => toggleFilter(key)}
                            // Apply dynamic classes based on active state
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-150 ease-in-out border focus:outline-none focus:ring-2 focus:ring-offset-1 ${
                                isActive // Active state styles: brighter background, colored border, ring
                                    ? `${bgColor.replace('100', '200')} ${color} border-current shadow-sm ring-${color.split('-')[1]}-300`
                                    : `${bgColor} ${color} border-transparent hover:border-current hover:shadow-sm ring-gray-300` // Inactive/hover styles
                                }
                            `}
                            title={`Resaltar ${label}`} // Tooltip for button action
                            aria-pressed={isActive} // Indicate toggle state for accessibility
                            aria-labelledby={`highlight-label filter-button-${key.toLowerCase()}`} // Associate with hidden label
                        >
                            {/* Icon for the filter type */}
                            <FontAwesomeIcon icon={icon} className="w-3.5 h-3.5" />
                            {/* Text label for the button */}
                            <span id={`filter-button-${key.toLowerCase()}`}>{label}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}