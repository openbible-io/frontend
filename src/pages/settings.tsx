import { h, Fragment } from 'preact'
import { useEffect, useState } from 'preact/hooks'
import { Nav, Reader } from '../components'
import { useLocalStorage, cssVars } from '../utils'
import styles from './settings.css'
import readerStyles from '../components/reader/reader.css'

export interface SettingsType {
  selectVerseNums: string
}

export const defaultSettings = {
  selectVerseNums: 'noSelect'
} as SettingsType

export function Settings(_props: { path: String }) {
  const [cssValues, setCSSValues] = useState({} as { [key: string]: string });
  const [config, setConfig] = useLocalStorage('settings', defaultSettings);

  useEffect(() => {
    const docStyles = getComputedStyle(document.body)
    const docCSSVars = cssVars
      .reduce((acc, cur) => {
        acc[cur] = docStyles.getPropertyValue(cur).trim()
        return acc
      }, {} as { [key: string]: string })
      setCSSValues(docCSSVars)
  }, []);

  const onSetCSSVar = (cssVar: string, cssValue: string) => {
    document.body.style.setProperty(cssVar, cssValue)
    cssValues[cssVar] = cssValue
    setCSSValues({ ...cssValues })
  }

  const onSettingInput = (key: string, val: string) => {
    config[key as keyof typeof defaultSettings] = val
    setConfig({ ...config })
  }

  const onReset = (ev: h.JSX.TargetedEvent<HTMLFormElement, Event>) => {
    ev.preventDefault()
    cssVars.forEach(cssVar => {
      const cssVal = getComputedStyle(document.documentElement)
        .getPropertyValue(cssVar)
        .trim()
      onSetCSSVar(cssVar, cssVal)
    })
    setConfig({ ...defaultSettings })
  }

  const onSubmit = (ev: h.JSX.TargetedEvent<HTMLFormElement, Event>) => {
    ev.preventDefault()
    // TODO: web service
    console.log('save settings')
  }

  return (
    <Fragment>
      <Nav />
      <main>
        <form class={styles.form} onSubmit={onSubmit} onReset={onReset}>
          <h2>CSS Variables</h2>
          {Object.entries(cssValues)
            .map(entry => (
              <p key={entry[0]}>
                <label>{entry[0]}</label>
                <input
                  type={entry[0].includes('color') ? 'color' : ''}
                  value={entry[1]}
                  onInput={(ev: any) => onSetCSSVar(entry[0], ev.target.value)}
                  />
              </p>
          ))}
          <h2>Copy behavior</h2>
          <p>
            <label>Snap selection to words</label>
            TODO: code no snapping but still snapping for highlighting
          </p>
          <p>
            <label>Verse number selection</label>
            <select
              value={config.selectVerseNums}
              onChange={(ev: any) => onSettingInput('selectVerseNums', ev.target.value)}
            >
              <option value="noSelect">Don't select</option>
              <option value="addSpace">Add space</option>
              <option value="default">Browser default</option>
            </select>
          </p>
          <input type="reset" value="Reset settings" />
          <input type="submit" value="Save settings" />
        </form>
        <div class={`${readerStyles.reader} ${styles.testDiv}`}>
          <Reader text="en_ult" book="PSA" chapter={119} />
        </div>
      </main>
    </Fragment>
  )
}
