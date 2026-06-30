export function generateSeoTags(name: string, description: string, category: string): string {
  const stopWords = new Set([
    "the", "and", "is", "in", "on", "of", "for", "to", "a", "an", "with", "at", "from", "by", "or", "as", "it", "its",
    "that", "be", "have", "has", "had", "not", "or", "but", "they", "this", "are", "was", "were", "will", "can", "could",
    "should", "would", "so", "if", "do", "does", "did", "up", "out", "about", "into", "over", "after", "again", "here",
    "when", "where", "why", "how", "all", "any", "both", "each", "few", "more", "most", "other", "some", "such", "no",
    "nor", "only", "own", "same", "than", "too", "very", "just", "also", "now", "like", "get", "go", "see", "know", "use",
    "want", "need", "back", "how", "time", "people", "make", "more", "even", "way", "may", "because", "good", "new",
  ]);

  const extractWords = (text: string): string[] => {
    const words = text
      .toLowerCase()
      .replace(/[^\w\s]/g, "")
      .split(/\s+/)
      .filter((w) => w.length > 2 && !stopWords.has(w) && !/^(a|an|the|and|or|but|if|as|at|by|for|from|into|of|on|to|up|via|with|within)$/i.test(w));
    return [...new Set(words)].slice(0, 8);
  };

  const nameWords = extractWords(name);
  const descWords = extractWords(description);
  const catWords = category ? category.toLowerCase().split("").filter((w) => w.length > 2) : [];

  const priority = [...nameWords, ...descWords, ...catWords];
  const seen = new Set();
  const unique = priority.filter((w) => {
    if (seen.has(w)) return false;
    seen.add(w);
    return true;
  });

  return unique.slice(0, 8).join(", ");
}

/** Simple object cache for expensive calculations */
const cache = new Map<string, unknown>();

export function withCache<T, K extends string | number>(key: K, fn: () => T): T {
  if (cache.has(key)) return cache.get(key) as T;
  const result = fn();
  cache.set(key, result);
  return result;
}