import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import store from './store'
import Counter from './counter'
import HueRing from './widgets/HueRing'

function Hello (): JSX.Element {
    return (
        <Provider store={store} >
            <h2>Hello World</h2>
            <HueRing value={30} />
            <Counter/>
        </Provider>
    )
}

ReactDOM.render(<Hello/>, document.querySelector('#react-root'))
