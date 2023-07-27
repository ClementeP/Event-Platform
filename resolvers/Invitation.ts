import { Event, IInvitation, User } from '../datamodel/db-schema';

export function from(parent: IInvitation) {
    return User.findById(parent.from);
}

export function invited(parent: IInvitation) {
    return User.findById(parent.invited);
}

export function to(parent: IInvitation) {
    return Event.findById(parent.to);
}
