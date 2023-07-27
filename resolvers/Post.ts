import { Event, IPost, User } from '../datamodel/db-schema';

export function author(parent: IPost) {
    return User.findById(parent.author);
}

export function postedAt(parent: IPost) {
    return Event.findById(parent.postedAt);
}
