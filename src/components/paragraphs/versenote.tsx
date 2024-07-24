import { h, Component, Fragment } from 'preact'
import styles from './versenote.css'
import { NoteContext } from './notecontext'
import { NoteType, VerseType } from '../../utils'
import { Button } from '../button/button'
import EditIcon from '../../icons/fa-edit.svg'

interface VerseNoteProps {
  verse: VerseType;
}

interface VerseNoteState {
  isFormOpen: boolean;
  isNoteOpen: boolean;
}

export class VerseNote extends Component<VerseNoteProps, VerseNoteState> {
  static id = 0
  note: NoteType

  constructor(props: VerseNoteProps) {
    super(props)
    this.note = this.props.verse.note as NoteType
    this.state = {
      isFormOpen: this.note.isFormOpen,
      isNoteOpen: false
    }
  }

  onSubmit = (ev: any, onNoteSubmit: (note: NoteType) => void) => {
    ev.preventDefault()
    
    onNoteSubmit(this.note)
    this.setState({ isFormOpen: false, isNoteOpen: true })
  }

  onInput = (ev: any) => {
    this.note.note = ev.target.value
  }

  toggleFormOpen = (_ev: any) => {
    this.setState({ isFormOpen: !this.state.isFormOpen, isNoteOpen: false })
  }

  toggleNoteOpen = (_ev: any) => {
    this.setState({ isNoteOpen: !this.state.isNoteOpen })
  }
  
  render() {
    const id = VerseNote.id++
    return (
      <Fragment>
        <sup
          class={styles.sup}
          onClick={this.toggleNoteOpen}
        >
          N
        </sup>
        {this.state.isFormOpen && (
          <NoteContext.Consumer>
            {({ onNoteSubmit }) => (
              <Fragment>
                <textarea
                  form={`versenote-${id}`}
                  name="note"
                  class={styles.textarea}
                  onInput={this.onInput}
                  value={this.note.note}
                  placeholder="Add note"
                />
                <form
                  id={`versenote-${id}`}
                  onSubmit={(ev: any) => this.onSubmit(ev, onNoteSubmit)}
                >
                  <input type="submit" value="Submit" />
                </form>
              </Fragment>
            )}
          </NoteContext.Consumer>
        )}
        {this.state.isNoteOpen && (
          <div>
            {this.note.note}
            <sup class={styles.sup} onClick={this.toggleFormOpen}>
              {' '}<EditIcon width="12px" />
            </sup>
          </div>
        )}
      </Fragment>
    )
  }
}
