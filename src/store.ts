import { createStore, compose, applyMiddleware } from 'redux'
import { Epic, createEpicMiddleware, combineEpics } from 'redux-observable'
import { delay, map } from 'rxjs/operators'
import Actions from './actions'

type Action = Actions.Action
let New = Actions.New

interface State {
    count: number
}

let initial: State = {
    count: 0
}

let reducers: { [type:string]: (s: State, a: Action) => State } = {
    [Actions.INC]: (state, _): State => {
        return { count: state.count + 1 }
    },
    [Actions.DEC]: (state, _): State => {
        return { count: state.count - 1 }
    }
}

let epics: Epic<Action,Action,State>[] = [
    ($action, _) => {
        let async_increment = $action.ofType(Actions.INC_ASYNC)
        return async_increment.pipe (
            delay(1000),
            map(_ => New<Actions.Inc>({ type: Actions.INC }))
        )
    },
    ($action, _) => {
        let async_decrement = $action.ofType(Actions.DEC_ASYNC)
        return async_decrement.pipe (
            delay(500),
            map(_ => New<Actions.Dec>({ type: Actions.DEC }))
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