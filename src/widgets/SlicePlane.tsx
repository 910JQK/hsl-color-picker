import React, { useRef, useEffect } from 'react'
import { Dispatch } from 'redux'
import { connect } from 'react-redux'
import { State, New, Action, Actions } from '../store'
import {
    Vector, Rectangle, Triangle,
    range, polar, deg2rad,
    vector_diff, vector_sum,
    get_event_point,
    in_triangle, in_rectangle,
} from '../utils'
import '../styles/global.css'

const SIZE = 600
const CENTER = SIZE / 2
const R = SIZE / 2.5
const CURSOR = R * (1 - 0.618) * 0.618
const SCALE = CURSOR * (1.732 / 2)
const SCALE_FONT = `${Math.floor(SCALE)/2.4}px sans-serif`
const SCALE_FONT_HIGHLIGHT = `${Math.floor(SCALE)/2.1}px sans-serif`

const Transform = (v: Vector): Vector => [v[0], SIZE - v[1]]
const InverseTransform = Transform
const Gradients = (() => {
    let cached: Array<CanvasGradient> | null = null
    let cached_ctx: CanvasRenderingContext2D | null = null
    return (ctx: CanvasRenderingContext2D, start: Vector, end: Vector) => {
        if (cached !== null && ctx === cached_ctx!) { return cached }
        let gradients: Array<CanvasGradient> = []
        for (let H of range(0, 360)) {
            for (let S of range(0, 101)) {
                let g = ctx.createLinearGradient (
                    start[0], start[1],
                    end[0], end[1]
                )
                g.addColorStop(0.0, `hsl(${H}, ${S}%, 0%)`)
                g.addColorStop(0.5, `hsl(${H}, ${S}%, 50%)`)
                g.addColorStop(1.0, `hsl(${H}, ${S}%, 100%)`)
                gradients.push(g)
            }
        }
        cached = gradients
        cached_ctx = ctx
        return gradients
    }
})()

interface PropsFromState {
    H: number,
    S: number,
    L: number
}

interface PropsFromDispatch {
    mouse_down_on_plane: (p: Vector) => void,
    mouse_down_on_s_cursor: (p: Vector, current: number) => void,
    mouse_down_on_l_cursor: (p: Vector, current: number) => void,
    mouse_move: (p: Vector) => void,
    s_increase: () => void,
    s_decrease: () => void,
    l_increase: () => void,
    l_decrease: () => void
}

interface Props extends PropsFromState, PropsFromDispatch {}


let center: Vector = [CENTER, CENTER]
let origin = vector_diff(center, [R, R])
let topLeft = vector_sum(origin, [0, 2*R])
let topRight = vector_sum(topLeft, [2*R, 0])
let bottomRight = vector_sum(topRight, [0, -2*R])
let plane: Rectangle = [origin, topLeft, topRight, bottomRight]
let height = topLeft[1] - origin[1]
let width = bottomRight[0] - origin[0]

