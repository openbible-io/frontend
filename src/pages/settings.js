import { h, Fragment, Component } from 'preact'
import { Nav, Reader, Button, Dropdown } from '../components'
import styles from './settings.css'
import { cssVars, saveLocalCSSVar } from '../utils/cssVars'
import readerStyles from '../components/reader/reader.css'

export class Settings extends Component {
  componentWillMount() {
    const docStyles = getComputedStyle(document.body)
    const docCSSVars = cssVars
      .reduce((acc, cur) => {
        acc[cur] = docStyles.getPropertyValue(cur).trim()
        return acc
      }, {})

    this.setState({ cssVars: docCSSVars })
  }

  setCSSVar = (cssVar, cssValue) => {
    document.body.style.setProperty(cssVar, cssValue)
    this.state.cssVars[cssVar] = cssValue
    saveLocalCSSVar(cssVar, cssValue)
  }

  onInput(cssVar, ev) {
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

  render() {
    return (
      <Fragment>
        <Nav />
        <main>
          <form class={styles.form} onSubmit={this.onSubmit} onReset={this.onReset}>
            {Object.entries(this.state.cssVars)
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
            <Reader book="PSA" chapter={119} />
          </div>
        </main>
      </Fragment>
    )
  }
}