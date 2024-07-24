import { h, Component, Fragment, createRef } from 'preact'
import styles from './versenote.css'
import { NoteContext } from './versenotecontext'
import { NoteType, VerseType } from '../../utils'
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

  textAreaRef = createRef<HTMLTextAreaElement>()

  constructor(props: VerseNoteProps) {
    super(props)
    this.note = this.props.verse.note as NoteType
    this.state = {
      isFormOpen: this.note.isFormOpen,
      isNoteOpen: false
    }
  }

  componentDidMount() {
    if (this.note.isFormOpen && this.textAreaRef.current) {
      this.textAreaRef.current.focus()
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

  onOpenForm = (_ev: any) => {
    if (this.textAreaRef.current) {
      this.textAreaRef.current.focus()
    }
    this.setState({
      isFormOpen: !this.state.isFormOpen,
      isNoteOpen: false
    })
  }

  toggleNoteOpen = (_ev: any) => {
    if (!this.state.isFormOpen) {
      this.setState({
        isNoteOpen: !this.state.isNoteOpen,
      })
    } else {
      this.setState({
        isFormOpen: false,
      })
    }
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
            {({ onNoteSubmit, onNoteRemove }) => (
              <form
                id={`versenote-${id}`}
                onSubmit={(ev: any) => this.onSubmit(ev, onNoteSubmit)}
                onReset={(_ev: any) => onNoteRemove(this.note)}
                class={styles.form}
              >
                <div class={styles.textareaContainer}>
                  <textarea
                    form={`versenote-${id}`}
                    name="note"
                    class={styles.textarea}
                    onInput={this.onInput}
                    value={this.note.note}
                    placeholder="Add note"
                    ref={this.textAreaRef}
                  />
                </div>
                <input type="reset" value="Remove" />
                <input type="submit" value="Submit" />
              </form>
            )}
          </NoteContext.Consumer>
        )}
        {this.state.isNoteOpen && (
          <div>
            {this.note.note}
            <sup class={styles.sup} onClick={this.onOpenForm}>
              {' '}<EditIcon width="12px" />
            </sup>
          </div>
        )}
      </Fragment>
    )
  }
}
