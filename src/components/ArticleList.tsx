import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
// Ensure Article is imported correctly according to your types/index.ts structure
import type { Article } from '../types';

/**
 * Defines the possible display statuses for an article and their associated styling.
 * Adjust these based on the actual values used in `Article.status`.
 */
type DisplayStatus = 'pendiente' | 'aprobado' | 'revisar' | 'desconocido';

/**
 * Maps an article's status string to a display status and Tailwind CSS classes.
 * Handles potential undefined status from the Article data.
 *
 * @param status - The status string from the Article object (e.g., "reviewed", "pending", or undefined).
 * @returns An object containing the display status label and corresponding CSS classes.
 */
const getStatusConfig = (status: string | undefined): { label: DisplayStatus; color: string; bgColor: string } => {
  // Normalize the input status (lowercase, handle undefined)
  const normalizedStatus = status?.toLowerCase() ?? 'desconocido';

  switch (normalizedStatus) {
    // Map potential backend statuses to display statuses
    case 'aprobado': // Assuming 'aprobado' is a possible value in article.status
    case 'reviewed': // Example: handle variations
      return { label: 'aprobado', color: 'text-green-600', bgColor: 'bg-green-50' };
    case 'revisar': // Assuming 'revisar' is a possible value
    case 'flagged': // Example: handle variations
      return { label: 'revisar', color: 'text-red-600', bgColor: 'bg-red-50' };
    case 'pendiente': // Assuming 'pendiente' is a possible value
    case 'pending':
      return { label: 'pendiente', color: 'text-gray-500', bgColor: 'bg-gray-50' };
    default:
      // Fallback for unknown or undefined statuses
      return { label: 'desconocido', color: 'text-gray-400', bgColor: 'bg-gray-100' };
  }
};

/**
 * Props for the ArticleList component.
 */
interface ArticleListProps {
  /** An array of Article objects to display. */
  articles: Article[];
}

/**
 * Renders a list of articles, each as a clickable card linking to the article's detail page.
 * Displays basic information like title, date, section, author, and status.
 */
const ArticleList: React.FC<ArticleListProps> = ({ articles }) => {
  return (
    // Use space-y for vertical spacing between articles
    <div className="space-y-4">
      {articles.map((article) => {
        // Determine the display status and styling based on the article's actual status field.
        const statusConfig = getStatusConfig(article.status);
        // Provide a fallback for potentially missing section.
        const displaySeccion = article.seccion ?? 'Sin sección';

        return (
          <div
            key={article.id} // Use stable and unique ID for key
            className="group bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow relative"
          >
            {/* Link wraps the entire content for better clickability */}
            <Link
              to={`/article/${article.id}`} // Dynamic link based on article ID
              className="block hover:no-underline focus:outline-none focus:ring-2 focus:ring-blue-300 rounded-lg" // Added focus styles
            >
              <div className="flex justify-between items-start gap-4"> {/* Added gap */}
                {/* Left side: Title and metadata */}
                <div className="flex-grow overflow-hidden"> {/* Prevent long text overflow */}
                  {/* Article Title: Changes color on hover via group-hover */}
                  <h3 className="text-lg font-semibold mb-2 text-gray-900 group-hover:text-blue-600 truncate"> {/* Added truncate */}
                    {article.titulo}
                  </h3>
                  {/* Metadata Badges */}
                  <div className="flex flex-wrap gap-2 text-sm text-gray-600"> {/* Adjusted gap */}
                    {/* Display Date */}
                    <span className="bg-gray-50 px-2 py-1 rounded whitespace-nowrap">
                      Fecha: <span className="font-medium">{article.fecha}</span> {/* Use font-medium */}
                    </span>
                    {/* Display Section (with fallback) */}
                    <span className="bg-gray-50 px-2 py-1 rounded whitespace-nowrap">
                      Sección: <span className="font-medium">{displaySeccion}</span>
                    </span>
                    {/* Display Author */}
                    <span className="bg-gray-50 px-2 py-1 rounded whitespace-nowrap">
                      Autor: <span className="font-medium">{article.autor}</span>
                    </span>
                  </div>
                </div>

                {/* Right side: Status and Open link */}
                <div className="flex-shrink-0 flex items-center gap-4"> {/* Added flex-shrink-0 */}
                  {/* Status Badge */}
                  <span className={`text-sm px-2 py-1 rounded font-medium ${statusConfig.bgColor} ${statusConfig.color}`}>
                    {/* Capitalize status label */}
                    {statusConfig.label.charAt(0).toUpperCase() + statusConfig.label.slice(1)}
                  </span>
                  {/* "Open" Link Indicator */}
                  <div className="text-gray-400 group-hover:text-blue-500 flex items-center gap-1 transition-colors">
                    <span className="text-sm hidden sm:inline">Abrir</span> {/* Hide text on small screens */}
                    <FontAwesomeIcon icon={faChevronRight} className="h-4 w-4" /> {/* Controlled size */}
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