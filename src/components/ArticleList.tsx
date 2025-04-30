// src/components/ArticleList.tsx
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faChevronRight,
  faSmile, faMeh, faFrown, faQuestionCircle
} from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import type { Article, ArticleSentiment } from '../types'; // Asegúrate que ArticleSentiment se importe

// --- Tipos de Estado y Sentimiento para Mostrar ---
// Definir las etiquetas *finales* que queremos mostrar en la UI
type DisplayStatusLabel = 'Pendiente' | 'Aprobado' | 'Revisar' | 'Sin Revisión';
type SentimentLabel = 'Positivo' | 'Neutro' | 'Negativo' | 'N/A';

// --- Configuración de ESTADO ---

/**
 * Mapea el valor de `article.status` a una etiqueta de UI y clases de estilo.
 *
 * @param status - El valor del campo `status` del artículo (puede ser undefined).
 * @returns Objeto con la etiqueta a mostrar y las clases de color/fondo.
 */
const getStatusConfig = (status: string | undefined): { label: DisplayStatusLabel; color: string; bgColor: string } => {
  // Normalizar: quitar espacios, convertir a minúsculas, manejar undefined/null/""
  const normalizedStatus = status?.trim().toLowerCase() ?? 'sin revisión';

  // *** AJUSTA LOS 'case' PARA QUE COINCIDAN CON TUS DATOS EXACTOS ***
  switch (normalizedStatus) {
    case 'reviewed':
    case 'aprobado': // Si también usas 'aprobado'
      return { label: 'Aprobado', color: 'text-green-600', bgColor: 'bg-green-50' };

    case 'pending':
    case 'pendiente': // Si también usas 'pendiente'
      return { label: 'Pendiente', color: 'text-amber-600', bgColor: 'bg-amber-50' }; // Ajustado color para pendiente

    case 'flagged':
    case 'revisar': // Si usas 'revisar'
      return { label: 'Revisar', color: 'text-red-600', bgColor: 'bg-red-50' };

    case '':             // String vacío
    case 'unreviewed':   // Si usas 'unreviewed'
    case 'sin revisión': // Si usas 'sin revisión'
    default:             // Cualquier otro valor o undefined/null
      return { label: 'Sin Revisión', color: 'text-gray-500', bgColor: 'bg-gray-100' }; // Cambiado label a 'Sin Revisión'
  }
};

// --- Configuración de SENTIMIENTO ---

type SentimentDisplayConfig = { label: SentimentLabel; color: string; icon: typeof faSmile; };

/** Maps sentiment label ('POS', 'NEU', 'NEG') to display configuration. */
const getSentimentConfig = (globalSentiment: ArticleSentiment['global_sentiment'] | undefined): SentimentDisplayConfig => {
  const label = globalSentiment?.[0] ?? null;
  switch (label) {
    case 'POS': return { label: 'Positivo', color: 'text-green-600', icon: faSmile };
    case 'NEU': return { label: 'Neutro',   color: 'text-gray-500',  icon: faMeh };
    case 'NEG': return { label: 'Negativo', color: 'text-red-600',   icon: faFrown };
    default:    return { label: 'N/A',      color: 'text-gray-400',  icon: faQuestionCircle };
  }
};

// --- Componente ArticleList ---

interface ArticleListProps {
  articles: Article[];
}

/** Renders a list of articles, including status and sentiment indicators. */
const ArticleList: React.FC<ArticleListProps> = ({ articles }) => {
  return (
    <div className="space-y-4">
      {articles.map((article) => {
        // Obtener configuraciones usando los helpers actualizados
        const statusConfig = getStatusConfig(article.status); // <- USA LA FUNCIÓN CORREGIDA
        const sentimentConfig = getSentimentConfig(article.sentiment?.global_sentiment);
        const displaySeccion = article.seccion ?? 'Sin sección';
        const sentimentTooltip = article.sentiment?.global_sentiment
          ? `${sentimentConfig.label} (Confianza: ${article.sentiment.global_sentiment[1].toFixed(1)}%)` // Usar toFixed(1) para un decimal
          : `Sentimiento no disponible`;

        return (
          <div key={article.id} className="group bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow relative">
            <Link to={`/article/${article.id}`} className="block hover:no-underline focus:outline-none focus:ring-2 focus:ring-blue-300 rounded-lg">
              <div className="flex justify-between items-start gap-4">
                {/* Left side */}
                <div className="flex-grow overflow-hidden">
                  <h3 className="text-lg font-semibold mb-2 text-gray-900 group-hover:text-blue-600 truncate">{article.titulo}</h3>
                  <div className="flex flex-wrap gap-2 text-sm text-gray-600">
                    <span className="bg-gray-50 px-2 py-1 rounded whitespace-nowrap">Fecha: <span className="font-medium">{article.fecha}</span></span>
                    <span className="bg-gray-50 px-2 py-1 rounded whitespace-nowrap">Sección: <span className="font-medium">{displaySeccion}</span></span>
                    <span className="bg-gray-50 px-2 py-1 rounded whitespace-nowrap">Autor: <span className="font-medium">{article.autor}</span></span>
                  </div>
                </div>

                {/* Right side */}
                <div className="flex-shrink-0 flex items-center gap-3">
                  {/* Sentiment Indicator */}
                  <span
                    className={`flex items-center gap-1 text-sm px-2 py-1 rounded font-medium ${sentimentConfig.color} bg-opacity-10 ${sentimentConfig.color.replace('text-', 'bg-')}`}
                    title={sentimentTooltip}
                  >
                     <FontAwesomeIcon icon={sentimentConfig.icon} className="h-3.5 w-3.5" />
                  </span>

                  {/* Status Badge - Usa el label de statusConfig */}
                  <span className={`text-xs px-2 py-0.5 rounded font-medium ${statusConfig.bgColor} ${statusConfig.color}`}>
                    {statusConfig.label} {/* Muestra la etiqueta correcta: Aprobado, Pendiente, Revisar, Sin Revisión */}
                  </span>

                  {/* Open Link */}
                  <div className="text-gray-400 group-hover:text-blue-500 flex items-center gap-1 transition-colors">
                    <span className="text-sm hidden sm:inline">Abrir</span>
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