import { createStore, compose, applyMiddleware } from 'redux'
import { Epic, createEpicMiddleware, combineEpics } from 'redux-observable'
import { map, filter, switchMap, takeUntil } from 'rxjs/operators'
import Actions from './actions'

type Action = Actions.Action
let New = Actions.New

interface State {
    H: number,
    S: number,
    L: number
}

let initial: State = {
    H: 0,
    S: 0,
    L: 0
}

let reducers: { [type:string]: (s: State, a: Action) => State } = {
    [Actions.H_COMMIT]: (state, action): State => {
        let H = (action as Actions.H_Commit).hue
        if (!(0 <= H && H < 360)) {
            throw new Error(`invalid hue value ${H}`)
        }
        return {...state, H }
    }
}

let epics: Array<Epic<Action,Action,State>> = [
    ($action, _) => {
        return $action.ofType(Actions.H_MOUSE_DOWN).pipe (
            map(down => (down as Actions.H_MouseDown)),
            filter(down => !down.on_cursor),
            map(down => New<Actions.H_Commit>({
                type: Actions.H_COMMIT,
                hue: (-down.angle + 360) % 360
            }))
        )
    },
    ($action, _) => {
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
                        hue: (-revised + 360) % 360
                    })
                } else {
                    return New<Actions.H_Commit>({
                        type: Actions.H_COMMIT,
                        hue: (-angle + 360) % 360
                    })
                }
            })
        )
    }
]

let root_reducer = (state: State = initial, action: Action): State => {
    if (reducers[action.type]) {
        return reducers[action.type](state, action)
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