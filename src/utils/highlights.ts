function getKey(book: string, chapter: number) {
  return `highlight-${book}-${chapter}`
}

export interface Highlight {
  toId: string;
  color: string;
}

export interface Highlights {
  [fromId: string]: Highlight
}

export function getLocalHighlights(
  book: string,
  chapter: number
): Highlights {
  const key = getKey(book, chapter)
  return JSON.parse(localStorage.getItem(key) as string) || {}
}

export function setLocalHighlight(
  book: string,
  chapter: number, 
  fromId: string,
  toId: string,
  color: string
) {
  const key = getKey(book, chapter)
  const highlights = getLocalHighlights(book, chapter) || {}
  highlights[fromId] = { toId, color }
  localStorage.setItem(key, JSON.stringify(highlights))
}
