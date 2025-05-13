// src/components/AdjectivesMetricsSimple.tsx
import type { Article } from '../types';

interface AdjectivesMetricsProps {
  metrics: Article['metrics'];
}

/**
 * Calcula un color HSL que va de verde a rojo basándose en un porcentaje.
 * @param percentage - El porcentaje (0 a 100). 0% = Rojo, 100% = Verde.
 * @param saturation - Saturación (0-100), por defecto 90.
 * @param lightness - Luminosidad (0-100), por defecto 50.
 * @returns Un string de color HSL, ej: "hsl(120, 90%, 50%)".
 */
const getPercentageColorHsl = (
  percentage: number,
  saturation: number = 70, // Ajustado para un color menos intenso que el rojo/verde puros
  lightness: number = 55   // Ajustado para mejor visibilidad
): string => {
  // Normalizar el porcentaje a un rango de 0 a 1
  const normalizedPercent = Math.max(0, Math.min(100, percentage)) / 100;

  // Mapear el porcentaje al matiz (Hue)
  // 0% (rojo) -> Hue = 0
  // 100% (verde) -> Hue = 120
  // Se interpola linealmente: hue = (1 - normalizedPercent) * 0 + normalizedPercent * 120
  // Simplificado: hue = normalizedPercent * 120
  // PERO queremos que 0% sea ROJO y 100% sea VERDE.
  // Entonces, si el porcentaje es BAJO, queremos HUE cercano a 0 (rojo).
  // Si el porcentaje es ALTO, queremos HUE cercano a 120 (verde).
  // La interpolación correcta sería: hue = (normalizedPercent * 120)
  // Por ejemplo:
  // 0%   -> 0 * 120 = 0 (rojo)
  // 50%  -> 0.5 * 120 = 60 (amarillo)
  // 100% -> 1 * 120 = 120 (verde)

  // Ajuste para que el "peligro" (porcentaje bajo) sea rojo
  // Si un porcentaje BAJO de adjetivos es MALO, entonces debería ser rojo.
  // Si un porcentaje ALTO de adjetivos es MALO, entonces debería ser rojo.
  // Asumamos que un porcentaje MUY ALTO de adjetivos podría ser malo (demasiado florido)
  // y un porcentaje MUY BAJO también (demasiado seco). Un punto óptimo en el medio.

  // Para tu caso, parece que la barra va de un color (ej: púrpura) a más claro.
  // Si quieres que la barra cambie de VERDE (bueno, porcentaje bajo/ideal) a ROJO (malo, porcentaje alto),
  // necesitamos invertir la lógica del HUE.
  // HUE para Verde: ~120
  // HUE para Rojo: ~0
  // Si `percentage` es bajo (cerca de 0), HUE debe ser ~120.
  // Si `percentage` es alto (cerca de 100), HUE debe ser ~0.
  // Fórmula: hue = 120 - (normalizedPercent * 120)
  // Ejemplo:
  // 0%   -> 120 - (0 * 120)   = 120 (Verde)
  // 50%  -> 120 - (0.5 * 120) = 60  (Amarillo)
  // 100% -> 120 - (1 * 120)   = 0   (Rojo)

  const hue = 120 - (normalizedPercent * 120); // Verde (0%) a Rojo (100%)

  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
};


export default function AdjectivesMetricsSimple({ metrics }: AdjectivesMetricsProps) {
  const percentage = (metrics?.adjectives?.perc_adjectives?.value ?? 0) * 100;
  const actualValue = metrics?.adjectives?.num_adjectives?.value ?? 0;

  // --- OBTENER COLOR DINÁMICO PARA LA BARRA ---
  // Asumimos que un porcentaje más alto es "peor" y por eso se vuelve rojo.
  // Si un porcentaje más bajo es "peor", invierte la lógica de 'hue' en getPercentageColorHsl.
  const barColor = getPercentageColorHsl(percentage);

  return (
    <div className="bg-white rounded-lg p-4 md:p-6 shadow-sm border flex flex-col h-full min-h-[180px]">
      <div className="flex justify-between items-start mb-4 flex-shrink-0">
        <h3 className="text-lg md:text-xl font-medium text-gray-800">Adjetivos</h3>
        {/* El color del número total puede seguir siendo púrpura o adaptarse también */}
        <span className="text-purple-600 text-2xl md:text-3xl font-semibold">
          {actualValue}
        </span>
      </div>
      <div className="flex-grow flex flex-col items-center justify-center gap-2.5">
         <div
           className="w-5/6 h-3 rounded-full bg-gray-200 overflow-hidden" // Fondo de barra neutro (gris claro)
           title={`${percentage.toFixed(1)}% de adjetivos en el texto`}
         >
           <div
             className="h-full rounded-full transition-all duration-300 ease-in-out"
             style={{
                width: `${Math.min(percentage, 100)}%`,
                backgroundColor: barColor // Aplicar color dinámico
            }}
           />
         </div>
         {/* El color del texto del porcentaje también puede ser dinámico o un color fijo */}
         <span className="text-lg md:text-xl font-semibold mt-1" style={{ color: barColor }}>
              {percentage.toFixed(1)}%
         </span>
      </div>
       <div className="flex-shrink-0 h-2"></div>
    </div>
  );
}