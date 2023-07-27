import { ApolloServer, ExpressContext } from 'apollo-server-express';
import { ApolloServerPluginLandingPageGraphQLPlayground } from 'apollo-server-core';
import { Types } from 'mongoose';
import typeDefs from './datamodel/gql-schema';
import resolvers from './resolvers';
import session from 'express-session';
import { applyMiddleware } from 'graphql-middleware';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { Role } from './datamodel/db-schema';
import { permissions } from './permissions';
import { permissions as rbac_permissions } from './rb_permissions';

export interface ISession extends session.Session {
    user?: {
        _id: string
        role: Role
        username: string
    }
}

export interface IContext {
    session: ISession
}

export function server(): ApolloServer {
    const schema = makeExecutableSchema({ typeDefs, resolvers });
    return new ApolloServer({
        schema: applyMiddleware(schema, process.env.RBAC ? rbac_permissions : permissions),
        context: (ctx: ExpressContext) => ({ session: ctx.req.session }),
        plugins: [
            ApolloServerPluginLandingPageGraphQLPlayground({
                settings: {
                    'request.credentials': 'same-origin',
                },
            }),
        ],
    });
}
