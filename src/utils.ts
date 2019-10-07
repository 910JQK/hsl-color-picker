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

function get_event_point (ev: MouseEvent, element: HTMLElement, ratio: number): Vector {
    let x = clamp(ev.pageX - element.offsetLeft, 0, element.offsetWidth)
    let y = clamp(ev.pageY - element.offsetTop, 0, element.offsetHeight)
    return [x / ratio, y / ratio]
}

function rgb2hsl (rgb: [number, number, number]): [number, number, number] {

    // Code Modified From: https://stackoverflow.com/questions/39118528/rgb-to-hsl-conversion
    // see: https://en.wikipedia.org/wiki/RGB_color_model
    // see: https://en.wikipedia.org/wiki/HSL_and_HSV

    // returns the average of the supplied number arguments
    function average(...theArgs: number[]): number {
        return (
            theArgs.length?
                theArgs.reduce((p, c) => p + c, 0) / theArgs.length:
                0
        )
    }

    // expects R, G, B, Cmax and chroma to be in number interval [0, 1]
    // returns undefined if chroma is 0, or a number interval [0, 360] degrees
    function hue (
        R: number, G: number, B: number,
        Cmax: number, chroma: number
    ): number {
        if (chroma === 0) {
            // assume grayscale to be red
            return 0
        }
        let H = 0
        if (Cmax === R) {
            H = ((G - B) / chroma) % 6
        } else if (Cmax === G) {
            H = ((B - R) / chroma) + 2
        } else if (Cmax === B) {
            H = ((R - G) / chroma) + 4
        }
        H *= 60
        return H < 0 ? H + 360 : H
    }
    
    // expects R, G, B, Cmin, Cmax and chroma to be in number interval [0, 1]
    // type is by default 'bi-hexcone' equation
    // set 'luma601' or 'luma709' for alternatives
    // see: https://en.wikipedia.org/wiki/Luma_(video)
    // returns a number interval [0, 1]
    function lightness (
        R: number, G: number, B: number,
        Cmin: number, Cmax: number, type: string = 'bi-hexcone'
    ): number {
        if (type === 'luma601') {
            return (0.299 * R) + (0.587 * G) + (0.114 * B)
        }
        if (type === 'luma709') {
            return (0.2126 * R) + (0.7152 * G) + (0.0772 * B)
        }
        return average(Cmin, Cmax)
    }
  
    // expects L and chroma to be in number interval [0, 1]
    // returns a number interval [0, 1]
    function saturation(L: number, chroma: number): number {
        return chroma === 0 ? 0 : chroma / (1 - Math.abs(2 * L - 1))
    }
  
    // returns the value to a fixed number of digits
    function toFixed (
        value: number | undefined,
        digits: number | undefined
    ): number {
        return Number (String (
            (Number.isFinite(value!) && Number.isFinite(digits!))?
                value!.toFixed(digits) : value!
        ))
    }
  
    // expects R, G, and B to be in number interval [0, 1]
    function RGB2HSL (R: number, G: number, B: number): [number, number, number] {
        const Cmin = Math.min(R, G, B)
        const Cmax = Math.max(R, G, B)
        const chroma = Cmax - Cmin
        // default 'bi-hexcone' equation
        const L = lightness(R, G, B, Cmin, Cmax)
        // H in degrees interval [0, 360]
        // L and S in interval [0, 1]
        return [
            Math.round(toFixed(hue(R, G, B, Cmax, chroma), 1)) % 360,
            clamp(Math.round(100*toFixed(saturation(L, chroma), 3)), 0, 100),
            clamp(Math.round(100*toFixed(L, 3)), 0, 100)
        ]
    }

    let normalized: [number, number, number] = rgb.map(x => x / 255) as any
    return RGB2HSL(...normalized)

}

function rgb_from_hex (rgb_str: string): [number, number, number] {
    if (rgb_str.length == 3) {
        return [
            Number.parseInt(rgb_str[0] + rgb_str[0], 16),
            Number.parseInt(rgb_str[1] + rgb_str[1], 16),
            Number.parseInt(rgb_str[2] + rgb_str[2], 16)
        ]
    } else {
        return [
            Number.parseInt(rgb_str.slice(0, 2), 16),
            Number.parseInt(rgb_str.slice(2, 4), 16),
            Number.parseInt(rgb_str.slice(4, 6), 16)
        ]
    }
}


export {
    Vector, Triangle, Rectangle,
    range, linspace,
    clamp,
    deg2rad, polar,
    vector_sum, vector_diff,
    incline_angle, norm,
    in_triangle, in_rectangle,
    get_event_point,
    rgb2hsl, rgb_from_hex
}