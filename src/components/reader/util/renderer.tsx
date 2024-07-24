import { h, Fragment } from 'preact'
import { onDoubleClickVerseNumber } from '../../reader/util/select'
import styles from './renderer.css'
import { Paragraph, VerseObject } from '../../../utils/books'

let lastVerseObject: VerseObject
const startPunct = /['"“‘\[\(]/

function getClass(verseObject: Paragraph | VerseObject) {
  if (verseObject.t === 'q' &&
      (verseObject as Paragraph).v[0].t === 'v') {
    return styles.qcol
  }

  return styles[verseObject.t]
}

function renderVerseObject(verseObject: VerseObject) {
  let prependSpace = verseObject.t === 'w'
  if (lastVerseObject && (lastVerseObject.n
      || startPunct.test(lastVerseObject.v as string))) {
    prependSpace = false
  }
  lastVerseObject = verseObject
  return (
    <Fragment>
      {prependSpace &&
        <span> </span>
      }
      {verseObject.n &&
        <sup
          class={styles.sup}
          onDblClick={onDoubleClickVerseNumber}
        >
          {verseObject.n}
        </sup>
      }
      {verseObject.v && 
        <span
          data-id={verseObject.id}
          class={getClass(verseObject)}
        >
          {verseObject.v}
        </span>
      }
    </Fragment>
  )
}

function renderParagraph(paragraph: Paragraph | VerseObject) {
  return (
    <Fragment>
      {Array.isArray(paragraph.v)
        ? <p data-id={paragraph.id} class={getClass(paragraph)}>
            {renderParagraphs(paragraph.v)}
          </p>
        : renderVerseObject(paragraph)}
    </Fragment>
  )
}

export function renderParagraphs(paragraphs?: (Paragraph | VerseObject)[]) {
  if (!paragraphs) {
    return <div>Loading</div>
  }
  return paragraphs.map(renderParagraph)
}
