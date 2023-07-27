import { Event, ICategory, User } from '../datamodel/db-schema';

export function moderators(parent: ICategory) {
    return User.find({ _id: { $in: parent.moderators } });
}

export function subscribers(parent: ICategory) {
    return User.find({ subscribes: parent._id });
}

export function events(parent: ICategory) {
    return Event.find({ categories: parent._id });
}
