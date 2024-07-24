import { h, Fragment } from 'preact'
// import { onDoubleClickVerseNumber } from '../../utils'
import styles from './renderer.css'

function onDoubleClickVerseNumber(ev) {
  ev.preventDefault()
  console.log('hey', ev)
}

let lastTag
const quoteRegex = /['"“‘]/

function getClass(child) {
  if (child.t === 'q' && child.v[0].t === 'v') {
    return styles.qcol
  }

  return styles[child.t]
}

function renderTag(tag) {
  let prependSpace = tag.t === 'w' || tag.t === 'v' && tag.n > 1
  if (lastTag && (lastTag.n || quoteRegex.test(lastTag.v))) {
    prependSpace = false
  }
  lastTag = tag
  return (
    <Fragment>
      {prependSpace && <span> </span>}
      {tag.n &&
        <sup class={styles.sup}>{tag.n}</sup>
      }
      {tag.v && 
        <span class={getClass(tag)}>{tag.v}</span>
      }
    </Fragment>
  )
}

function renderChild(child) {
  return (
    <Fragment>
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
