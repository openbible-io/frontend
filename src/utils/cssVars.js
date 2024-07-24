// TODO: use custom loader on ../app.css
export const cssVars = [
  '--primary-text-color',
  '--primary-theme-color',
  '--primary-font-family',
]

export const cssValues = []

export function loadLocalCSSVars() {
  const rootElement = document.documentElement
  const docStyles = getComputedStyle(rootElement)
  cssVars.forEach(cssVar => {
    cssValues.push(docStyles.getPropertyValue(cssVar).trim())
    rootElement.style.setProperty(cssVar, localStorage.getItem(`css-${cssVar}`))
  })
}

export function saveLocalCSSVar(cssVar, value) {
  localStorage.setItem(`css-${cssVar}`, value)
}