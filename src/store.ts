import { createStore, compose, applyMiddleware } from 'redux'
import { Epic, createEpicMiddleware, combineEpics } from 'redux-observable'
import { Observable } from 'rxjs'
import { map, filter, switchMap, takeUntil } from 'rxjs/operators'
import Actions from './actions'
import { clamp } from './utils'

type Action = Actions.Action
let New = Actions.New

interface State {
    H: number,
    S: number,
    L: number
}

let initial: State = (() => {
    let saved = localStorage.getItem('state')
    if (saved == null) {
        return {
            H: 0,
            S: 0,
            L: 0
        }
    } else {
        let parsed = JSON.parse(saved)
        return {
            H: (0 <= parsed.H && parsed.H < 360)? parsed.H: 0,
            S: (0 <= parsed.S && parsed.S <= 100)? parsed.S: 0,
            L: (0 <= parsed.L && parsed.L <= 100)? parsed.L: 0
        }
    }
})()

let reducers: { [type:string]: (s: State, a: Action) => State } = {
    [Actions.H_COMMIT]: (state, action): State => {
        let H = (action as Actions.H_Commit).H
        if (!(0 <= H && H < 360)) {
            throw new Error(`invalid hue value ${H}`)
        }
        return { ...state, H }
    },
    [Actions.S_COMMIT]: (state, action): State => {
        let S = (action as Actions.S_Commit).S
        if (!(0 <= S && S <= 100)) {
            throw new Error(`invalid saturation value ${S}`)
        }
        return { ...state, S }
    },
    [Actions.L_COMMIT]: (state, action): State => {
        let L = (action as Actions.L_Commit).L
        if (!(0 <= L && L <= 100)) {
            throw new Error(`invalid lightness value ${L}`)
        }
        return { ...state, L }
    },
    [Actions.SL_COMMIT]: (state, action): State => {
        let { S, L } = (action as Actions.SL_Commit)
        if (!(0 <= S && S <= 100)) {
            throw new Error(`invalid saturation value ${S}`)
        }
        if (!(0 <= L && L <= 100)) {
            throw new Error(`invalid lightness value ${L}`)
        }
        return { ...state, S, L }
    },
    [Actions.HSL_COMMIT]: (state, action): State => {
        let { H, S, L } = (action as Actions.HSL_Commit)
        if (!(0 <= H && H <= 360)) {
            throw new Error(`invalid hue value ${H}`)
        }
        if (!(0 <= S && S <= 100)) {
            throw new Error(`invalid saturation value ${S}`)
        }
        if (!(0 <= L && L <= 100)) {
            throw new Error(`invalid lightness value ${L}`)
        }
        return { ...state, H, S, L }
    },
    [Actions.H_ADJUST]: (state, action): State => {
        let H = (
            (action as Actions.H_Adjust).is_increment?
            Math.floor(state.H + 1) % 360:
            (Math.ceil(state.H - 1) + 360) % 360
        )
        return (H != state.H)? { ...state, H }: state
    },
    [Actions.S_ADJUST]: (state, action): State => {
        let S = (
            (action as Actions.S_Adjust).is_increment?
            clamp(Math.floor(state.S + 1), 0, 100):
            clamp(Math.ceil(state.S - 1), 0, 100)
        )
        return (S != state.S)? { ...state, S }: state
    },
    [Actions.L_ADJUST]: (state, action): State => {
        let L = (
            (action as Actions.L_Adjust).is_increment?
            clamp(Math.floor(state.L + 1), 0, 100):
            clamp(Math.ceil(state.L - 1), 0, 100)
        )
        return (L != state.L)? { ...state, L }: state
    }
}

