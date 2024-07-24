import { h, Fragment, Component } from 'preact'
import { Nav, Reader, Button, Dropdown } from '../components'
import styles from './settings.css'
import { cssVars, setLocalCSSVar } from '../utils/cssVars'
import { getLocalSetting, setLocalSetting } from '../utils/settings'
import readerStyles from '../components/reader/reader.css'

export class Settings extends Component {
  componentWillMount() {
    const docStyles = getComputedStyle(document.body)
    const docCSSVars = cssVars
      .reduce((acc, cur) => {
        acc[cur] = docStyles.getPropertyValue(cur).trim()
        return acc
      }, {})

    this.setState({
      cssVars: docCSSVars,
      selectVerseNums: getLocalSetting('selectVerseNums') || 'noSelect'
    })
  }

  setCSSVar = (cssVar, cssValue) => {
    document.body.style.setProperty(cssVar, cssValue)
    this.state.cssVars[cssVar] = cssValue
    setLocalCSSVar(cssVar, cssValue)
  }

  onCSSVarInput(cssVar, ev) {
    this.setCSSVar(cssVar, ev.target.value)
  }

  onSubmit = ev => {
    ev.preventDefault()
    // TODO: web service
    console.log('save settings', this.state)
  }

  onReset = ev => {
    ev.preventDefault()
    cssVars.forEach(cssVar => {
      const cssVal = getComputedStyle(document.documentElement)
        .getPropertyValue(cssVar)
        .trim()
      this.setCSSVar(cssVar, cssVal)
    })
    this.setState(this.state)
  }

  onSettingInput = (key, val) => {
    setLocalSetting(key, val)
    this.setState({ [key]: val })
  }

  render() {
    return (
      <Fragment>
        <Nav />
        <main>
          <form class={styles.form} onSubmit={this.onSubmit} onReset={this.onReset}>
            <h2>CSS Variables</h2>
            {Object.entries(this.state.cssVars)
              .map(entry => (
                <p key={entry[0]}>
                  <label>{entry[0]}</label>
                  <input
                    type={entry[0].includes('color') ? 'color' : ''}
                    value={entry[1]}
                    onInput={e => this.onCSSVarInput(entry[0], e)}
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
                value={this.state.selectVerseNums}
                onChange={ev => this.onSettingInput('selectVerseNums', ev.target.value)}
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
            <Button>Test button</Button>
            <Dropdown>
              <div>Item 1</div>
              <div>Item 2</div>
              <div>Item 3</div>
            </Dropdown>
            <Reader book="PSA" chapter={119} />
          </div>
        </main>
      </Fragment>
    )
  }
}