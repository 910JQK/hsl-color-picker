import React, { useRef, useEffect } from 'react'
import { Dispatch } from 'redux'
import { connect } from 'react-redux'
import { State, New, Action, Actions } from '../store'
import {
    Vector, Triangle,
    range, linspace, deg2rad, polar,
    vector_sum, vector_diff, incline_angle, norm,
    in_triangle, get_event_point
} from '../utils'
import '../styles/global.css'

const SIZE = 600
const CENTER = SIZE / 2
const OUTER = SIZE / 2.5
const INNER = SIZE / 2.5 / 1.618
const CURSOR = (OUTER - INNER) / 1.618
const SCALE = CURSOR * (1.732 / 2)
const SCALE_R = INNER * 0.8
const SCALE_FONT = `${Math.floor(SCALE)/2.4}px sans-serif`
const SCALE_FONT_HIGHLIGHT = `${Math.floor(SCALE)/2.2}px sans-serif`

interface PropsFromState {
    H: number
}

interface PropsFromDispatch {
    mouse_down_on_ring: (angle: number) => void,
    mouse_down_on_cursor: (angle: number, cursor_angle: number) => void,
    mouse_move: (angle: number) => void,
    increase: () => void,
    decrease: () => void
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
        for (let theta of linspace(0, 360, 30)) {
            let p = vector_sum(center, polar(SCALE_R, -theta))
            let dd = (val - theta + 360) % 360
            let d = Math.min(dd, 360-dd)
            let highlight = d < 15 || (d == 15 && val > theta)
            let baseline: CanvasTextBaseline = (
                theta == 0? 'middle':
                0 < theta && theta < 180? 'top':
                theta == 180? 'middle': 'bottom'
            )
            ctx.font = highlight? SCALE_FONT_HIGHLIGHT: SCALE_FONT
            ctx.textAlign = 'center'
            ctx.textBaseline = baseline
            ctx.fillStyle = highlight? 'red': 'hsl(0, 0%, 5%)'
            ctx.fillText(theta.toString(), ...p)
        }
        ctx.beginPath()
        ctx.moveTo(...cursor_contact)
        ctx.lineTo(...a)
        ctx.lineTo(...b)
        ctx.fillStyle = 'hsl(0, 0%, 75%)'
        ctx.fill()
    })
    useEffect(() => {
        let element = canvas.current!
        document.addEventListener('keydown', key_down_handler)
        document.addEventListener('mousemove', mouse_move_handler)
        element.addEventListener('mousedown', mouse_down_handler)
        return () => {
            document.removeEventListener('keydown', key_down_handler)
            document.removeEventListener('mousemove', mouse_move_handler)
            element.removeEventListener('mousedown', mouse_down_handler)
        }
    })
    let mouse_down_handler = (ev: MouseEvent) => {
        let element = canvas.current!
        if (ev.target !== element) { return }
        let size = element.offsetWidth
        let ratio = size / SIZE
        let p = get_event_point(ev, element, ratio)
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
    let mouse_move_handler = (ev: MouseEvent) => {
        let element = canvas.current!
        let size = canvas.current!.offsetWidth
        let ratio = size / SIZE
        let p = get_event_point(ev, element, ratio)
        let rv = vector_diff(p, center)
        props.mouse_move(incline_angle(rv))
    }
    let key_down_handler = (ev: KeyboardEvent) => {
        if (ev.key == '=') {
            props.increase()
        } else if (ev.key == '-') {
            props.decrease()
        }
    }
    return (
        <div className="hue-ring-widget">
            <canvas className="hue-ring" ref={canvas}
                    height={SIZE} width={SIZE}>
            </canvas>
            <div className="value-display">
                H = {Math.floor(props.H)}
            </div>
            <div className="hotkey-tip">
                [-] H-- | [=] H++
            </div>
        </div>
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
        },
        increase (): void {
            dispatch(New<Actions.H_Adjust>({
                type: Actions.H_ADJUST,
                is_increment: true
            }))
        },
        decrease (): void {
            dispatch(New<Actions.H_Adjust>({
                type: Actions.H_ADJUST,
                is_increment: false
            }))
        }
    }
}

export default connect(state2props, dispatch2props)(HueRing)