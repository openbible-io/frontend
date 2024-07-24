function getKey(book: string, chapter: number) {
  return `note-${book}-${chapter}`
}

export interface SavedNote {
  toId: string;
  note: string;
}

interface Notes {
  [fromId: string]: SavedNote
}

export function getLocalNotes(
  book: string,
  chapter: number
): Notes {
  const key = getKey(book, chapter)
  return JSON.parse(localStorage.getItem(key) as string) || {}
}

export function setLocalNote(
  book: string,
  chapter: number, 
  fromId: string,
  toId: string,
  note: string
) {
  const key = getKey(book, chapter)
  const notes = getLocalNotes(book, chapter) || {}
  notes[fromId] = { toId, note }
  localStorage.setItem(key, JSON.stringify(notes))
}
