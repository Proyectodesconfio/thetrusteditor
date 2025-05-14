// src/components/ArticleHeader.tsx
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTag, faFont, faSmile, faQuoteLeft } from '@fortawesome/free-solid-svg-icons';
import type { Article } from '../types';
import Tippy from '@tippyjs/react'; // 

/**
 * Define los tipos válidos para las claves de los botones de filtro,
 * usados para controlar el resaltado de elementos en el contenido del artículo.
 */
export type FilterType = 'Entidades' | 'Adjetivos' | 'Sentimientos' | 'Fuentes';

/**
 * Define la configuración de estilo para cada botón de filtro, incluyendo la descripción para el tooltip.
 */
interface FilterStyleConfig {
    key: FilterType;
    label: string;
    icon: any; // Tipo del icono de FontAwesome
    color: string; // Clase de Tailwind para el color del texto (estado inactivo)
    bgColorLight: string; // Clase de Tailwind para el fondo claro (estado inactivo)
    bgColorSolid: string; // Clase de Tailwind para el fondo sólido (estado activo)
    borderColorHover: string; // Clase de Tailwind para el borde en hover (estado inactivo)
    ringColorFocus: string; // Clase de Tailwind para el anillo de foco
    tooltipDescription: string; // Texto descriptivo para el tooltip
}

// Array de configuración para cada botón de filtro.
const filterOptions: FilterStyleConfig[] = [
    { key: 'Entidades',    label: 'Entidades',    icon: faTag,       color: 'text-cyan-700',   bgColorLight: 'bg-cyan-100',   bgColorSolid: 'bg-cyan-500',   borderColorHover: 'hover:border-cyan-500',   ringColorFocus: 'focus:ring-cyan-300', tooltipDescription: 'Resaltar nombres de personas, lugares y organizaciones en el texto.' },
    { key: 'Adjetivos',    label: 'Adjetivos',    icon: faFont,      color: 'text-purple-700', bgColorLight: 'bg-purple-100', bgColorSolid: 'bg-purple-500', borderColorHover: 'hover:border-purple-500', ringColorFocus: 'focus:ring-purple-300', tooltipDescription: 'Destacar los adjetivos calificativos y descriptivos utilizados.' },
    { key: 'Sentimientos', label: 'Sentimientos', icon: faSmile,     color: 'text-pink-700',   bgColorLight: 'bg-pink-100',   bgColorSolid: 'bg-pink-500',   borderColorHover: 'hover:border-pink-500',   ringColorFocus: 'focus:ring-pink-300', tooltipDescription: 'Mostrar frases con una carga de sentimiento positiva, neutra o negativa.' },
    { key: 'Fuentes',      label: 'Fuentes',      icon: faQuoteLeft, color: 'text-amber-800',  bgColorLight: 'bg-amber-100',  bgColorSolid: 'bg-amber-600',  borderColorHover: 'hover:border-amber-600',  ringColorFocus: 'focus:ring-amber-400', tooltipDescription: 'Identificar citas directas y referencias a fuentes de información.'  },
];

/**
 * Props para el componente ArticleHeader.
 */
interface ArticleHeaderProps {
  /** El objeto completo del artículo con sus metadatos. */
  article: Article;
  /** Array de FilterType que indica qué filtros de resaltado están activos. */
  activeFilters: FilterType[]; // Más seguro usar FilterType[]
  /** Función callback que se invoca al cambiar los filtros activos. */
  onFilterChange: (newFilters: FilterType[]) => void; // Más seguro usar FilterType[]
}

/**
 * Componente que renderiza la cabecera de la vista de detalle de un artículo.
 * Muestra metadatos como autor y estado, y botones interactivos para alternar
 * el resaltado de diferentes elementos analizados en el contenido del artículo,
 * con tooltips personalizados al pasar el mouse sobre los botones.
 */
export default function ArticleHeader({ article, activeFilters, onFilterChange }: ArticleHeaderProps) {

    /** Alterna el estado activo de una clave de filtro específica. */
    const toggleFilter = (filterKey: FilterType) => {
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
            case 'aprobado': case 'reviewed': return { text: 'Revisado', className: 'text-green-600 font-semibold' };
            case 'pendiente': case 'pending': return { text: 'Pendiente', className: 'text-amber-600 font-semibold' };
            case 'revisar': case 'flagged': return { text: 'Revisar', className: 'text-red-600 font-semibold' };
            default: return { text: 'Sin revisión', className: 'text-gray-500' };
        }
    };
    const statusDisplay = getStatusDisplay(article.status);

    return (
        <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm border border-gray-200 mb-6"> {/* Borde sutil añadido */}
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
                {filterOptions.map(({ key, label, icon, color, bgColorLight, bgColorSolid, borderColorHover, ringColorFocus, tooltipDescription }) => {
                    const isActive = activeFilters.includes(key);

                    // Contenido JSX para el tooltip personalizado
                    const tooltipContent = (
                        <div className="p-2 text-xs bg-gray-800 text-white rounded-md shadow-lg max-w-xs">
                            <p className="font-semibold mb-0.5">{label}</p>
                            <p className="opacity-90">{tooltipDescription}</p>
                            <p className="mt-1.5 text-gray-300 text-[11px]"> {/* Estilo más sutil para el estado */}
                                Estado: {isActive ? <span className="font-medium text-green-400">Activado</span> : <span className="font-medium text-gray-400">Desactivado</span>}
                            </p>
                        </div>
                    );

                    return (
                        // Componente Tippy que envuelve cada botón para mostrar el tooltip
                        <Tippy
                            key={key} // La key única para la lista de React va aquí
                            content={tooltipContent}
                            placement="top"
                            animation="scale" // Asegúrate de importar 'tippy.js/animations/scale.css'
                            delay={[200, 50]} // [mostrar, ocultar] en ms
                            interactive={false} // El tooltip no es interactivo
                            arrow={true} // Muestra la flechita del tooltip
                            // theme="light" // Descomenta si importas 'tippy.js/themes/light.css' y lo prefieres
                        >
                            <button
                                onClick={() => toggleFilter(key)}
                                className={`
                                    flex items-center gap-2 px-3.5 py-1.5 rounded-full text-sm font-medium border-2
                                    transition-all duration-150 ease-in-out
                                    focus:outline-none focus-visible:ring-2 ${ringColorFocus} focus-visible:ring-offset-1
                                    ${isActive
                                        ? `${bgColorSolid} text-white border-transparent shadow-sm hover:opacity-90`
                                        : `${bgColorLight} ${color} border-transparent ${borderColorHover} hover:shadow-sm hover:${bgColorLight.replace('100', '200')}`
                                    }
                                `}
                                title={`${isActive ? 'Quitar resaltado de' : 'Resaltar'} ${label.toLowerCase()}`} // Fallback para title
                                aria-pressed={isActive}
                                aria-labelledby={`filter-button-${key.toLowerCase()} highlight-label`} // Para accesibilidad
                            >
                                <FontAwesomeIcon icon={icon} className="w-3.5 h-3.5" />
                                <span id={`filter-button-${key.toLowerCase()}`}>{label}</span>
                            </button>
                        </Tippy>
                    );
                })}
            </div>
        </div>
    );
}