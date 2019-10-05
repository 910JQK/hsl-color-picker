import { MouseEvent } from 'react'

type Vector = [number, number]
type Triangle = [Vector, Vector, Vector]
type Rectangle = [Vector, Vector, Vector, Vector]

function range (start: number, end: number): Generator<number> {
    return linspace(start, end, 1)
}

function* linspace (start: number, end: number, step: number): Generator<number> {
    for (let i = start; i < end; i += step) {
        yield i
    }
}

function clamp (value: number, low: number, high: number): number {
    if (value < low) {
        return low
    } else if (value > high) {
        return high
    } else {
        return value
    }
} 

function deg2rad (x: number): number {
    return x * (Math.PI / 180)
}

function rad2deg (x: number): number {
    return x * (180 / Math.PI)
}

function sin (x: number): number {
    return Math.sin(deg2rad(x))
}

function cos (x: number): number {
    return Math.cos(deg2rad(x))
}

function polar (rho: number, theta: number): Vector {
    return [rho*cos(theta), rho*sin(theta)]
}

function vector_sum (v: Vector, w: Vector): Vector {
    return [v[0]+w[0], v[1]+w[1]]
}

function vector_diff (v: Vector, w: Vector): Vector {
    return [v[0]-w[0], v[1]-w[1]]
}

function normal_vector (v: Vector): Vector {
    return [v[1], -v[0]]
}

function incline_angle (v: Vector): number {
    let theta = rad2deg(Math.atan2(v[1], v[0]))
    if (theta > 0) {
        return theta
    } else {
        return (360 + theta) % 360
    }
}

function norm (v: Vector): number {
    return Math.sqrt(v[0]*v[0] + v[1]*v[1])
}

function is_anti_clockwise (v: Vector, w: Vector): boolean {
    let n = normal_vector(w)
    let dot = v[0]*n[0] + v[1]*n[1]
    return (dot >= 0)
}

function in_triangle (t: Triangle, v: Vector): boolean {
    // A, B, C should be clockwise
    let [A, B, C] = t
    let AB = vector_diff(B, A)
    let BC = vector_diff(C, B)
    let CA = vector_diff(A, C)
    let Av = vector_diff(v, A)
    let Bv = vector_diff(v, B)
    let Cv = vector_diff(v, C)
    return (
        is_anti_clockwise(Av, AB)
        && is_anti_clockwise(Bv, BC)
        && is_anti_clockwise(Cv, CA)
    )
}

function in_rectangle (r: Rectangle, v: Vector): boolean {
    // A, B, C, D should be clockwise
    let [A, B, C, D] = r
    let AB = vector_diff(B, A)
    let BC = vector_diff(C, B)
    let CD = vector_diff(D, C)
    let DA = vector_diff(A, D)
    let Av = vector_diff(v, A)
    let Bv = vector_diff(v, B)
    let Cv = vector_diff(v, C)
    let Dv = vector_diff(v, D)
    return (
        is_anti_clockwise(Av, AB)
        && is_anti_clockwise(Bv, BC)
        && is_anti_clockwise(Cv, CD)
        && is_anti_clockwise(Dv, DA)
    )
}

function get_event_point (ev: MouseEvent, ratio: number): Vector {
    let element = (ev.target as HTMLElement)
    let x = ev.pageX - element.offsetLeft
    let y = ev.pageY - element.offsetTop
    return [x / ratio, y / ratio]
}


export {
    Vector, Triangle, Rectangle,
    range,
    clamp,
    deg2rad, polar,
    vector_sum, vector_diff,
    incline_angle, norm,
    in_triangle, in_rectangle,
    get_event_point
}