let epics: Array<Epic<Action,Action,State>> = [
    function HandleHueRingClick ($action, _): Observable<Action> {
        return $action.ofType(Actions.H_MOUSE_DOWN).pipe (
            map(down => (down as Actions.H_MouseDown)),
            filter(down => !down.on_cursor),
            map(down => New<Actions.H_Commit>({
                type: Actions.H_COMMIT,
                H: (-down.angle + 360) % 360
            }))
        )
    },
    function HandleHueRingDrag ($action, _): Observable<Action> {
        return $action.ofType(Actions.H_MOUSE_DOWN).pipe (
            switchMap(down => $action.ofType(Actions.H_MOUSE_MOVE).pipe (
                takeUntil($action.ofType(Actions.MOUSE_UP)),
                map(move => ({
                    down: (down as Actions.H_MouseDown),
                    move: (move as Actions.H_MouseMove)
                }))
            )),
            map(events => {
                let { angle } = events.move
                if (events.down.on_cursor) {
                    let delta = events.down.cursor_angle! - events.down.angle
                    let revised = angle + delta
                    return New<Actions.H_Commit>({
                        type: Actions.H_COMMIT,
                        H: (-revised + 360) % 360
                    })
                } else {
                    return New<Actions.H_Commit>({
                        type: Actions.H_COMMIT,
                        H: (-angle + 360) % 360
                    })
                }
            })
        )
    },
    function HandleSlicePlaneClick ($action, _): Observable<Action> {
        return $action.ofType(Actions.SL_MOUSE_DOWN).pipe (
            map(down => (down as Actions.SL_MouseDown)),
            filter(down => down.on_cursor == 'Neither'),
            map(down => New<Actions.SL_Commit>({
                type: Actions.SL_COMMIT,
                S: clamp(down.x, 0, 100),
                L: clamp(down.y, 0, 100)
            }))
        )
    },
    function HandleSlicePlaneCursorDrag ($action, _): Observable<Action> {
        return $action.ofType(Actions.SL_MOUSE_DOWN).pipe (
            map(down => (down as Actions.SL_MouseDown)),
            filter(down => down.on_cursor != 'Neither'),
            switchMap(down => $action.ofType(Actions.SL_MOUSE_MOVE).pipe (
                takeUntil($action.ofType(Actions.MOUSE_UP)),
                map(move => ({
                    down,
                    move: (move as Actions.SL_MouseMove)
                }))
            )),
            map(events => {
                let { down, move } = events
                if (down.on_cursor == 'S') {
                    let delta = down.cursor_x! - down.x
                    let S = clamp(move.x + delta, 0, 100)
                    return New<Actions.S_Commit>({
                        type: Actions.S_COMMIT,
                        S
                    })
                } else if (down.on_cursor == 'L') {
                    let delta = down.cursor_y! - down.y
                    let L = clamp(move.y + delta, 0, 100)
                    return New<Actions.L_Commit>({
                        type:Actions.L_COMMIT,
                        L
                    })
                } else {
                    throw new Error('impossible branch')
                }
            })
        )
    },
    function HandleSlicePlanePointDrag ($action, _): Observable<Action> {
        return $action.ofType(Actions.SL_MOUSE_DOWN).pipe (
            map(down => (down as Actions.SL_MouseDown)),
            filter(down => down.on_cursor == 'Neither'),
            switchMap((_ :any) => $action.ofType(Actions.SL_MOUSE_MOVE).pipe (
                takeUntil($action.ofType(Actions.MOUSE_UP))
            )),
            map(move => {
                let { x, y } = (move as Actions.SL_MouseMove)
                return New<Actions.SL_Commit>({
                    type: Actions.SL_COMMIT,
                    S: clamp(x, 0, 100),
                    L: clamp(y, 0, 100)
                })
            })
        )
    }
]

let root_reducer = (state: State = initial, action: Action): State => {
    if (reducers[action.type]) {
        let reduced = reducers[action.type](state, action)
        localStorage.setItem('state', JSON.stringify(reduced))
        return reduced
    } else {
        return state
    }
}
let root_epic = combineEpics(...epics)
let epic_middleware = createEpicMiddleware<Action,Action,State>()
let store = createStore (
    root_reducer,
    ((window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose) (
        applyMiddleware(epic_middleware)
    )
)
epic_middleware.run(root_epic)

export { State, New, Action, Actions }
export default store