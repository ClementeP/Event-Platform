import { Category, Event, IEvent, Invitation, Post, User } from '../datamodel/db-schema';

export function owner(parent: IEvent) {
    return User.findOne({ _id: parent.owner });
}

export function managers(parent: IEvent) {
    return User.find({ _id: { $in: parent.managers }});
}

export function categories(parent: IEvent) {
    return Category.find({ _id: { $in: parent.categories }});
}

export function attendants(parent: IEvent) {
    return User.find({ _id: { $in: parent.attendants }});
}

export function invited(parent: IEvent) {
    return Invitation.find({ to: parent._id });
}

export function requests(parent: IEvent) {
    return User.find({ _id: { $in: parent.requests }});
}

export function messageBoard(parent: IEvent) {
    return Post.find({ postedAt: parent._id });
}
