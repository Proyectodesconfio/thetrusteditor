// src/pages/LoadedArticlesPage.tsx
import React from 'react';
import { loadArticles } from '../services/adapters/loadArticles';
// import { Article } from '../types'; // No se usa directamente si loadArticles ya devuelve Article[]

/**
 * Página que muestra una lista de todos los artículos cargados en el sistema,
 * junto con un resumen de sus metadatos y algunas métricas clave.
 * Principalmente útil para depuración o una vista general rápida.
 */
const LoadedArticlesPage: React.FC = () => {
    // Carga todos los artículos. Para una página simple, no es necesario useMemo aquí,
    // pero se podría añadir si la carga fuera muy costosa y el componente se re-renderizara frecuentemente.
    const articles = loadArticles();

    if (articles.length === 0) {
        return (
            <div className="p-4 md:p-8 text-center">
                <h1 className="text-2xl font-bold mb-4">Artículos Cargados</h1>
                <p className="text-gray-600">No se encontraron artículos cargados.</p>
            </div>
        );
    }

    return (
        // Contenedor principal de la página con padding
        <div className="p-4 md:p-8">
            <h1 className="text-2xl md:text-3xl font-bold mb-6 text-gray-800">Artículos Cargados ({articles.length})</h1>
            <div className="space-y-6"> {/* Espaciador entre artículos */}
                {articles.map(article => (
                    <div key={article.id} className="p-4 bg-white rounded-lg shadow-md border"> {/* Estilo de tarjeta mejorado */}
                        <h2 className="text-xl font-bold text-blue-600 mb-2">{article.titulo || "Sin Título"}</h2>
                        <div className="text-sm text-gray-700 space-y-1">
                            <p><strong>ID:</strong> {article.id}</p>
                            <p><strong>Autor:</strong> {article.autor || "Desconocido"}</p>
                            <p><strong>Fecha:</strong> {article.fecha || "No especificada"}</p>
                            <p><strong>Medio:</strong> {article.medio || "Desconocido"}</p>
                        </div>

                        {/* Resumen de métricas del artículo (si existen) */}
                        {article.metrics && ( // Mostrar solo si hay objeto de métricas
                            <div className="mt-4 pt-4 border-t border-gray-200">
                                <h3 className="text-md font-semibold text-gray-700 mb-2">Resumen de Métricas</h3>
                                <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
                                    {/* Acceso seguro a las métricas con optional chaining y fallback a 0 */}
                                    <li>Adjetivos: {article.metrics.adjectives?.num_adjectives?.value ?? 'N/A'}</li>
                                    <li>Entidades Totales: {article.metrics.entities?.num_entidades?.value ?? 'N/A'}</li>
                                    {/* Asumiendo que metrics.sources contiene las métricas de fuentes */}
                                    <li>Citas Identificadas: {article.metrics.sources?.num_afirmaciones?.value ?? 'N/A'}</li>
                                    <li>Fuentes Únicas Referenciadas: {article.metrics.sources?.num_referenciados_unique?.value ?? 'N/A'}</li>
                                </ul>
                            </div>
                        )}
                        {!article.metrics && (
                             <p className="mt-3 text-xs text-gray-400 italic">Métricas no disponibles para este artículo.</p>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default LoadedArticlesPage;