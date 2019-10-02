import React from 'react'
import ReactDOM from 'react-dom'

function Hello () {
    return <h2>Hello World</h2>
}

ReactDOM.render(<Hello/>, document.querySelector('#react-root'))
