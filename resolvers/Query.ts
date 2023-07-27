import { Event, User } from '../datamodel/db-schema';
import { mapIds } from './util';

type IdQuery = { ids: string[] };

export function users(parent: object, { ids }: IdQuery, ctx: object, info: object) {
    return User.find({ _id: { $in: mapIds(ids) } });
}

type NamesQuery = { names: string[] };

export function usersByUsername(parent: undefined, { names }: NamesQuery) {
    return User.find({ username: { $in: names } });
}

export function events(parent: object, { ids }: IdQuery, ctx: object, info: object) {
    return Event.find({ _id: { $in: mapIds(ids) } });
}
