import { server } from '.';
import express from 'express';
import session from 'express-session';
import { connect, set } from 'mongoose';

export async function start() {
    await connect(
        'mongodb://gql:gql@localhost:27017/gql-proj',
        // Don't worry about what these options do. They are recommended but not
        // default because of legacy support. Effectively, they suppress
        // deprecation warnings.
        {
            useNewUrlParser: true,
            useFindAndModify: false,
            useUnifiedTopology: true,
            useCreateIndex: true,
        },
    );
    // Update queries should return the updated document by default
    set('returnOriginal', false);

    const s = server();
    await s.start();

    const app = express();
    app.use(session({
        resave: true,
        saveUninitialized: true,
        secret: 'gql-proj',     // this should be loaded from environment!
    }));

    s.applyMiddleware({ app });

    app.listen(4000);
    console.log(`Server ready at http://localhost:4000${s.graphqlPath}`);
}

start().then();
