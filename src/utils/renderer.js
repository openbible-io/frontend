import { h, Fragment } from 'preact'
import styles from './renderer.css'

let lastTag
const quoteRegex = /['"“‘]/

function getClass(child) {
  if (child.t === 'q' && child.v[0].t === 'v') {
    return styles.qcol
  }

  return styles[child.t]
}

function renderTag(tag) {
  let prependSpace = tag.t === 'w'
  if (lastTag && (lastTag.n || quoteRegex.test(lastTag.v))) {
    prependSpace = false
  }
  lastTag = tag
  return (
    <span class={getClass(tag)}>
      {prependSpace ? ' ' : ''}{tag.v || ''}
    </span>
  )
}

function renderChild(child) {
  return (
    <Fragment>
      {child.n &&
        <sup class={styles.sup}>{child.n}</sup>
      }
      {Array.isArray(child.v)
        ? <p class={getClass(child)}>{renderChildren(child.v)}</p>
        : renderTag(child)}
    </Fragment>
  )
}

export function renderChildren(children) {
  if (!children) {
    return // TODO: Loading state
  }
  return children.map(renderChild)
}
