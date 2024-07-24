import { h, Fragment } from 'preact'

export const renderChildren = children => {
  if (!children) {
    return // TODO: Loading state
  }
  return children.map(child => {
    return (
      <Fragment>
        {child.n && <strong>{child.n} </strong>}
        {Array.isArray(child.v)
          ? <p>{renderChildren(child.v)}</p>
          : child.v + ' '}
      </Fragment>
    )
  })
}
