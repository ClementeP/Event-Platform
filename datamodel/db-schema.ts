import { model, Schema, Types } from 'mongoose';

/**
 * Wraps a mongoose field type definition (say type X) into a new type that is a
 * non-nullable array (X[]) that defaults to be the empty array.
 * @param definition mongoose field type definition
 * @returns mongoose non-null array type definition
 */
function nonNullableArray(definition?: {}): {} {
    return {
        type: [definition],
        required: true,
        default: [],
    };
}

const CATEGORY_KEY = 'Category';
const EVENT_KEY = 'Event';
const INVITATION_KEY = 'Invitation';
const USER_KEY = 'User';
const POST_KEY = 'Post';

export enum Role {
    FREE = 'FREE',
    PREMIUM = 'PREMIUM',
    MODERATOR = 'MODERATOR',
    ADMINISTRATOR = 'ADMINISTRATOR',
}

export interface ICategory {
    _id: Types.ObjectId,
    name: string ,
    moderators: Types.ObjectId[],
}
const CATEGORY_SCHEME = new Schema({
    name: {
        type: String,
        unique: true,
    },
    moderators: nonNullableArray({
        type: Types.ObjectId,
        ref: USER_KEY,
    }),
}, { collection: CATEGORY_KEY });
export const Category = model<ICategory>(CATEGORY_KEY, CATEGORY_SCHEME);

export interface IUser {
    _id: Types.ObjectId,
    role: Role,
    username: string,
    name: string,
    surname: string,
    subscribes: Types.ObjectId[],
    password: string,
}
const USER_SCHEMA = new Schema({
    role: {
        type: String,
        enum: Object.keys(Role),
        default: Role.FREE,
    },
    username: {
        type: String,
        unique: true,
    },
    name: String,
    surname: String,
    subscribes: nonNullableArray({
        type: Types.ObjectId,
        ref: CATEGORY_KEY,
    }),
    password: String,
}, { collection: USER_KEY });
export const User = model<IUser>(USER_KEY, USER_SCHEMA);

export interface IEvent {
    _id: Types.ObjectId,
    title: string,
    time: Date,
    description?: string,
    location: string,
    owner: Types.ObjectId,
    private: boolean,
    managers: Types.ObjectId[],
    categories: Types.ObjectId[],
    attendants: Types.ObjectId[],
    requests: Types.ObjectId[],
}
const EVENT_SCHEMA = new Schema({
    title: String,
    time: Date,
    description: String,
    location: String,
    private: {
        type: Boolean,
        default: false,
    },
    owner: {
        type: Types.ObjectId,
        ref: USER_KEY,
    },
    managers: nonNullableArray({
        type: Types.ObjectId,
        ref: USER_KEY,
    }),
    categories: nonNullableArray({
        type: Types.ObjectId,
        ref: CATEGORY_KEY,
    }),
    attendants: nonNullableArray({
        type: Types.ObjectId,
        ref: USER_KEY,
    }),
    requests: nonNullableArray({
        type: Types.ObjectId,
        ref: USER_KEY,
    }),
}, { collection: EVENT_KEY });
export const Event = model<IEvent>(EVENT_KEY, EVENT_SCHEMA);

export interface IInvitation {
    _id: Types.ObjectId,
    from: Types.ObjectId,
    invited: Types.ObjectId,
    to: Types.ObjectId,
}
const INVITATION_SCHEMA = new Schema({
    from: {
        type: Types.ObjectId,
        ref: USER_KEY,
    },
    invited: {
        type: Types.ObjectId,
        ref: USER_KEY,
    },
    to: {
        type: Types.ObjectId,
        ref: EVENT_KEY,
    },
}, { collection: INVITATION_KEY });
export const Invitation = model<IInvitation>(INVITATION_KEY, INVITATION_SCHEMA);

export interface IPost {
    _id: Types.ObjectId,
    content: string,
    flagged: boolean,
    locked: boolean,
    author: Types.ObjectId,
    postedAt: Types.ObjectId,
}
const POST_SCHEMA = new Schema({
    content: String,
    flagged: {
        type: Boolean,
        default: false,
    },
    locked: {
        type: Boolean,
        default: false,
    },
    author: {
        type: Types.ObjectId,
        ref: USER_KEY,
    },
    postedAt: {
        type: Types.ObjectId,
        ref: EVENT_KEY,
    },
}, { collection: POST_KEY });
export const Post = model<IPost>(POST_KEY, POST_SCHEMA);
