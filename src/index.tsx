import React, { useEffect } from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import store, { New, Actions } from './store'
import HueRing from './widgets/HueRing'
import SlicePlane from './widgets/SlicePlane'
import Demo from './widgets/Demo'
import Output from './widgets/Output'
import './styles/global.css'

function check_firefox (): void {
    if (navigator.userAgent.indexOf('Firefox') != -1) {
        alert (
            `It seems that you are using Firefox.
            Unfortunately, Firefox has a bug on HTML5 <canvas> element
            which makes this color picker program cause memory leak.
            For details, see
            https://bugzilla.mozilla.org/show_bug.cgi?id=1586495.`
            .replace(/[ \t\n]{2,}/g, ' ')
        )
    }
}
check_firefox()

function ColorPicker (): JSX.Element {
    let on_mouse_up = () => {
        store.dispatch(New<Actions.MouseUp>({
            type: Actions.MOUSE_UP
        }))
    }
    useEffect(() => {
        document.addEventListener('mouseup', on_mouse_up)
        return () => { document.removeEventListener('mouseup', on_mouse_up) }
    })
    return (
        <Provider store={store} >
            <h1 className="title">HSL Color Picker</h1>
            <div className="widgets-wrapper">
                <HueRing />
                <SlicePlane />
            </div>
            <Demo />
            <Output />
        </Provider>
    )
}

ReactDOM.render(<ColorPicker/>, document.querySelector('#react-root'))
