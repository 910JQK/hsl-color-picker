import React, { useRef, useEffect } from 'react'
import { Dispatch } from 'redux'
import { connect } from 'react-redux'
import { State, New, Action, Actions } from '../store'
import { polar, vector_sum, deg2rad, range, in_triangle } from '../utils'

const SIZE = 600
const CENTER = SIZE / 2
const OUTER = SIZE / 2.5
const INNER = SIZE / 2.5 / 1.618
const CURSOR = (OUTER - INNER) / 1.618

interface PropsFromState {
    // TODO
}

interface PropsFromDispatch {
    // TODO
}

interface Props extends PropsFromState, PropsFromDispatch {
    value: number
}


function HueRing (props: Props): JSX.Element {
    let canvas = useRef<HTMLCanvasElement>(null)
    let center: [number, number] = [CENTER, CENTER]
    let val = props.value
    let cursor_point = vector_sum(center, polar(OUTER, -val))
    let a = vector_sum(cursor_point, polar(CURSOR, -val+30))
    let b = vector_sum(cursor_point, polar(CURSOR, -val-30))
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
        ctx.beginPath()
        ctx.moveTo(...vector_sum(center, polar(INNER, -val)))
        ctx.lineTo(...vector_sum(center, polar(OUTER, -val)))
        ctx.lineWidth = 6.0
        ctx.strokeStyle = `hsla(0, 0%, 95%, 0.5)`
        ctx.stroke()
        ctx.beginPath()
        ctx.moveTo(...cursor_point)
        ctx.lineTo(...a)
        ctx.lineTo(...b)
        ctx.fillStyle = 'hsl(0, 0%, 75%)'
        ctx.fill()
    })
    let click = (ev: React.MouseEvent) => {
        let element = canvas.current!
        let x = ev.pageX - element.offsetLeft
        let y = ev.pageY - element.offsetTop
        let size = element.offsetWidth
        let ratio = size / SIZE
        let X = x / ratio
        let Y = y / ratio
        console.log(in_triangle([cursor_point, a, b], [X, Y]))
    }
    return (
        <canvas className="hue_ring" ref={canvas}
                height={SIZE} width={SIZE}
                onMouseDown={click}
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