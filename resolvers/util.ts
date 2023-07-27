import { AuthenticationError } from 'apollo-server-errors';
import { Types } from 'mongoose';
import { IContext } from '..';
import { INode } from './Mutation';

/**
 * Returns the logged-in user's ObjectId or raises an error if no user is logged
 * in.
 * @param ctx Context object
 * @returns Logged-in user's ObjectId
 */
export function getLoggedIn(ctx: IContext): Types.ObjectId {
    if (!ctx.session.user) {
        throw new AuthenticationError('Must be logged in');
    }
    return Types.ObjectId(ctx.session.user._id);
}

/**
 * @param ids Array of strings
 * @returns Array of ObjectIds
 */
export function mapIds(ids: string[]): Types.ObjectId[] {
    return ids.map((id) => Types.ObjectId(id));
}

/**
 * Reads and deletes the `_id` property of an object
 * @param obj Object with `_id` property as string
 * @returns ObjectId
 */
export function popId(obj: INode): Types.ObjectId {
    const _id = obj._id;
    delete (obj as { _id?: string })._id;
    return Types.ObjectId(_id);
}
