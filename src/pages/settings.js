import { h, Fragment, Component } from 'preact'
import { Nav, Reader, Button, Dropdown } from '../components'
import styles from './settings.css'
import { cssVars, saveLocalCSSVar } from '../utils/cssVars'
import readerStyles from '../components/reader/reader.css'

export class Settings extends Component {
  componentWillMount() {
    const docStyles = getComputedStyle(document.body)
    const globalCSSVars = cssVars
      .reduce((acc, cur) => {
        acc[cur] = docStyles.getPropertyValue(cur).trim()
        return acc
      }, {})

    this.setState(globalCSSVars)
  }

  onInput(cssVar, ev) {
    document.body.style.setProperty(cssVar, ev.target.value)
    this.state.cssVar = ev.target.value
    saveLocalCSSVar(cssVar, this.state.cssVar)
  }

  onSubmit() {
    // TODO: web service
  }

  render() {
    return (
      <Fragment>
        <Nav />
        <main>
          <form style={{ flex: 1 }} onSubmit={this.onSubmit}>
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
            <input type="submit">Save settings</input>
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