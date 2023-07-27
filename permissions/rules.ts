import { rule } from 'graphql-shield';
import { IContext } from '..';
import { Category, Event, ICategory, IEvent, IInvitation, Invitation, IPost, IUser, Post, Role, User } from '../datamodel/db-schema';
import { ICategoryArg, ICreateEvent, ICreatePost, ICreateUser, IEditEvent, IEditUser, IEventArg, IInvitationArg, INode, IPostArg, IUserArg } from '../resolvers/Mutation';
import { Types } from 'mongoose';
import { getLoggedIn } from '../resolvers/util';
import { get, isArray } from 'lodash';
import { isOId, project } from './util';

export const isLoggedIn = rule({ cache: 'contextual' })(
    (parent: any, args: any, ctx: IContext) => ctx.session.user !== undefined,
);

export function callerHasRole(role: Role) {
    return rule({ cache: 'contextual' })(
        (parent: any, args: any, ctx: IContext) =>
            Boolean(ctx.session.user?.role === role),
    );
}

export function argHasRole(role: Role) {
    return rule({ cache: 'no_cache' })(
        (parent: undefined, args: IUserArg) => User.findOne(
            { _id: args.user, role }
        ).then(Boolean),
    );
}

export enum Reference {
    ARG,
    PARENT,
    PROPERTY,
}

/**
 * Creates a rule that checks if a reference is equal to the user logged in.
 * The following user is checked: if `who` is ARG`, the user pointed to by the
 * argument, if `who` is `PARENT`, the user currently being resolved, if `who`
 * is `PROPERTY` the user pointed to by the path in `prop`.
 * @param who Which reference should be compared?
 * @param prop If reference is `PROPERTY`, what is the path of the property?
 * @returns Rule checking if reference is caller
 */
export function isCaller(who: Reference, prop?: string) {
    return rule({ cache: 'no_cache' })((parent: any, args: any, ctx: IContext) => {
        const userId = getLoggedIn(ctx);
        switch (who) {
            case Reference.ARG: {
                const userPtr = typeof(args.user) === 'string' ?
                    (args as IUserArg).user :
                    (args as { user: INode }).user._id;
                return userId.equals(userPtr);
            }
            case Reference.PARENT: return (parent as IUser)._id.equals(userId);
            case Reference.PROPERTY: {
                const propId = get(parent, prop as string);
                if (propId) {
                    if (isArray(propId)) {
                        return propId.includes(userId);
                    } else {
                        return propId.equals(userId);
                    }
                } else {
                    return false;
                };
            }
        }
    });
}

export const parentIsPrivate = rule({ cache: 'no_cache' })(
    (parent: IEvent) => parent.private
);

export const argIsPrivate = rule({ cache: 'no_cache' })(
    (parent: undefined, { event }: IEventArg | { event: ICreateEvent | IEditEvent }) => {
        if (typeof event === 'string') {
            return Event.findById(event).then(project((event) => event.private));
        } else {
            return Boolean(event.private);
        }
    },
);

type EventPointer = IEventArg | IInvitationArg | IPostArg | { event: IEditEvent & INode };

/**
 * Resolves an event pointer to the event's ObjectId. Mainly, this function
 * performs multiplexing the type of the input arg.
 * @param ptr Event pointer
 * @returns The ObjectId of the event
 */
function idFromEventPointer(ptr: EventPointer): Promise<Types.ObjectId> {
    if ('event' in ptr) {
        const { event } = ptr;
        return Promise.resolve(Types.ObjectId(
            typeof event === 'string' ? event : event._id
        ));
    } else if ('invitation' in ptr) {
        return Invitation.findById(ptr.invitation).then(project((inv) => inv.to));
    } else {
        return Post.findById(ptr.post).then(project((post) => post.postedAt));
    }
}

function isOwner(
    user: Types.ObjectId,
    event: Types.ObjectId | IEvent,
): Promise<boolean> {
    if (isOId(event)) {
        return Event.findOne({ _id: event, owner: user }).then(Boolean);
    } else {
        return Promise.resolve(event.owner.equals(user));
    }
}

export const callerOwnsArg = rule({ cache: 'no_cache' })(
    async (parent: any, args: EventPointer, ctx: IContext) => isOwner(
        getLoggedIn(ctx),
        await idFromEventPointer(args),
    ),
);

export const callerOwnsParent = rule({ cache: 'no_cache' })(
    (parent: IEvent | IInvitation, args: any, ctx: IContext) => isOwner(
        getLoggedIn(ctx),
        'to' in parent ? parent.to : parent,
    ),
);

function isManager(
    user: Types.ObjectId,
    event: Types.ObjectId | IEvent,
): Promise<boolean> {
    if (isOId(event)) {
        return Event.findOne(
            { _id: event, $or: [
                { managers: user },
                { owner: user },
            ] },
            ).then(Boolean);
    } else {
        return Promise.resolve(event.managers.includes(user));
    }
}

export const callerManagesArg = rule({ cache: 'no_cache' })(
    async (parent: any, args: EventPointer, ctx: IContext) => isManager(
        getLoggedIn(ctx),
        await idFromEventPointer(args),
    )
);

export const callerManagesParent = rule({ cache: 'no_cache' })(
    (parent: IEvent | IInvitation | IPost, args: any, ctx: IContext) => isManager(
        getLoggedIn(ctx),
        'to' in parent ? parent.to : 'postedAt' in parent ? parent.postedAt : parent,
    ),
);

