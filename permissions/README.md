## Files

File | Explanation
-----|------------
`index.ts` | Contains the GraphQL Shield permissions
`rules.ts` | Contains reusable rules
`util.ts` | Contains helper function

## Naming Conventions

The rules in `rules.ts` follow naming conventions:
* `caller` means the user currently logged in
* `arg` means the argument to the resolver
* `parent` means the object currently being resolved

Given this conventions, what each rule does should be clear from its signature
and its name.
