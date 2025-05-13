// src/components/SourcesMetricsSimple.tsx

interface SourcesMetricsSimpleProps {
  metrics: Article['metrics'];
}

/**
 * Componente simple para el "Resumen Rápido" que muestra el número total de citas
 * de forma destacada, con el color del número indicando un umbral.
 */
export default function SourcesMetricsSimple({ metrics }: SourcesMetricsSimpleProps) {
  const totalCitas = metrics?.sources?.num_afirmaciones?.value ??
                     metrics?.sources?.num_citas?.value ?? // Fallback por si el nombre de la métrica varía
                     0;

  // Determinar el color del número basado en el total de citas
  const numberColorClass = totalCitas < 3 ? 'text-red-600' : 'text-green-600';

  return (
    // Contenedor principal de la tarjeta
    <div className="bg-white rounded-lg p-4 md:p-6 shadow-sm border flex flex-col h-full min-h-[180px] text-center">

      {/* Sección Superior: Título "Fuentes" */}
      <div className="mb-2 flex-shrink-0"> 
        <h3 className="text-lg md:text-xl font-medium text-gray-800">
          Fuentes
        </h3>
      </div>

      {/* Sección Central: Número Grande y Coloreado de Citas */}
      <div className="flex-grow flex items-center justify-center">
        <span className={`text-5xl lg:text-6xl font-bold ${numberColorClass}`}>
          {totalCitas}
        </span>
      </div>

    </div>
  );
}