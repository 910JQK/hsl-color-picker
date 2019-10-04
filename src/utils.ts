type Vector = [number, number]
type Triangle = [Vector, Vector, Vector]

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

function is_clockwise (v: Vector, w: Vector): boolean {
    let n = normal_vector(w)
    let dot = v[0]*n[0] + v[1]*n[1]
    return (dot >= 0)
}

function in_triangle (t: Triangle, v: Vector): boolean {
    let [A, B, C] = t
    let AB = vector_diff(B, A)
    let BC = vector_diff(C, B)
    let CA = vector_diff(A, C)
    let Av = vector_diff(v, A)
    let Bv = vector_diff(v, B)
    let Cv = vector_diff(v, C)
    return (
        is_clockwise(Av, AB)
        && is_clockwise(Bv, BC)
        && is_clockwise(Cv, CA)
    )
}

function deg2rad (x: number): number {
    return x * (Math.PI / 180)
}

function sin (x: number): number {
    return Math.sin(deg2rad(x))
}

function cos (x: number): number {
    return Math.cos(deg2rad(x))
}

function range (start: number, end: number): Generator<number> {
    return linspace(start, end, 1)
}

function* linspace (start: number, end: number, step: number): Generator<number> {
    for (let i = start; i < end; i += step) {
        yield i
    }
}

export { polar, vector_sum, in_triangle, deg2rad, sin, cos, range, linspace }