function SlicePlane (props: Props): JSX.Element {
    let canvas = useRef<HTMLCanvasElement>(null)
    let S_cursor_contact = vector_sum(center, [(props.S/100)*2*R - R, -R])
    let S_a = vector_sum(S_cursor_contact, polar(CURSOR, 270+30))
    let S_b = vector_sum(S_cursor_contact, polar(CURSOR, 270-30))
    let S_cursor: Triangle = [S_cursor_contact, S_a, S_b]
    let L_cursor_contact = vector_sum(center, [R, (props.L/100)*2*R - R])
    let L_a = vector_sum(L_cursor_contact, polar(CURSOR, 30))
    let L_b = vector_sum(L_cursor_contact, polar(CURSOR, -30))
    let L_cursor: Triangle = [L_cursor_contact, L_a, L_b]
    useEffect(() => {
        let ctx = canvas.current!.getContext('2d')!
        ctx.clearRect(0, 0, SIZE, SIZE)
        let H = Math.floor(props.H)
        for (let S of range(0, 101)) {
            let bar_width = width / 101
            let bar_span = [S*bar_width, (S+1)*bar_width]
            let start0: Vector = [bar_span[0], 0]
            let end0: Vector = [bar_span[1], height]
            let start = Transform(vector_sum(origin, start0))
            let end = Transform(vector_sum(origin, end0))
            let g_start = Transform(origin)
            let g_end = Transform(topLeft)
            let gradients = Gradients(ctx, g_start, g_end)
            ctx.beginPath()
            ctx.rect(start[0], start[1], end[0]-start[0], end[1]-start[1])
            ctx.fillStyle = ctx.strokeStyle = gradients[H*101 + S]
            ctx.fill(); ctx.stroke()
        }
        let b1 = Transform(origin)
        let b2 = Transform(topRight)
        ctx.beginPath()
        ctx.rect(b1[0], b1[1], b2[0]-b1[0], b2[1]-b1[1])
        ctx.lineWidth = 3.0
        ctx.strokeStyle = `hsl(0, 0%, 94%)`
        ctx.stroke()
        let sx = topLeft
        let sy = origin
        for (let n of range(0, 11)) {
            let label = (n*10).toString()
            let unit = 2*R / 10
            let sxn = vector_sum(sx, [n*unit, 0])
            let syn = vector_sum(sy, [0, n*unit])
            let x_highlight = n*10 <= props.S && props.S < (n+1)*10
            let y_highlight = n*10 <= props.L && props.L < (n+1)*10
            let x_color = x_highlight? 'red': 'hsl(0, 0%, 5%)'
            let y_color = y_highlight? 'red': 'hsl(0, 0%, 5%)'
            let x_font = x_highlight? SCALE_FONT_HIGHLIGHT: SCALE_FONT
            let y_font = y_highlight? SCALE_FONT_HIGHLIGHT: SCALE_FONT
            ctx.beginPath()
            ctx.moveTo(...Transform(sxn))
            ctx.lineTo(...Transform(vector_sum(sxn, [0, SCALE])))
            ctx.lineWidth = 1.0
            ctx.strokeStyle = x_color
            ctx.stroke()
            ctx.beginPath()
            ctx.moveTo(...Transform(syn))
            ctx.lineTo(...Transform(vector_sum(syn, [-SCALE, 0])))
            ctx.strokeStyle = y_color
            ctx.stroke()
            let tx = vector_sum(sxn, [unit/6, SCALE/2]) 
            let ty = vector_sum(syn, [-SCALE/2, unit/6])
            ctx.font = x_font
            ctx.textAlign = 'left'
            ctx.textBaseline = 'middle'
            ctx.fillStyle = x_color
            ctx.fillText(label, ...Transform(tx))
            ctx.font = y_font
            ctx.textAlign = 'center'
            ctx.textBaseline = 'bottom'
            ctx.fillStyle = y_color
            ctx.fillText(label, ...Transform(ty))
        }
        ctx.beginPath()
        ctx.moveTo(...Transform(S_cursor_contact))
        ctx.lineTo(...Transform(S_a))
        ctx.lineTo(...Transform(S_b))
        ctx.fillStyle = 'hsl(0, 0%, 75%)'
        ctx.fill()
        ctx.beginPath()
        ctx.moveTo(...Transform(L_cursor_contact))
        ctx.lineTo(...Transform(L_a))
        ctx.lineTo(...Transform(L_b))
        ctx.fillStyle = 'hsl(0, 0%, 75%)'
        ctx.fill()
        let point = Transform([S_cursor_contact[0], L_cursor_contact[1]])
        ctx.beginPath()
        ctx.arc(point[0], point[1], 12.0, 0, deg2rad(360))
        ctx.lineWidth = 2.0
        ctx.strokeStyle = 'hsl(0, 0%, 95%)'
        ctx.stroke()
        ctx.beginPath()
        ctx.arc(point[0], point[1], 14.0, 0, deg2rad(360))
        ctx.lineWidth = 2.0
        ctx.strokeStyle = 'hsl(0, 0%, 5%)'
        ctx.stroke()
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
    let get_adjusted_points = (ev: MouseEvent): [Vector, Vector] => {
        let element = canvas.current!
        let size = element.offsetWidth
        let ratio = size / SIZE
        let point = InverseTransform(get_event_point(ev, element, ratio))
        let rv = vector_diff(point, origin)
        let scaled_point: Vector = [rv[0]*100/(2*R), rv[1]*100/(2*R)]
        return [point, scaled_point]
    }
    let mouse_down_handler = (ev: MouseEvent): void => {
        if (ev.target !== canvas.current) { return }
        let [point, scaled_point] = get_adjusted_points(ev)
        if (in_rectangle(plane, point)) {
            props.mouse_down_on_plane(scaled_point)
        } else if (in_triangle(S_cursor, point)) {
            props.mouse_down_on_s_cursor(scaled_point, props.S)
        } else if (in_triangle(L_cursor, point)) {
            props.mouse_down_on_l_cursor(scaled_point, props.L)
        } else {
            // do nothing, swallow the event
        }
    }
    let mouse_move_handler = (ev: MouseEvent): void => {
        let [_, scaled_point] = get_adjusted_points(ev); _
        props.mouse_move(scaled_point)
    }
    let key_down_handler = (ev: KeyboardEvent): void => {
        if (ev.key == 'ArrowRight') {
            props.s_increase()
        } else if (ev.key == 'ArrowLeft') {
            props.s_decrease()
        } else if (ev.key == 'ArrowUp') {
            ev.preventDefault()
            props.l_increase()
        } else if (ev.key == 'ArrowDown') {
            ev.preventDefault()
            props.l_decrease()
        }
    }
    return (
        <div className="slice-plane-widget">
            <canvas className="slice-plane" ref={canvas}
                    height={SIZE} width={SIZE}>
            </canvas>
            <div className="value-display">
                S = {Math.floor(props.S)}%, L = {Math.floor(props.L)}%
            </div>
            <div className="hotkey-tip">
                [←] S-- | [→] S++ | [↓] L-- | [↑] L++
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
        mouse_down_on_plane (p: Vector): void {
            dispatch(New<Actions.SL_MouseDown>({
                type: Actions.SL_MOUSE_DOWN,
                x: p[0],
                y: p[1],
                on_cursor:'Neither'
            }))
        },
        mouse_down_on_s_cursor (p: Vector, current: number): void {
            dispatch(New<Actions.SL_MouseDown>({
                type: Actions.SL_MOUSE_DOWN,
                x: p[0],
                y: p[1],
                on_cursor: 'S',
                cursor_x: current
            }))
        },
        mouse_down_on_l_cursor (p: Vector, current: number): void {
            dispatch(New<Actions.SL_MouseDown>({
                type: Actions.SL_MOUSE_DOWN,
                x: p[0],
                y: p[1],
                on_cursor: 'L',
                cursor_y: current
            }))
        },
        mouse_move (p: Vector): void {
            dispatch(New<Actions.SL_MouseMove>({
                type: Actions.SL_MOUSE_MOVE,
                x: p[0],
                y: p[1]
            }))
        },
        s_increase (): void {
            dispatch(New<Actions.S_Adjust>({
                type: Actions.S_ADJUST,
                is_increment: true
            }))
        },
        s_decrease (): void {
            dispatch(New<Actions.S_Adjust>({
                type: Actions.S_ADJUST,
                is_increment: false
            }))
        },
        l_increase (): void {
            dispatch(New<Actions.L_Adjust>({
                type: Actions.L_ADJUST,
                is_increment: true
            }))
        },
        l_decrease (): void {
            dispatch(New<Actions.L_Adjust>({
                type: Actions.L_ADJUST,
                is_increment: false
            }))
        }
    }
}

export default connect(state2props, dispatch2props)(SlicePlane)