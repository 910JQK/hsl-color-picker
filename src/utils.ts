function deg2rad (x: number): number {
    return x * (Math.PI / 180)
}

function range (start: number, end: number): Generator<number> {
    return linspace(start, end, 1)
}

function* linspace (start: number, end: number, step: number): Generator<number> {
    for (let i = start; i < end; i += step) {
        yield i
    }
}

export { deg2rad, range, linspace }