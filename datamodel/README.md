## Files
File | Explanation
-----|------------
`gql-schema.ts` | Contains the GraphQL API model
`db-schema.ts` | Contains the mongoose database scheme

## Database Scheme

Import the models of `schema.ts` to interface with the database.
For example:
```ts
import { User } from './db-schema';

const user = User.findById(...);
```
