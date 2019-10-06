import React, { useEffect } from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import store, { New, Actions } from './store'
import HueRing from './widgets/HueRing'
import SlicePlane from './widgets/SlicePlane'
import './styles/global.css'

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
        </Provider>
    )
}

ReactDOM.render(<ColorPicker/>, document.querySelector('#react-root'))
