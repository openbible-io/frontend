// TODO: use custom loader on ../app.css
export const cssVars = [
  '--primary-text-color',
  '--primary-text-indent',
  '--primary-theme-color',
  '--primary-font-family',
]

export function loadLocalCSSVars() {
  const rootElement = document.body
  cssVars.forEach(cssVar => {
    rootElement.style.setProperty(cssVar, localStorage.getItem(`css-${cssVar}`))
  })
}

export function setLocalCSSVar(cssVar, value) {
  localStorage.setItem(`css-${cssVar}`, value)
}