import React from 'react';
import { DateRange } from '../hooks/useDateRange';
import { format } from 'date-fns';

interface Props {
  value: DateRange;
  onChange: (r: DateRange) => void;
}

/**
 * 🎯 PeriodFilter – versión mínima
 * --------------------------------------------------
 * Reemplaza la implementación con shadcn/ui para evitar
 * dependencias adicionales. Usa dos <input type="date">.
 */
export default function PeriodFilter({ value, onChange }: Props) {
  const handleChange = (key: 'from' | 'to') => (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = e.target.value ? new Date(e.target.value) : null;
    onChange({ ...value, [key]: date });
  };

  return (
    <div className="flex items-center gap-2">
      <input
        type="date"
        value={value.from ? format(value.from, 'yyyy-MM-dd') : ''}
        onChange={handleChange('from')}
        className="border rounded px-2 py-1 text-sm"
      />
      <span className="text-gray-500">—</span>
      <input
        type="date"
        value={value.to ? format(value.to, 'yyyy-MM-dd') : ''}
        onChange={handleChange('to')}
        className="border rounded px-2 py-1 text-sm"
      />
    </div>
  );
}