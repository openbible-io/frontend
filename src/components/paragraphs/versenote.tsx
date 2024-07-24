import { h, Fragment } from 'preact'
import { useState, useEffect, useRef } from 'preact/hooks'
import styles from './versenote.css'
import { NoteContext } from './versenotecontext'
import { NoteType, VerseType } from '../../utils'
import EditIcon from '../../icons/fa-edit.svg'

interface VerseNoteProps {
  verse: VerseType;
}

let globalId = 0
export function VerseNote(props: VerseNoteProps) {
  const id = globalId++
  const textAreaRef = useRef<HTMLTextAreaElement>()
  const note = props.verse.note as NoteType
  const [isFormOpen, setFormOpen] = useState(note.isFormOpen)
  const [isNoteOpen, setNoteOpen] = useState(false)

  useEffect(() => {
    if (note.isFormOpen && textAreaRef.current) {
      textAreaRef.current.focus()
    }
  }, [])

  const onSubmit = (ev: any, onNoteSubmit: (note: NoteType) => void) => {
    ev.preventDefault()
    
    onNoteSubmit(note)
    setFormOpen(false)
    setNoteOpen(true)
  }

  const onInput = (ev: any) => {
    note.note = ev.target.value
  }

  const onOpenForm = (_ev: any) => {
    if (textAreaRef.current) {
      textAreaRef.current.focus()
    }

    setFormOpen(isOpen => !isOpen)
    setNoteOpen(false)
  }

  const toggleNoteOpen = (_ev: any) => {
    if (!isFormOpen) {
      setNoteOpen(isOpen => !isOpen)
    } else {
      setFormOpen(false)
    }
  }

  return (
    <Fragment>
      <sup
        class={styles.sup}
        onClick={toggleNoteOpen}
      >
        N
      </sup>
      {isFormOpen && (
        <NoteContext.Consumer>
          {({ onNoteSubmit, onNoteRemove }) => (
            <form
              id={`versenote-${id}`}
              onSubmit={(ev: any) => onSubmit(ev, onNoteSubmit)}
              onReset={(_ev: any) => onNoteRemove(note)}
              class={styles.form}
            >
              <div class={styles.textareaContainer}>
                <textarea
                  form={`versenote-${id}`}
                  name="note"
                  class={styles.textarea}
                  onInput={onInput}
                  value={note.note}
                  placeholder="Add note"
                  ref={textAreaRef}
                />
              </div>
              <input type="reset" value="Remove" />
              <input type="submit" value="Submit" />
            </form>
          )}
        </NoteContext.Consumer>
      )}
      {isNoteOpen && (
        <div>
          {note.note}
          <sup class={styles.sup} onClick={onOpenForm}>
            {' '}<EditIcon width="12px" />
          </sup>
        </div>
      )}
    </Fragment>
  )
}
