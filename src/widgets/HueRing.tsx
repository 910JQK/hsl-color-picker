import React, { useRef, useEffect } from 'react'
import { Dispatch } from 'redux'
import { connect } from 'react-redux'
import { State, New, Action, Actions } from '../store'
import {
    Vector, Triangle,
    range, deg2rad, polar,
    vector_sum, vector_diff, incline_angle, norm,
    in_triangle, get_event_point
} from '../utils'

const SIZE = 600
const CENTER = SIZE / 2
const OUTER = SIZE / 2.5
const INNER = SIZE / 2.5 / 1.618
const CURSOR = (OUTER - INNER) / 1.618

interface PropsFromState {
    H: number
}

interface PropsFromDispatch {
    mouse_down_on_ring: (angle: number) => void,
    mouse_down_on_cursor: (angle: number, cursor_angle: number) => void,
    mouse_move: (angle: number) => void
}

interface Props extends PropsFromState, PropsFromDispatch {}


function HueRing (props: Props): JSX.Element {
    let canvas = useRef<HTMLCanvasElement>(null)
    let center: Vector = [CENTER, CENTER]
    let val = props.H
    let cursor_contact = vector_sum(center, polar(OUTER, -val))
    let a = vector_sum(cursor_contact, polar(CURSOR, -val+30))
    let b = vector_sum(cursor_contact, polar(CURSOR, -val-30))
    let cursor: Triangle = [cursor_contact, a, b]
    useEffect(() => {
        let ctx = canvas.current!.getContext('2d')!
        ctx.clearRect(0, 0, SIZE, SIZE)
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
        /*
        ctx.beginPath()
        ctx.moveTo(...vector_sum(center, polar(INNER, -val)))
        ctx.lineTo(...vector_sum(center, polar(OUTER, -val)))
        ctx.lineWidth = 6.0
        ctx.strokeStyle = 'hsla(0, 0%, 95%, 0.5)'
        ctx.stroke()
        */
        ctx.beginPath()
        ctx.moveTo(...cursor_contact)
        ctx.lineTo(...a)
        ctx.lineTo(...b)
        ctx.fillStyle = 'hsl(0, 0%, 75%)'
        ctx.fill()
    })
    let mouse_down_handler = (ev: React.MouseEvent) => {
        let size = canvas.current!.offsetWidth
        let ratio = size / SIZE
        let p = get_event_point(ev, ratio)
        let on_cursor = in_triangle(cursor, p)
        let rv = vector_diff(p, center)
        let angle = incline_angle(rv)
        let r = norm(rv)
        let on_ring = (INNER <= r && r <= OUTER)
        if (on_cursor) {
            props.mouse_down_on_cursor(angle, -val)
        } else if (on_ring) {
            props.mouse_down_on_ring(angle)
        }
    }
    let mouse_move_handler = (ev: React.MouseEvent) => {
        let size = canvas.current!.offsetWidth
        let ratio = size / SIZE
        let p = get_event_point(ev, ratio)
        let rv = vector_diff(p, center)
        props.mouse_move(incline_angle(rv))
    }
    return (
        <canvas className="hue_ring" ref={canvas}
                height={SIZE} width={SIZE}
                onMouseDown={mouse_down_handler}
                onMouseMove={mouse_move_handler}
                style={{height:'300px',width:'300px'}}>
        </canvas>
    )
}

function state2props (state: State): PropsFromState {
    return { H: state.H }
}

function dispatch2props (dispatch: Dispatch<Action>): PropsFromDispatch {
    return {
        mouse_down_on_ring (angle: number): void {
            dispatch(New<Actions.H_MouseDown>({
                type: Actions.H_MOUSE_DOWN,
                angle,
                on_cursor: false
            }))
        },
        mouse_down_on_cursor (angle: number, cursor_angle: number): void {
            dispatch(New<Actions.H_MouseDown>({
                type: Actions.H_MOUSE_DOWN,
                angle,
                on_cursor:true,
                cursor_angle
            }))
        },
        mouse_move (angle: number): void {
            dispatch(New<Actions.H_MouseMove>({
                type: Actions.H_MOUSE_MOVE,
                angle
            }))
        }
    }
}

export default connect(state2props, dispatch2props)(HueRing)