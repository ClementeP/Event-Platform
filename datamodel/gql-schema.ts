import { gql } from 'apollo-server-express';

const typeDefs = gql`
    enum Role {
        FREE
        PREMIUM
        MODERATOR
        ADMINISTRATOR
    }

    type Category {
        _id: ID!
        name: String!
        moderators: [User!]!
        subscribers: [User!]!
        events: [Event!]!
    }

    input EditCategory {
        _id: ID!
        name: String
    }

    type User {
        _id: ID!
        role: Role!
        username: String!
        name: String!
        surname: String!
        subscribes: [Category!]!
        invitations: [Invitation!]!
        invites: [Invitation!]!
        requests: [Event!]!
        attends: [Event!]!
        moderates: [Category!]!
        authored: [Post!]!
    }

    # TODO: Use this type
    input CreateUser {
        username: String!
        name: String!
        surname: String!
        password: String!
    }

    input EditUser {
        _id: ID!
        name: String
        surname: String
        password: String
    }

    type Invitation {
        _id: ID!
        from: User!
        invited: User!
        to: Event!
    }

    # TODO: Make this input type obsolete
    input EditInvitation {
        _id: ID!
        from: ID
        invited: ID
        to: ID
    }

    scalar Date
    type Event {
        _id: ID!
        title: String!
        time: Date!,
        description: String
        location: String!
        owner: User!
        private: Boolean!
        managers: [User!]!
        categories: [Category!]!
        attendants: [User!]!
        invited: [Invitation!]!
        requests: [User!]!
        messageBoard: [Post!]!
    }

    # TODO: Use this type
    input CreateEvent {
        """
        Category primary keys or names
        """
        categories: [ID!]
        title: String!
        time: Date!
        description: String
        location: String!
        private: Boolean!
    }

    input EditEvent {
        _id: ID!
        title: String
        time: Date
        description: String
        location: String
        # TODO: Remove this argument
        owner: ID
        private: Boolean
    }

    type Post {
        _id: ID!
        content: String!
        flagged: Boolean!
        locked: Boolean!
        author: User!
        postedAt: Event!
    }

    # TODO: Use this type
    input CreatePost {
        postedAt: ID!
        content: String!
    }

    # TODO: Make this type obsolete
    input EditPost {
        _id: ID!
        content: String
        locked: Boolean
        author: ID
        reviewer: ID
        postedAt: ID
    }

    type Query {
        users(ids: [ID!]): [User]
        usersByUsername(names: [String!]!): [User]
        events(ids: [ID!]): [Event]
    }

    type Mutation {
        # Categories
        createCategory(name: String! ): Category
        editCategory(category: EditCategory): Category
        deleteCategory(category: ID!): Category
        assignModerator(category: ID!, user: ID!): Category
        removeModerator(category: ID!, user: ID!): Category

        # Users
        createUser(user: CreateUser! ): User
        login(username: String!, password: String!): Boolean!
        editUser(user: EditUser!): User
        setRole(user: ID!, role: Role!): User
        deleteUser(user: ID!): User
        subscribe(categories: [ID!]!): User!
        unsubscribe(categories: [ID!]!): User!

        # Events
        createEvent( event: CreateEvent!): Event
        editEvent(event: EditEvent!): Event
        addCategories(categories: [ID!]!, event: ID!): Event
        removeCategories(categories: [ID!]!, event: ID!): Event
        deleteEvent(event: ID!): Event

        # Event management
        kick(user: ID!, event: ID!): Event
        promote(user: ID!, event: ID!): Event
        demote(user: ID!, event: ID!): Event
        # addAttendant(user: ID!, event: ID!): Event

        # Invitations
        # createInvitation: Invitation
        # editInvitation(invitation: EditInvitation!): Invitation
        # deleteInvitation(invitation: ID!): Invitation
        invite(user: ID!, event: ID!): Invitation
        acceptInvitation(invitation: ID!): Event
        declineInvitation(invitation: ID!): Event

        # Requests
        request(event: ID!): Event
        # removeRequest(user: ID!, event: ID!): Event
        acceptRequest(user: ID!, event: ID!): Event
        declineRequest(user: ID!, event: ID!): Event

        # Posts
        createPost( post: CreatePost! ): Post
        # editPost(post: EditPost!): Post
        deletePost(post: ID!): Post
        flagPost(post: ID!): Post
        # clearPost(post: ID!): Post
        review(post: ID!, locked: Boolean!): Post
        unlockPost(post: ID!): Post
    }
`;
export default typeDefs;