function isInvitedEvent(
    user: Types.ObjectId,
    event: Types.ObjectId | IEvent,
): Promise<boolean> {
    return Invitation.findOne({
        to: isOId(event) ? event : event._id,
        invited: user,
    }).then(Boolean);
}

function isInvitedInvitation (
    user: Types.ObjectId,
    invitation: Types.ObjectId | IInvitation,
): Promise<boolean> {
    if (isOId(invitation)) {
        return Invitation.findOne(
            { _id: invitation, invited: user },
        ).then(Boolean);
    } else {
        return Promise.resolve(invitation.invited.equals(user));
    }
}

export const callerIsInvitedToArg = rule({ cache: 'no_cache' })(
    (parent: any, args: IInvitationArg | IEventArg, ctx: IContext) => {
        const user = getLoggedIn(ctx);
        if ('event' in args) {
            return isInvitedEvent(user, Types.ObjectId(args.event));
        } else {
            return isInvitedInvitation(user, Types.ObjectId(args.invitation));
        }
    },
);

export const callerIsInvitedToParent = rule({ cache: 'no_cache' })(
    (parent: IEvent | IInvitation, args: any, ctx: IContext) => {
        const user = getLoggedIn(ctx);
        if ('owner' in parent) {
            return isInvitedEvent(user, parent);
        } else {
            return isInvitedInvitation(user, parent);
        }
    },
);

export const callerRequestsArg = rule({ cache: 'no_cache' })(
    (parent: undefined, args: IEventArg, ctx: IContext) => {
        return Event.findOne({
            _id: Types.ObjectId(args.event),
            requests: getLoggedIn(ctx),
        }).then(Boolean);
    },
);

export const argRequestsArg = rule({ cache: 'strict' })(
    (parent: undefined, args: IEventArg & IUserArg) => {
        return Event.findOne({
            _id: Types.ObjectId(args.event),
            requests: Types.ObjectId(args.user),
        }).then(Boolean);
    },
);

function attendsEvent(
    user: Types.ObjectId,
    event: Types.ObjectId | IEvent,
): Promise<boolean> {
    if (isOId(event)) {
        return Event.findOne({
            _id: event,
            attendants: user,
        }).then(Boolean);
    } else {
        return Promise.resolve(event.attendants.includes(user));
    }
}

export const callerAttendsParent = rule({ cache: 'no_cache' })(
    (parent: IEvent | IPost, args: any, ctx: IContext) => attendsEvent(
        getLoggedIn(ctx),
        'owner' in parent ? parent : parent.postedAt,
    ),
);

export const callerAttendsArg = rule({ cache: 'no_cache' })(
    async (
        parent: undefined,
        args: IEventArg | IPostArg | { post: ICreatePost },
        ctx: IContext,
    ) => {
        let _id: Types.ObjectId;
        if ('post' in args && typeof args.post !== 'string') {
            _id = Types.ObjectId(args.post.postedAt);
        } else {
            _id = await idFromEventPointer(args as IEventArg | IPostArg);
        }
        return attendsEvent(getLoggedIn(ctx), _id);
    }
);

async function isModerator(
    user: Types.ObjectId,
    category: Types.ObjectId | ICategory | IEvent | IPost,
) {
    if ('moderators' in category) {
        return category.moderators.includes(user);
    } else {
        let _id: { $in: Types.ObjectId[] } | Types.ObjectId = category as Types.ObjectId;
        if ('categories' in category) {
            _id = { $in: category.categories };
        } else if ('postedAt' in category) {
            _id = await Event.findById(category.postedAt).then(
                project((event) => { return { $in: event.categories }; }),
            );
        }

        return Category.findOne(
            { _id, moderators: user }
        ).then(Boolean);
    }
}

function isModeratorEvent(user: Types.ObjectId, event: Types.ObjectId) {
    return Event.findById(event)
        // First project to handle no event found
        .then(project((x) => x))
        .then((event) => isModerator(user, event));
}

export const callerModeratesParent = rule({ cache: 'no_cache' })(
    (parent: ICategory | IEvent | IPost, args: any, ctx: IContext) =>
        isModerator(getLoggedIn(ctx), parent),
);

export const callerModeratesArg = rule({ cache: 'no_cache' })(
    async (parent: undefined, args: ICategoryArg | IEventArg | IPostArg, ctx: IContext) => {
        if ('category' in args) {
            return isModerator(getLoggedIn(ctx), Types.ObjectId(args.category));
        } else {
            return isModeratorEvent(
                getLoggedIn(ctx),
                await idFromEventPointer(args),
            );
        }
    },
);

export const argIsFlagged = rule({ cache: 'no_cache' })(
    (parent: any, args: IPostArg) => {
        return Post.findById(args.post).then(project((res) => res.flagged));
    }
);

export const argIsLocked = rule({ cache: 'no_cache' })(
    (parent: any, args: IPostArg) => Post.findById(
        Types.ObjectId(args.post),
    ).then(project((post) => post.locked)),
);

export const parentIsLocked = rule({ cache: 'no_cache' })(
    (parent: IPost, args: any) => parent.locked,
);

export const argEventHasOwner = rule({ cache: 'strict' })(
    async (parent: undefined, { event }: { event: IEditEvent & INode }) => {
        return Event.findById(event._id).then(
            project((event) => Boolean(event.owner)),
        );
    },
);

//ASK THIS IN THE FORUM SINCE THEY TELL YOU TO REMOVE OWNER
//THIS PART SHOULD HAVE BECOME REDUNDANT
// export const argOwnerDefined = rule({ cache: 'no_cache' })(
//     (parent: undefined, { event }: { event: IEditEvent }) => Boolean(event.owner),
// );
