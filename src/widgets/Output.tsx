import React from 'react'
import { connect } from 'react-redux'
import { State } from '../store'
import clipboard from 'clipboard-polyfill'
import '../styles/global.css'

interface Props {
    H: number,
    S: number,
    L: number
}

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
        let matched = got.match(/rgb\(([0-9]+), ?([0-9]+), ?([0-9]+)\)/)
        if (matched == null) {
            return got
        } else {
            matched.shift()
            let RGB = matched.map(x => parseInt(x))
            return '#' + RGB.map(x => pad(x.toString(16), 2)).join('')
        }
    })()
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
                <input className="output-value" readOnly={true} value={hsl} />
                <button className="output-copy" onClick={copy_hsl}>
                    Copy
                </button>
            </div>
            <div className="output output-rgb">
                <span className="output-label">RGB:</span>
                <input className="output-value" readOnly={true} value={rgb} />
                <button className="output-copy" onClick={copy_rgb}>
                    Copy
                </button>
            </div>
        </div>
    )
}

function state2props (state: State): Props {
    let { H, S, L } = state
    return { H, S, L }
}

export default connect(state2props, (_:any):Partial<Props>=>({}))(Output)
