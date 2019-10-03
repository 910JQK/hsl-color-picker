namespace Actions {

    export const INC = 'INC'
    export const DEC = 'DEC'

    export interface Action {
        type: string
    }

    export interface IncAction extends Action {
        type: typeof INC
    }

    export interface DecAction extends Action {
        type: typeof DEC
    }

}

export default Actions