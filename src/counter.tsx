import React from 'react'
import { Dispatch } from 'redux'
import { connect } from 'react-redux'
import { State, New, Action, Actions } from './store'

interface PropsFromState {
    current: number,
}

interface PropsFromDispatch {
    inc: () => void,
    dec: () => void,
    inc_async: () => void,
    dec_async: () => void
}

interface Props extends PropsFromState, PropsFromDispatch {}


function Counter (props: Props): JSX.Element {
    return (
        <div>
            <button onClick={props.dec_async}> - (async)</button>
            <button onClick={props.dec}> - </button>
            <span style={{fontSize:'24px', padding: '1rem'}}>
                { props.current }
            </span>
            <button onClick={props.inc}> + </button>
            <button onClick={props.inc_async}> + (async)</button>
        </div>
    )
}

function state2props (state: State): PropsFromState {
    return { current: state.count }
}

function dispatch2props (dispatch: Dispatch<Action>): PropsFromDispatch {
    return {
        inc: () => {
            dispatch(New<Actions.Inc>({
                type: Actions.INC
            }))
        },
        dec: () => {
            dispatch(New<Actions.Dec>({
                type: Actions.DEC
            }))
        },
        inc_async: () => {
            dispatch(New<Actions.IncAsync>({
                type: Actions.INC_ASYNC
            }))
        },
        dec_async: () => {
            dispatch(New<Actions.DecAsync>({
                type: Actions.DEC_ASYNC
            }))
        }
    }
}

export default connect(state2props, dispatch2props)(Counter)