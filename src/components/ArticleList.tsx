// src/components/ArticleList.tsx
import React from 'react'; // React es necesario para React.FC y JSX
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faChevronRight,
  faSmile, faMeh, faFrown, faQuestionCircle
} from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import type { Article, ArticleSentiment } from '../types'; // Asegurar que ArticleSentiment se importe

// --- Tipos para la UI de Estado y Sentimiento ---
// Etiquetas de estado que se mostrarán al usuario final.
type DisplayStatusLabel = 'Pendiente' | 'Aprobado' | 'Revisar' | 'Sin Revisión';
// Etiquetas de sentimiento que se mostrarán al usuario final.
type SentimentLabel = 'Positivo' | 'Neutro' | 'Negativo' | 'N/A';

// --- Configuración de ESTADO del Artículo ---
interface StatusDisplayConfig {
  label: DisplayStatusLabel;
  color: string;    // Clase de Tailwind para el color del texto
  bgColor: string;  // Clase de Tailwind para el color de fondo
}

/**
 * Mapea el valor del campo `status` de un artículo a una etiqueta de UI y clases de estilo.
 * Normaliza el estado de entrada para manejar diferentes variaciones.
 *
 * @param status - El valor del campo `status` del artículo (puede ser undefined o string).
 * @returns Un objeto con la etiqueta a mostrar y las clases de color/fondo.
 */
const getStatusConfig = (status: string | undefined): StatusDisplayConfig => {
  // Normalizar: quitar espacios, convertir a minúsculas, y usar 'sin revisión' como fallback.
  const normalizedStatus = status?.trim().toLowerCase() ?? 'sin revisión';

  // Mapear el estado normalizado a la configuración de visualización.
  // Es importante que los 'case' coincidan con los valores exactos esperados en los datos.
  switch (normalizedStatus) {
    case 'reviewed':
    case 'aprobado':
      return { label: 'Aprobado', color: 'text-green-700', bgColor: 'bg-green-100' }; // Color de texto más oscuro para contraste
    case 'pending':
    case 'pendiente':
      return { label: 'Pendiente', color: 'text-amber-700', bgColor: 'bg-amber-100' }; // Color de texto más oscuro
    case 'flagged':
    case 'revisar':
      return { label: 'Revisar', color: 'text-red-700', bgColor: 'bg-red-100' }; // Color de texto más oscuro
    case '':             // String vacío
    case 'unreviewed':
    case 'sin revisión': // Si se usa 'sin revisión' como valor en los datos
    default:             // Cualquier otro valor o undefined/null
      return { label: 'Sin Revisión', color: 'text-gray-600', bgColor: 'bg-gray-100' }; // Color de texto ajustado
  }
};

// --- Configuración de SENTIMIENTO del Artículo ---
interface SentimentDisplayConfigItem { // Renombrado para evitar colisión con el tipo interno de ArticleList
    label: SentimentLabel;
    color: string;          // Clase de Tailwind para el color del texto e icono
    icon: typeof faSmile;   // Definición del icono de FontAwesome
}

/**
 * Mapea la etiqueta del sentimiento global ('POS', 'NEU', 'NEG') a su configuración de visualización.
 *
 * @param globalSentiment - El array [etiqueta, confianza] del sentimiento global del artículo.
 * @returns Un objeto SentimentDisplayConfigItem.
 */
const getSentimentConfig = (globalSentiment: ArticleSentiment['global_sentiment'] | undefined): SentimentDisplayConfigItem => {
  const label = globalSentiment?.[0] ?? null; // Obtener la etiqueta ('POS', 'NEU', 'NEG') o null
  switch (label) {
    case 'POS': return { label: 'Positivo', color: 'text-green-600', icon: faSmile };
    case 'NEU': return { label: 'Neutro',   color: 'text-gray-500',  icon: faMeh };
    case 'NEG': return { label: 'Negativo', color: 'text-red-600',   icon: faFrown };
    default:    return { label: 'N/A',      color: 'text-gray-400',  icon: faQuestionCircle };
  }
};

// --- Componente ArticleList ---
interface ArticleListProps {
  articles: Article[]; // Array de objetos Article a renderizar
}

/**
 * Renderiza una lista de tarjetas de artículo.
 * Cada tarjeta incluye título, metadatos, un indicador de sentimiento y un badge de estado.
 * Cada tarjeta es un enlace a la vista detallada del artículo.
 */
