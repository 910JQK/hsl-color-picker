namespace Actions {

    export const H_MOUSE_DOWN = 'H_MOUSE_DOWN'
    export const H_MOUSE_MOVE = 'H_MOUSE_MOVE'
    export const SL_MOUSE_DOWN = 'SL_MOUSE_DOWN'
    export const SL_MOUSE_MOVE = 'SL_MOUSE_MOVE'
    export const MOUSE_UP = 'MOUSE_UP'
    export const H_COMMIT = 'H_COMMIT'
    export const S_COMMIT = 'S_COMMIT'
    export const L_COMMIT = 'L_COMMIT'
    export const SL_COMMIT = 'SL_COMMIT'
    export const HSL_COMMIT = 'HSL_COMMIT'
    export const H_ADJUST = 'H_ADJUST'
    export const S_ADJUST = 'S_ADJUST'
    export const L_ADJUST = 'L_ADJUST'

    export interface Action {
        type: string
    }

    export interface H_MouseDown extends Action {
        type: typeof H_MOUSE_DOWN,
        angle: number,
        on_cursor: boolean,
        cursor_angle?: number
    }
    
    export interface H_MouseMove extends Action {
        type: typeof H_MOUSE_MOVE,
        angle: number,
    }

    export interface SL_MouseDown extends Action {
        type: typeof SL_MOUSE_DOWN,
        x: number,
        y: number,
        on_cursor: 'S' | 'L' | 'Neither',
        cursor_x?: number,
        cursor_y?: number
    }

    export interface SL_MouseMove extends Action {
        type: typeof SL_MOUSE_MOVE,
        x: number,
        y: number
    }
    
    export interface MouseUp extends Action {
        type: typeof MOUSE_UP
    }

    export interface H_Commit extends Action {
        type: typeof H_COMMIT,
        H: number
    }

    export interface S_Commit extends Action {
        type: typeof S_COMMIT,
        S: number
    }

    export interface L_Commit extends Action {
        type: typeof L_COMMIT,
        L: number
    }

    export interface SL_Commit extends Action {
        type: typeof SL_COMMIT,
        S: number,
        L: number
    }

    export interface HSL_Commit extends Action {
        type: typeof HSL_COMMIT,
        H: number,
        S: number,
        L: number
    }

    interface Adjust {
        is_increment: boolean
    }

    export interface H_Adjust extends Action, Adjust {
        type: typeof H_ADJUST
    }

    export interface S_Adjust extends Action, Adjust {
        type: typeof S_ADJUST
    }

    export interface L_Adjust extends Action, Adjust {
        type:typeof L_ADJUST
    }

    export function New<T extends Action> (action: T): Action {
        return action
    }

}

export default Actions