import { ApolloServer } from 'apollo-server-express';
import { DocumentNode } from 'graphql';
import { CTX } from './setup';

export async function query(
    s: ApolloServer,
    query: DocumentNode,
    variables?: { [k: string]: any },
) {
    const resp = await s.executeOperation({ query, variables }, CTX);
    if (resp.errors) {
        throw resp.errors[0];
    } else if (!resp.data) {
        throw new Error('empty response');
    } else {
        return resp.data;
    }
}
