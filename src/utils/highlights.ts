function getKey(book: string, chapter: number) {
  return `highlight-${book}-${chapter}`
}

interface Highlights {
  [key: string]: {
    toId: string;
    color: string;
  }
}

export function getLocalHighlights(
  book: string,
  chapter: number
): Highlights {
  const key = getKey(book, chapter)
  return JSON.parse(localStorage.getItem(key) || '') || {}
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
