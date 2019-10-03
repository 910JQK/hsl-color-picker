namespace Actions {

    export const INC = 'INC'
    export const DEC = 'DEC'
    export const INC_ASYNC = 'INC_ASYNC'
    export const DEC_ASYNC = 'DEC_ASYNC'

    export interface Action {
        type: string
    }

    export interface Inc extends Action {
        type: typeof INC
    }

    export interface Dec extends Action {
        type: typeof DEC
    }

    export interface IncAsync extends Action {
        type: typeof INC_ASYNC
    }

    export interface DecAsync extends Action {
        type: typeof DEC_ASYNC
    }

    export function New<T extends Action> (action: T): Action {
        return action
    }

}

export default Actions