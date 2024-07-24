import { h, Fragment } from 'preact'
import { ParagraphType, VerseType } from '../../utils/books'
import { Paragraphs } from './paragraphs'
import { Verse } from './verse'
import styles from './paragraph.css'

function getClass(paragraph: ParagraphType) {
  if (paragraph.t === 'q' && paragraph.v[0].t === 'v') {
    return styles.qcol
  }

  return styles[paragraph.t]
}

interface ParagraphProps {
  paragraph: ParagraphType | VerseType;
}

export function Paragraph(props: ParagraphProps) {
  const paragraph = props.paragraph
  return (
    <Fragment>
      {Array.isArray(paragraph.v)
        ? <p data-id={paragraph.id} class={getClass(paragraph as ParagraphType)}>
            <Paragraphs paragraphs={paragraph.v} />
          </p>
        : <Verse verse={paragraph} />}
    </Fragment>
  )
}
