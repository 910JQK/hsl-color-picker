import React, { useRef, useEffect } from 'react'
import { Dispatch } from 'redux'
import { connect } from 'react-redux'
import { State, New, Action, Actions } from '../store'
import { range, Vector, vector_diff, vector_sum, polar, deg2rad } from '../utils'

const SIZE = 600
const CENTER = SIZE / 2
const R = SIZE / 2.5
const CURSOR = R * (1 - 0.618) * 0.618

const Transform = (v: Vector): Vector => [v[0], (SIZE - v[1])]
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

}

interface Props extends PropsFromState, PropsFromDispatch {}


function SlicePlane (props: Props): JSX.Element {
    let canvas = useRef<HTMLCanvasElement>(null)
    useEffect(() => {
        let ctx = canvas.current!.getContext('2d')!
        ctx.clearRect(0, 0, SIZE, SIZE)
        let center: Vector = [CENTER, CENTER]
        let origin = vector_diff(center, [R, R])
        let topLeft = vector_sum(origin, [0, 2*R])
        let topRight = vector_sum(topLeft, [2*R, 0])
        let bottomRight = vector_sum(topRight, [0, -2*R])
        let topY = topLeft[1]
        let bottomY = origin[1]
        let height = topY - bottomY
        let rightX = bottomRight[0]
        let leftX = origin[0]
        let width = rightX - leftX
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
        let S_cursor = vector_sum(center, [(props.S/100)*2*R - R, -R])
        let S_a = vector_sum(S_cursor, polar(CURSOR, 270+30))
        let S_b = vector_sum(S_cursor, polar(CURSOR, 270-30))
        ctx.beginPath()
        ctx.moveTo(...Transform(S_cursor))
        ctx.lineTo(...Transform(S_a))
        ctx.lineTo(...Transform(S_b))
        ctx.fillStyle = 'hsl(0, 0%, 75%)'
        ctx.fill()
        let L_cursor = vector_sum(center, [R, (props.L/100)*2*R - R])
        let L_a = vector_sum(L_cursor, polar(CURSOR, 30))
        let L_b = vector_sum(L_cursor, polar(CURSOR, -30))
        ctx.beginPath()
        ctx.moveTo(...Transform(L_cursor))
        ctx.lineTo(...Transform(L_a))
        ctx.lineTo(...Transform(L_b))
        ctx.fillStyle = 'hsl(0, 0%, 75%)'
        ctx.fill()
        let point = [S_cursor[0], L_cursor[1]]
        ctx.beginPath()
        ctx.moveTo(...Transform(S_cursor))
        ctx.lineTo(...Transform(vector_sum(S_cursor, [0, 2*R])))
        ctx.lineWidth = 6.0
        ctx.strokeStyle = 'hsla(0, 0%, 95%, 0.5)'
        ctx.stroke()
        ctx.beginPath()
        ctx.moveTo(...Transform(L_cursor))
        ctx.lineTo(...Transform(vector_sum(L_cursor, [-2*R, 0])))
        ctx.stroke()
        ctx.beginPath()
        ctx.arc(point[0], point[1], 4.0, 0, deg2rad(360))
        ctx.fillStyle = ctx.strokeStyle = 'hsla(0, 0%, 95%, 0.5)'
        ctx.fill(); ctx.stroke()
    })
    return (
        <canvas className="slice_plane" ref={canvas}
                height={SIZE} width={SIZE}
                style={{height:'300px',width:'300px'}} >
        </canvas>
    )
}

function state2props (state: State): PropsFromState {
    let { H, S, L } = state
    return { H, S, L }
}

function dispatch2props (dispatch: Dispatch<Action>): PropsFromDispatch {
    New
    Actions
    return {}
}

export default connect(state2props, dispatch2props)(SlicePlane)