# Event Platform in GraphQL

Project of the course [Security Engineering](https://www.vorlesungen.ethz.ch//Vorlesungsverzeichnis/lerneinheit.view?lerneinheitId=148048&semkez=2021W&lang=en) at ETH.
We implemented the access control of a web application for managing events. For the project, we used [GraphQl Shield](https://the-guild.dev/graphql/shield). 
Implementation by Clemente Paste and Freya Murphy.

## Setup

To run and build the project, you need to install:
* [node](https://nodejs.org/en/download/)
* [docker](https://www.docker.com/get-started)

After you have installed the tools necessary, you need to setup a database.
For this, execute the following commands:
```sh
cd scripts
./db.ps1
./setup.ps1
```

Whenever you want to connect to the database, you can execute `scripts/mongo.ps1` to open a mongodb shell.

To compile and start the server, you initially need to run `npm install` once.
Then, you first need to start the database (`scripts/start.ps1`, might be necessary after rebooting, too) and then run one of the commands
* `npm run server` (project part II)
* `npm run server-rbac` (project part III)


## The Repository

To provide you with an overview of the repository, we list all important folders and files here.
Respective folders contain another README detailing how they work.

File | Explanation
-----|------------
`index.ts` | Provides an API to create the GraphQL server
`start.ts` | Script to run the server
`datamodel/` | Contains all datamodel definitions
`permissions/` | Contains access control rules written in graphql-shield 
`rb_permissions/` | Contains role-based access control rules written in  graphql-shield 
`resolvers/` | Contains all GraphQL resolvers for the scheme `datamodel/gql-schema.ts`
`scripts/` | Contains database scripts
`tests/` | Contains test cases

