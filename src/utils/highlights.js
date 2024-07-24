function getKey(book, chapter) {
  return `highlight-${book}-${chapter}`
}

export function getLocalHighlights(book, chapter) {
  const key = getKey(book, chapter)
  return JSON.parse(localStorage.getItem(key)) || {}
}

export function setLocalHighlight(book, chapter, fromId, toId, color) {
  const key = getKey(book, chapter)
  const highlights = getLocalHighlights(book, chapter) || {}
  highlights[fromId] = { toId, color }
  localStorage.setItem(key, JSON.stringify(highlights))
}
