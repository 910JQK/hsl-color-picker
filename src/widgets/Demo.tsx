import React from 'react'
import { connect } from 'react-redux'
import { State } from '../store'
import '../styles/global.css'

interface Props {
    color: string
}

function Demo (props: Props): JSX.Element {
    let demo = props.color
    let text = 'Lorem ipsum'
    return (
        <div className="demo-widget">
            <div className="demo demo-bg demo-bg-dark"
                    style={{background: demo}}>{ text }</div>
            <div className="demo demo-text demo-text-dark"
                    style={{color: demo}}>{ text }</div>
            <div className="demo demo-pure"
                    style={{background:demo}}></div>
            <div className="demo demo-text demo-text-light"
                    style={{color: demo}}>{ text }</div>
            <div className="demo demo-bg demo-bg-light"
                    style={{background:demo}}>{ text }</div>
        </div>
    )
}

function state2props (state: State): Props {
    let { H, S, L } = state
    H = Math.floor(H)
    S = Math.floor(S)
    L = Math.floor(L)
    return {
        color: `hsl(${H}, ${S}%, ${L}%)`
    }
}

export default connect(state2props, (_:any):Partial<Props>=>({}))(Demo)