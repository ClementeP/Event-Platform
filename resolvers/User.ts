import { Category, Event, Invitation, IUser, Post } from '../datamodel/db-schema';

export function subscribes(parent: IUser) {
    return Category.find({ _id: { $in: parent.subscribes }});
}

export function invitations(parent: IUser) {
    return Invitation.find({ invited: parent._id });
}

export function invites(parent: IUser) {
    return Invitation.find({ from: parent._id });
}

export function requests(parent: IUser) {
    return Event.find({ requests: parent._id });
}

export function attends(parent: IUser) {
    //const _id = [parent._id];  //**TO BE REMOVED !!! */
    return Event.find({ $or: [
        { attendants: parent._id },
        { managers: parent._id },
        { owner: parent._id },
    ] });
}

export function moderates(parent: IUser) {
    return Category.find({ moderators: parent._id });
}

export function authored(parent: IUser) {
    return Post.find({ author: parent._id });
}
