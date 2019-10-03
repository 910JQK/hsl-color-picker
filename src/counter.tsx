import React from 'react'
import { connect } from 'react-redux'
import { State, Dispatch, Actions } from './store'

interface PropsFromState {
    current: number,
}

interface PropsFromDispatch {
    inc: () => void,
    dec: () => void
}

interface Props extends PropsFromState, PropsFromDispatch {}


function Counter (props: Props): JSX.Element {
    return (
        <div>
            <button onClick={props.dec}> - </button>
            <p style={{fontSize:'24px'}}>{ props.current }</p>
            <button onClick={props.inc}> + </button>
        </div>
    )
}

function state2props (state: State): PropsFromState {
    return { current: state.count }
}

function dispatch2props (dispatch: any): PropsFromDispatch {
    return {
        inc: () => {
            (dispatch as Dispatch<Actions.IncAction>)({
                type: Actions.INC
            })
        },
        dec: () => {
            (dispatch as Dispatch<Actions.DecAction>)({
                type: Actions.DEC
            })
        }
    }
}

export default connect(state2props, dispatch2props)(Counter)