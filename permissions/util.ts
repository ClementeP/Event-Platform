import { Types } from 'mongoose';

export function isOId(x: any): x is Types.ObjectId {
    return x instanceof Types.ObjectId;
}

/**
 * Wraps a callback to handle its argument being undefined. A new callback is
 * returned. If the latter callback's argument should be undefined or null, an
 * error is raised.
 * @param cb Argument projector
 * @returns Argument projector raising an error on undefined input
 */
export function project<T, U>(cb: (arg: T) => U): (arg: undefined | null | T) => U {
    return (res) => {
        if (res === undefined || res === null) {
            throw new Error('input not defined');
        } else {
            return cb(res);
        }
    }
}
