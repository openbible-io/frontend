import { h, Fragment } from 'preact'
import styles from './renderer.css'

let lastTag

function renderTag(tag) {
  let prependSpace = false
  if (tag.t === 'w' && /\w+/.test(tag.v) && !tag.n && !(lastTag && lastTag.n)) {
    prependSpace = true
  }
  lastTag = tag
  return `${prependSpace ? ' ' : ''}${tag.v || ''}`
}

export function renderChildren(children) {
  if (!children) {
    return // TODO: Loading state
  }
  return children.map(child => (
    <Fragment>
      {child.n &&
        <sup class={styles.sup}>{child.n}</sup>
      }
      {Array.isArray(child.v)
        ? <p>{renderChildren(child.v)}</p>
        : renderTag(child)}
    </Fragment>
  ))
}
