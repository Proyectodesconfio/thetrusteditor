import { Article } from "../../types";

export function mapOutput(out: any): Partial<Article> {
  const adjectivesBlock = out.adjectives?.adjectives ?? out.adjectives;
  return {
    adjectives: adjectivesBlock,
    entities: out.entities?.entities ?? out.entities,
    metrics: out.metrics,
    sentiment: out.sentiment,
    sources: out.sources,
    status: out.status,
  };
}