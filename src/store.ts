import { createStore } from 'redux'
import Actions from './actions'

type Action = Actions.Action
type Dispatch<T extends Action> = (a: T) => void

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

let root_reducer = (state: State = initial, action: Action): State => {
    if (action.type.startsWith('@@')) {
        return state
    } else {
        return reducers[action.type](state, action)
    }
}

let store = createStore
(
    root_reducer,
    (
        (window as any).__REDUX_DEVTOOLS_EXTENSION__
        && (window as any).__REDUX_DEVTOOLS_EXTENSION__()
    )
)

export { State, Action, Actions, Dispatch }
export default store