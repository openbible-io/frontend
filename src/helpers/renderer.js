import { h, Fragment } from 'preact'
import { constants } from 'usfm2json'

const getHTMLTag = tag => {
  switch(tag) {
    case 'p':
      return 'p'
    case 'v':
      return ''
    default:
      return null
  }
}

export const renderChildren = children => {
  return children.map(child => {
    if (constants.tagTypes.paragraph.indexOf(child.tag) !== -1) {
      return <p>{renderChildren(child.children)}</p>
    }
    else if (child.tag === 'v') {
      return <Fragment><strong>{child.num}</strong> {child.text} </Fragment>
    }
  })
}