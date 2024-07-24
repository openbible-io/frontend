import { h, Fragment } from 'preact'
import { onDoubleClickVerseNumber } from '../../reader/util/select'
import styles from './renderer.css'

let lastTag
const startPunct = /['"“‘\[\(]/

function getClass(child) {
  if (child.t === 'q' && child.v[0].t === 'v') {
    return styles.qcol
  }

  return styles[child.t]
}

function renderTag(tag) {
  let prependSpace = tag.t === 'w'
  if (lastTag && (lastTag.n || startPunct.test(lastTag.v))) {
    prependSpace = false
  }
  lastTag = tag
  return (
    <Fragment>
      {prependSpace &&
        <span> </span>
      }
      {tag.n &&
        <sup
          class={styles.sup}
          onDblClick={onDoubleClickVerseNumber}
        >
          {tag.n}
        </sup>
      }
      {tag.v && 
        <span
          data-id={tag.id}
          class={getClass(tag)}
        >
          {tag.v}
        </span>
      }
    </Fragment>
  )
}

function renderChild(child) {
  return (
    <Fragment>
      {Array.isArray(child.v)
        ? <p data-id={child.id} class={getClass(child)}>
            {renderChildren(child.v)}
          </p>
        : renderTag(child)}
    </Fragment>
  )
}

export function renderChildren(children, text) {
  if (!children) {
    return // TODO: Loading state
  }
  return children.map(renderChild)
}
