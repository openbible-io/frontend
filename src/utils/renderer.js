import { h, Fragment } from 'preact'

const renderTag = tag => {
  return `${tag.t === 'w' ? ' ' : ''}${tag.v || ''}`
}

export const renderChildren = children => {
  if (!children) {
    return // TODO: Loading state
  }
  return children.map(child => {
    return (
      <Fragment>
        {child.n && (
          <b> {child.n} </b>
        )}
        {Array.isArray(child.v)
          ? <p>{renderChildren(child.v)}</p>
          : renderTag(child)}
      </Fragment>
    )
  })
}
