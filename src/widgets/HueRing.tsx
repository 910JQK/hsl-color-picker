import React, { useRef, useEffect } from 'react'
import { Dispatch } from 'redux'
import { connect } from 'react-redux'
import { State, New, Action, Actions } from '../store'
import { deg2rad, range } from '../utils'

interface PropsFromState {
    // TODO
}

interface PropsFromDispatch {
    // TODO
}

interface Props extends PropsFromState, PropsFromDispatch {}


function HueRing (props: Props): JSX.Element {
    const SIZE = 600
    const CENTER = SIZE/2
    const OUTER = SIZE/2.5
    const INNER = SIZE/2.5/1.618
    let canvas = useRef<HTMLCanvasElement>(null)
    useEffect(() => {
        let ctx = canvas.current!.getContext('2d')!
        for (let theta of range(0, 360)) {
            ctx.beginPath()
            ctx.arc (
                CENTER, CENTER, OUTER,
                deg2rad(-theta + 0.5), deg2rad(-theta - 0.5), true
            )
            ctx.arc (
                CENTER, CENTER, INNER,
                deg2rad(-theta - 0.5), deg2rad(-theta + 0.5)
            )
            ctx.lineWidth = 1.0
            ctx.fillStyle = ctx.strokeStyle = `hsl(${theta}, 100%, 50%)`
            ctx.fill(); ctx.stroke()
        }
        for (let r of [OUTER, INNER]) {
            ctx.beginPath()
            ctx.arc(CENTER, CENTER, r, 0, 360)
            ctx.lineWidth = 3.0
            ctx.strokeStyle = `hsl(0, 0%, 94%)`
            ctx.stroke()
        }
    })
    return (
        <canvas className="hue_ring" ref={canvas}
                height={SIZE} width={SIZE}
                style={{height:'300px',width:'300px'}} />    
    )
}

function state2props (state: State): PropsFromState {
    return {}
}

function dispatch2props (dispatch: Dispatch<Action>): PropsFromDispatch {
    New
    Actions
    return {}
}

export default connect(state2props, dispatch2props)(HueRing)