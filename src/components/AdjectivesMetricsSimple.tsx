import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFont } from '@fortawesome/free-solid-svg-icons';
import type { Article } from '../types';

interface AdjectivesMetricsProps {
  metrics: Article['metrics']; // Recibe el objeto 'metrics' del artículo
}

export default function AdjectivesMetricsSimple({ metrics }: AdjectivesMetricsProps) {
  // Calcula el porcentaje desde las métricas (multiplicado por 100)
  const percentage = (metrics?.adjectives?.perc_adjectives?.value ?? 0) * 100;

  // Obtener el número real de adjetivos
  const actualValue = metrics?.adjectives?.num_adjectives?.value ?? 0;

  return (
    // Ajusta la altura si es necesario, h-full podría ser mejor para flex/grid layouts
    <div className="bg-white rounded-lg p-4 md:p-6 shadow-sm border flex flex-col justify-between h-full min-h-[180px]"> {/* Ajustado padding/altura */}

      {/* Sección Superior: Título y Valor Real */}
      <div className="flex justify-between items-start mb-4"> {/* Cambiado a items-start */}
        <h3 className="text-lg md:text-xl font-medium text-gray-800">Adjetivos</h3> {/* Ajustado tamaño/color */}
        <span className="text-purple-600 text-2xl font-semibold"> {/* Ajustado color/tamaño */}
          {actualValue} {/* Muestra el valor real */}
        </span>
      </div>

      {/* Sección Inferior: Barra y Porcentaje */}
      <div className="flex flex-col gap-2">
        {/* Texto Comparativo: Ahora solo muestra el porcentaje */}
        <div className="flex justify-between text-xs md:text-sm text-gray-600"> {/* Ajustado tamaño/color */}
          <span>{actualValue} Adjetivos</span>
          {/* --- CAMBIO: Mostrar solo el porcentaje --- */}
          <span className="text-purple-600 font-medium">
             {percentage.toFixed(1)}% {/* Mostrar solo el % con 1 decimal */}
          </span>
        </div>
        {/* Barra de Progreso (representa el porcentaje real) */}
        <div className="flex h-2 rounded-full bg-purple-100 overflow-hidden"> {/* Contenedor con fondo y redondeado */}
          <div
            className="bg-purple-500 transition-width duration-300 ease-in-out" // Quitado redondeado individual
            style={{ width: `${Math.min(percentage, 100)}%` }} // Limita al 100% visualmente si es necesario
            title={`${percentage.toFixed(1)}%`} // Tooltip con el valor exacto
          />
        </div>
      </div>
    </div>
  );
}