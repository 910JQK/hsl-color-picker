import React from 'react'
import { Dispatch } from 'redux'
import { connect } from 'react-redux'
import { State, New, Action, Actions } from '../store'
import clipboard from 'clipboard-polyfill'
import { rgb2hsl, rgb_from_hex } from '../utils'
import '../styles/global.css'

interface PropsFromState {
    H: number,
    S: number,
    L: number
}

interface PropsFromDispatch {
    commit (hsl: [number, number, number]): void
}

interface Props extends PropsFromState, PropsFromDispatch {}


let dummy = document.createElement('div')

function Output (props: Props): JSX.Element {
    function pad (s: string, l: number) {
        let needed = l - s.length
        for (let i = 0; i < needed; i++) {
            s = '0' + s
        }
        return s
    }
    let H = Math.floor(props.H)
    let S = Math.floor(props.S)
    let L = Math.floor(props.L)
    let hsl = `hsl(${H}, ${S}%, ${L}%)`
    let rgb = (() => {
        dummy.style.color = hsl
        let got = dummy.style.color
        let matched = got.match(/rgb\(([0-9]+), *([0-9]+), *([0-9]+)\)/)
        if (matched == null) {
            return got
        } else {
            matched.shift()
            let RGB = matched.map(x => parseInt(x))
            return '#' + RGB.map(x => pad(x.toString(16), 2)).join('')
        }
    })()
    let input_hsl = (default_: string = hsl): void => {
        let input = prompt("Input a HSL color value", default_)
        if (input === null) { return }  // cancelled
        let matched = input.trim().match (
            /^hsl\(([0-9]+), *([0-9]+)%, *([0-9]+)%\)$/
        )
        if (matched === null) {
            alert('Invalid Color')
            return input_hsl(input)
        }
        matched.shift()
        let [H, S, L] = matched.map(x => parseInt(x))
        let valid = (
            (0 <= H && H < 360)
            && (0 <= S && S <= 100)
            && (0 <= L && L <= 100)
        )
        if (!valid) {
            alert('Invalid Color')
            return input_hsl(input)
        }
        props.commit([H, S, L])
    }
    let input_rgb = (default_: string = rgb): void => {
        const NOTE = 'the conversion from RGB to HSL is not very accurate'
        let input = prompt (
            `Input a RGB (Hex) color value (note: ${NOTE})`,
            default_
        )
        if (input === null) { return }  // cancelled
        let matched = input.trim().match (
            /^#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})$/
        )
        if (matched === null) {
            alert('Invalid Color')
            return input_rgb(input)
        }
        props.commit(rgb2hsl(rgb_from_hex(matched[1])))
    }
    let copy_hsl = () => {
        clipboard.writeText(hsl)
    }
    let copy_rgb = () => {
        clipboard.writeText(rgb)
    }
    return (
        <div className="output-widget">
            <div className="output output-hsl">
                <span className="output-label">HSL:</span>
                <input className="output-value"
                        onClick={() => input_hsl()}
                        readOnly={true}
                        value={hsl} />
                <button className="output-copy"
                        onClick={copy_hsl}>
                    Copy
                </button>
            </div>
            <div className="output output-rgb">
                <span className="output-label">RGB:</span>
                <input className="output-value"
                        onClick={() => input_rgb()}
                        readOnly={true}
                        value={rgb} />
                <button className="output-copy"
                        onClick={copy_rgb}>
                    Copy
                </button>
            </div>
        </div>
    )
}

function state2props (state: State): PropsFromState {
    let { H, S, L } = state
    return { H, S, L }
}

function dispatch2props (dispatch: Dispatch<Action>): PropsFromDispatch {
    return {
        commit (hsl: [number, number, number]): void {
            dispatch(New<Actions.HSL_Commit>({
                type: Actions.HSL_COMMIT,
                H: hsl[0],
                S: hsl[1],
                L: hsl[2]
            }))
        }
    }
}

export default connect(state2props, dispatch2props)(Output)
