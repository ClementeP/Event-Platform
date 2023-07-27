db.getSiblingDB('gql-proj').createUser({
    user: 'gql',
    pwd: 'gql',
    roles: [{
        role: 'readWrite',
        db: 'gql-proj',
    }],
});
db.getSiblingDB('gql-test').createUser({
    user: 'gql',
    pwd: 'gql',
    roles: [{
        role: 'readWrite',
        db: 'gql-test',
    }],
});
