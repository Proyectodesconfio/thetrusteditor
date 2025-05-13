// src/components/ArticleList.tsx
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faChevronRight,
  // Iconos para los estados, deben coincidir con los usados en HomeMetrics
  faCheck,
  faClock,
  faWarning
} from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import type { Article } from '../types';

// --- Tipos de Estado para Mostrar ---
type DisplayStatusLabel = 'Pendiente' | 'Aprobado' | 'Revisar' | 'Sin Revisión';

// --- Configuración de ESTADO del Artículo ---
interface StatusDisplayConfig {
  label: DisplayStatusLabel;
  color: string;
  bgColor: string;
  icon: typeof faCheck; // Tipo base del icono
  iconColor: string; // Color específico para el icono (puede ser igual a 'color' o diferente)
}

/**
 * Mapea el valor de `article.status` a una etiqueta de UI, clases de estilo e icono.
 */
const getStatusConfig = (status: string | undefined): StatusDisplayConfig => {
  const normalizedStatus = status?.trim().toLowerCase() ?? 'sin revisión';

  switch (normalizedStatus) {
    case 'reviewed':
    case 'aprobado':
      return { label: 'Aprobado', color: 'text-green-700', bgColor: 'bg-green-100', icon: faCheck, iconColor: 'text-green-600' };
    case 'pending':
    case 'pendiente':
      return { label: 'Pendiente', color: 'text-amber-700', bgColor: 'bg-amber-100', icon: faClock, iconColor: 'text-amber-600' };
    case 'flagged':
    case 'revisar':
      return { label: 'Revisar', color: 'text-red-700', bgColor: 'bg-red-100', icon: faWarning, iconColor: 'text-red-600' };
    case '':
    case 'unreviewed':
    case 'sin revisión':
    default:
      return { label: 'Sin Revisión', color: 'text-gray-600', bgColor: 'bg-gray-100', icon: faWarning, iconColor: 'text-red-500' }; // Icono rojo para 'Sin Revisión' como en HomeMetrics
  }
};

// --- Componente ArticleList ---
interface ArticleListProps {
  articles: Article[];
}

const ArticleList: React.FC<ArticleListProps> = ({ articles }) => {
  if (articles.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {articles.map((article) => {
        const statusConfig = getStatusConfig(article.status);
        const displaySeccion = article.seccion ?? 'Sin sección';

        return (
          <div key={article.id} className="group bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-150 ease-in-out relative">
            <Link
              to={`/article/${article.id}`}
              className="block hover:no-underline focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-400 rounded-lg"
              aria-label={`Leer más sobre ${article.titulo}`}
            >
              <div className="flex flex-col sm:flex-row justify-between items-start gap-3 sm:gap-4">
                {/* Sección Izquierda: Título y Metadatos */}
                <div className="flex-grow overflow-hidden min-w-0">
                  <h3 className="text-lg font-semibold mb-2 text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                    {article.titulo || "Título no disponible"}
                  </h3>
                  <div className="flex flex-wrap gap-x-3 gap-y-1.5 text-sm text-gray-600">
                    {article.fecha && (
                        <span className="bg-gray-100 px-2 py-0.5 rounded whitespace-nowrap">
                        Fecha: <span className="font-medium text-gray-800">{article.fecha}</span>
                        </span>
                    )}
                    <span className="bg-gray-100 px-2 py-0.5 rounded whitespace-nowrap">
                      Sección: <span className="font-medium text-gray-800">{displaySeccion}</span>
                    </span>
                    {article.autor && (
                        <span className="bg-gray-100 px-2 py-0.5 rounded whitespace-nowrap">
                        Autor: <span className="font-medium text-gray-800">{article.autor}</span>
                        </span>
                    )}
                  </div>
                </div>

                {/* Sección Derecha: Icono de Estado, Badge de Texto del Estado, y Enlace "Abrir" */}
                <div className="flex-shrink-0 flex items-center gap-2.5 mt-2 sm:mt-0"> {/* Ajustado gap */}
                  {/* Icono de Estado (fuera del badge) */}
                  <FontAwesomeIcon
                    icon={statusConfig.icon}
                    className={`w-4 h-4 ${statusConfig.iconColor}`} // Usa iconColor para el icono
                    title={`Estado: ${statusConfig.label}`} // Tooltip para el icono
                  />

                  {/* Badge de Texto del Estado (sin icono dentro) */}
                  <span
                    className={`text-xs px-2.5 py-1 rounded-md font-medium ${statusConfig.bgColor} ${statusConfig.color}`}
                  >
                    {statusConfig.label} {/* Solo la etiqueta del estado */}
                  </span>

                  {/* Enlace/Icono "Abrir" */}
                  <div className="text-gray-400 group-hover:text-blue-500 flex items-center gap-1.5 transition-colors">
                    <span className="text-sm hidden md:inline">Abrir</span>
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