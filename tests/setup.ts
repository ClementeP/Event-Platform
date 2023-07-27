import { IContext, ISession } from '..';
import { connect, connection, set } from 'mongoose';
import { Category, Event, Invitation, IUser, Role, User } from '../datamodel/db-schema';
import { ExpressContext } from 'apollo-server-express';
import { Request } from 'express';
import { hash, compare, hashSync } from 'bcrypt';


interface IMockContext extends ExpressContext {
    req: IContext & Request,
};

export const CTX = {
    req: { session: {} },
} as any as IMockContext;

export function logout() {
    delete CTX.req.session.user;
}

export async function loginAs(what: Role | IUser) {
    let user: Role | IUser | null = what;
    if (typeof what === 'string') {
        user = await User.findOne({ role: what });
        if (!user) {
            throw new Error(`Could not find user with role ${what}`);
        }
    }
    const { _id, role, username } = user as IUser;
    CTX.req.session.user = { _id: _id.toHexString(), role, username };
}

export async function dbConnect() {
    await connect(
        'mongodb://gql:gql@localhost:27017/gql-test',
        {
            useNewUrlParser: true,
            useFindAndModify: false,
            useUnifiedTopology: true,
            useCreateIndex: true,
        },
    );
    set('returnOriginal', false);
}

export async function dbDisconnect() {
    await connection.close();
}

export async function dbSetup() {
    await Promise.all([
        Category.deleteMany({}),
        User.deleteMany({}),
        Event.deleteMany({}),
        Invitation.deleteMany({}),
    ]);

    

    const [party, education] = await Category.create([
        { name: 'Party' },
        { name: 'Education' },
        { name: 'Business' },
    ]);

    const [fred, paula, ada ] = await User.create([
        {
            role: Role.FREE,
            username: 'fred',
            name: 'fred',
            surname: 'fred',
            subscribes: [party._id, education._id],
            password: 'unhashed',
        },
        {
            role: Role.MODERATOR,
            username: 'paula',
            name: 'paula',
            surname: 'paula',
            subscribes: [party._id, education._id],
            password:await hash('unhashed', 8),
        },
        {
            role: Role.ADMINISTRATOR,
            username: 'ada',
            name: 'ada',
            surname: 'ada',
            subscribes: [party._id, education._id],
            password: 'unhashed',
        }
    ]);
    

    const [partyFred, lectureFred, partyPaula, lecturePaula] = await Event.create([
        {
            title: 'Party of Fred',
            time: new Date(),
            location: 'Freiburg',
            owner: fred._id,
            categories: [party._id],
            managers: [fred._id  ],
            attendants: [fred._id , paula._id],
            
        },
        {
            title: 'Lecture of Fred',
            time: new Date(),
            location: 'Freiburg',
            owner: fred._id,
            categories: [education._id],
            managers: [fred._id],
            attendants: [fred._id ],
        },
        {
            title: 'Party of Paula',
            time: new Date(),
            location: 'Paris',
            owner: paula._id,
            categories: [party._id],
            managers: [paula._id, ada._id],
            attendants: [paula._id, ada._id],
            
        },
        {
            title: 'Party of Paula',
            time: new Date(),
            location: 'Paris',
            owner: paula._id,
            categories: [education._id],
            managers: [paula._id, ada._id],
            attendants: [paula._id, ada._id],
        },
    ]);

    return {
        Users: { fred, paula, ada },
        Categories: { party, education },
        Events: { partyFred, lectureFred, partyPaula, lecturePaula },
    };
}
