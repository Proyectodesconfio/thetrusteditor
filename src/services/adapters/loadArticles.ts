import rawInput from '../../data/lavoz_input_04FEB2025.json';
import rawOutput from '../../data/lavoz_output_04FEB2025_cleaned.json';
import { Article } from '../../types';
import { mapInput } from './inputAdapter';
import { mapOutput } from './outputAdapter';

const outputsById = new Map<string, Partial<Article>>(rawOutput.map((o: any) => [o.id, mapOutput(o)]));

export const loadArticles = (): Article[] => {
  return rawInput.map((raw: any) => {
    const base = mapInput(raw);
    const extra = outputsById.get(raw.id) ?? {};
    return { ...base, ...extra } as Article;
  });
};