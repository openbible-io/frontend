import { h, Fragment, Component } from 'preact'
import { Nav, Reader, Button, Dropdown } from '../components'
import styles from './settings.css'
import { cssVars, cssValues, saveLocalCSSVar } from '../utils/cssVars'
import readerStyles from '../components/reader/reader.css'

export class Settings extends Component {
  componentWillMount() {
    const docStyles = getComputedStyle(document.documentElement)
    const globalCSSVars = cssVars
      .reduce((acc, cur) => {
        acc[cur] = docStyles.getPropertyValue(cur).trim()
        return acc
      }, {})

    this.setState(globalCSSVars)
  }

  onInput(cssVar, ev) {
    document.documentElement.style.setProperty(cssVar, ev.target.value)
    this.state.cssVar = ev.target.value
    saveLocalCSSVar(cssVar, this.state.cssVar)
  }

  onSubmit = ev => {
    ev.preventDefault()
    // TODO: web service
    console.log('save settings', this.state)
  }

  onReset = ev => {
    ev.preventDefault()
    const newState = {}
    for (let i = 0; i < cssVars.length; i++) {
      newState[cssVars[i]] = cssValues[i]
      document.documentElement.style.setProperty(cssVars[i], cssValues[i])
      saveLocalCSSVar(cssVars[i], cssValues[i])
    }
    this.setState(newState)
  }

  render() {
    return (
      <Fragment>
        <Nav />
        <main>
          <form style={{ flex: 1 }} onSubmit={this.onSubmit} onReset={this.onReset}>
            {Object.entries(this.state)
              .map(entry => (
                <p key={entry[0]}>
                  <label>{entry[0]}</label>
                  <input
                    type={entry[0].includes('color') ? 'color' : ''}
                    value={entry[1]}
                    onInput={e => this.onInput(entry[0], e)}
                    />
                </p>
            ))}
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
            <Reader book="GEN" chapter={1} />
          </div>
        </main>
      </Fragment>
    )
  }
}