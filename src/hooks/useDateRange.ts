// hooks/useDateRange.ts
import { useState, useEffect } from 'react';
import { startOfDay, endOfDay, format } from 'date-fns';

export interface DateRange {
  from: Date;
  to: Date;
}

/**
 * Hook para manejar rangos de fechas con valores por defecto
 * y compatibilidad con el componente PeriodFilter
 */
export function useDateRange() {
  // Por defecto, filtramos el día de hoy
  const [range, setRangeState] = useState<DateRange>(() => {
    const today = new Date();
    const from = startOfDay(today);
    const to = endOfDay(today);
    
    console.log('🗓️ useDateRange inicializado:', {
      from: format(from, 'yyyy-MM-dd HH:mm:ss'),
      to: format(to, 'yyyy-MM-dd HH:mm:ss')
    });
    
    return { from, to };
  });

  // Wrapper para asegurar fechas válidas
  const setRange = (newRange: DateRange) => {
    console.log('🗓️ useDateRange.setRange llamado con:', {
      from: newRange.from ? format(newRange.from, 'yyyy-MM-dd HH:mm:ss') : 'null', 
      to: newRange.to ? format(newRange.to, 'yyyy-MM-dd HH:mm:ss') : 'null'
    });
    
    // Validamos que las fechas sean válidas
    if (!newRange.from || !newRange.to || isNaN(newRange.from.getTime()) || isNaN(newRange.to.getTime())) {
      console.error('❌ useDateRange: Se intentó establecer fechas inválidas', newRange);
      return; // No actualizamos el estado con fechas inválidas
    }
    
    // Aseguramos que from <= to
    if (newRange.from > newRange.to) {
      console.warn('⚠️ useDateRange: from > to, invirtiendo el rango');
      setRangeState({
        from: newRange.to,
        to: newRange.from
      });
    } else {
      setRangeState(newRange);
    }
  };
  
  // Log cuando cambia el rango
  useEffect(() => {
    console.log('🗓️ useDateRange actualizado:', {
      from: format(range.from, 'yyyy-MM-dd HH:mm:ss'),
      to: format(range.to, 'yyyy-MM-dd HH:mm:ss')
    });
  }, [range]);

  return { range, setRange };
}