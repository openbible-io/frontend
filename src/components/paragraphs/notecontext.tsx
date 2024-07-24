import { createContext } from 'preact'
import { NoteType } from '../../utils'

interface NoteContextType {
  onNoteSubmit: (note: NoteType) => void;
}

export const NoteContext = createContext({
  onNoteSubmit: (note: NoteType) => {}
} as NoteContextType)