const ArticleList: React.FC<ArticleListProps> = ({ articles }) => {
  // Si no hay artículos, se podría mostrar un mensaje aquí o manejarlo en el componente padre.
  if (articles.length === 0) {
    // El componente padre Home.tsx ya maneja los mensajes de "no hay artículos".
    // Si se quisiera un mensaje específico para ArticleList, se podría añadir aquí.
    // Ejemplo: return <p className="text-center text-gray-500 py-4">No hay artículos para mostrar.</p>;
    return null; // Opcionalmente, no renderizar nada si la lista está vacía.
  }

  return (
    <div className="space-y-4"> {/* Espaciado vertical entre tarjetas de artículo */}
      {articles.map((article) => {
        // Obtener configuraciones de visualización para estado y sentimiento
        const statusConfig = getStatusConfig(article.status);
        const sentimentConfig = getSentimentConfig(article.sentiment?.global_sentiment);
        // Usar "Sin sección" como fallback si article.seccion es undefined/null
        const displaySeccion = article.seccion ?? 'Sin sección';
        // Crear tooltip para el indicador de sentimiento
        const sentimentTooltip = article.sentiment?.global_sentiment && typeof article.sentiment.global_sentiment[1] === 'number'
          ? `${sentimentConfig.label} (Confianza: ${(article.sentiment.global_sentiment[1] * 100).toFixed(1)}%)` // Convertir confianza a %
          : `Sentimiento no disponible`;

        return (
          // Contenedor de la tarjeta individual del artículo
          <div key={article.id} className="group bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-150 ease-in-out relative">
            {/* Enlace que envuelve toda la tarjeta, dirige al detalle del artículo */}
            <Link
              to={`/article/${article.id}`}
              className="block hover:no-underline focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-400 rounded-lg" // Mejorado focus state
              aria-label={`Leer más sobre ${article.titulo}`} // Para accesibilidad
            >
              {/* Contenido principal de la tarjeta, distribuido con flexbox */}
              <div className="flex flex-col sm:flex-row justify-between items-start gap-3 sm:gap-4">
                {/* Sección Izquierda: Título y Metadatos */}
                <div className="flex-grow overflow-hidden min-w-0"> {/* min-w-0 para que truncate funcione bien en flex */}
                  <h3 className="text-lg font-semibold mb-2 text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                    {article.titulo || "Título no disponible"}
                  </h3>
                  {/* Contenedor para metadatos (Fecha, Sección, Autor) */}
                  <div className="flex flex-wrap gap-x-3 gap-y-1.5 text-sm text-gray-600"> {/* Ajustado gap */}
                    {article.fecha && ( // Mostrar solo si hay fecha
                        <span className="bg-gray-100 px-2 py-0.5 rounded whitespace-nowrap">
                        Fecha: <span className="font-medium text-gray-800">{article.fecha}</span>
                        </span>
                    )}
                    <span className="bg-gray-100 px-2 py-0.5 rounded whitespace-nowrap">
                      Sección: <span className="font-medium text-gray-800">{displaySeccion}</span>
                    </span>
                    {article.autor && ( // Mostrar solo si hay autor
                        <span className="bg-gray-100 px-2 py-0.5 rounded whitespace-nowrap">
                        Autor: <span className="font-medium text-gray-800">{article.autor}</span>
                        </span>
                    )}
                  </div>
                </div>

                {/* Sección Derecha: Indicadores de Sentimiento, Estado y Enlace "Abrir" */}
                <div className="flex-shrink-0 flex items-center gap-3 mt-2 sm:mt-0"> {/* Ajuste de margen para móviles */}
                  {/* Indicador de Sentimiento */}
                  {article.sentiment?.global_sentiment && ( // Mostrar solo si hay datos de sentimiento
                    <span
                        className={`flex items-center gap-1.5 text-sm px-2.5 py-1 rounded-md font-medium ${sentimentConfig.color} ${sentimentConfig.color.replace('text-', 'bg-')}/10`} // Fondo con opacidad
                        title={sentimentTooltip}
                    >
                        <FontAwesomeIcon icon={sentimentConfig.icon} className="h-3.5 w-3.5" />
                    </span>
                  )}

                  {/* Badge de Estado */}
                  <span className={`text-xs px-2.5 py-1 rounded-md font-medium ${statusConfig.bgColor} ${statusConfig.color}`}>
                    {statusConfig.label}
                  </span>

                  {/* Enlace/Icono "Abrir" */}
                  <div className="text-gray-400 group-hover:text-blue-500 flex items-center gap-1.5 transition-colors">
                    <span className="text-sm hidden md:inline">Abrir</span> {/* Ajustado para mostrar en md */}
                    <FontAwesomeIcon icon={faChevronRight} className="h-4 w-4" />
                  </div>
                </div>
              </div>
            </Link>
          </div>
        );
      })}
    </div>
  );
};

export default ArticleList;