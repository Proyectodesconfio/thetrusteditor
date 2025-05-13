// src/components/HomeMetrics.tsx
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUser, faCheck, faClock, faWarning, faNewspaper,
} from '@fortawesome/free-solid-svg-icons';
import type { GlobalMetrics } from '../types';

// --- Configuraciones de Visualización (Solo para Estadísticas de Artículos) ---
const statusDisplayConfig = {
  authors:    { label: 'Autores',      icon: faUser,      color: 'text-blue-600' },
  articles:   { label: 'Artículos',    icon: faNewspaper, color: 'text-indigo-600' },
  reviewed:   { label: 'Revisados',    icon: faCheck,     color: 'text-green-600' },
  pending:    { label: 'Pendientes',   icon: faClock,     color: 'text-amber-600' },
  unreviewed: { label: 'Sin revisión', icon: faWarning,   color: 'text-red-600' },
} as const;

// Claves para el mapeo de la tarjeta de estadísticas.
// Estas claves DEBEN ser propiedades válidas de GlobalMetrics.
type StatKey = keyof GlobalMetrics; // Usar keyof GlobalMetrics directamente si coincide
// O si las claves de statusDisplayConfig son exactamente las de GlobalMetrics:
// type StatKey = keyof typeof statusDisplayConfig; // Esto también funciona si las claves son idénticas

// --- Props del Componente ---
interface HomeMetricsProps {
  metrics: GlobalMetrics;
}

/**
 * Componente dashboard que muestra la tarjeta de "Estadísticas Generales"
 * de los artículos, basada en las métricas globales precalculadas.
 */
export default function HomeMetrics({ metrics }: HomeMetricsProps) {
  const formatNumber = (n: number): string => {
    try {
      return new Intl.NumberFormat('es-ES').format(n);
    } catch (e) {
      return String(n);
    }
  };

  // Definir las claves para los 5 items a mostrar en la tarjeta de Estadísticas
  // Asegurarse de que estas claves sean válidas para GlobalMetrics y statusDisplayConfig
  const statItemsToDisplay: StatKey[] = ['authors', 'articles', 'reviewed', 'pending', 'unreviewed'];

  return (
    <div className="mt-6 mb-6 md:mt-8 md:mb-8">
      <div className="bg-white rounded-lg p-4 md:p-6 shadow-lg border border-gray-200">
        <h3 className="text-lg md:text-xl font-semibold text-gray-800 mb-6 text-center sm:text-left">
          Estadísticas de Artículos
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-x-4 gap-y-6 items-start">
          {statItemsToDisplay.map((key) => {
            const cfg = statusDisplayConfig[key]; // 'key' aquí es una de las StatKey
            // --- CORRECCIÓN ---
            // Acceder a la propiedad de 'metrics' de forma segura usando la clave tipada.
            // TypeScript ahora sabe que 'key' es una propiedad válida de 'GlobalMetrics'.
            const value = metrics[key];

            return (
              <div key={key} className="flex flex-col items-center text-center">
                <FontAwesomeIcon icon={cfg.icon} className={`w-7 h-7 md:w-8 md:h-8 ${cfg.color} mb-2`} />
                <div className="text-xl md:text-2xl font-bold text-gray-900 mb-1">{formatNumber(value)}</div>
                <div className="text-sm text-gray-600">{cfg.label}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}