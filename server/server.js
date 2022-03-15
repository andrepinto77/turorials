const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const { buildSchema} = require('graphql');

const schema = buildSchema(`
    type Message {
        id: ID!
        content: String
        author: String
    }
    
    input MessageInput {
        content: String
        author: String
    }
  
    type Mutation {
        createMessage(input: MessageInput): Message
        updateMessage(id: ID!, input: MessageInput): Message
    }
    
    type Query {
        getMessage(id: ID!): Message
        messages: [Message]
    }
`);

class Message {
    constructor(id, {content, author}) {
        this.id = id;
        this.content = content;
        this.author = author;
    }
}


const fakeDatabase = {};

const root = {
    createMessage: ({ input }) => {
        const id = require('crypto').randomBytes(10).toString('hex');

        fakeDatabase[id] = input;

        return new Message(id, input);
    },

    updateMessage: ({ id, input }) => {
        if (!fakeDatabase[id]) {
            throw new Error('no message with id: ' + id);
        }

        fakeDatabase[id] = input;

        return new Message(id, input);
    },

    getMessage: ({ id }) => {
        if (!fakeDatabase[id]) {
            throw new Error('no message with id: ' + id);
        }

        return new Message(id, fakeDatabase[id])
    },

    messages: () => Object.keys(fakeDatabase).map((key) => new Message(key, fakeDatabase[key]))
};

const app = express();
app.use('/graphql', graphqlHTTP({
    schema,
    rootValue: root,
    graphiql: true
}));

app.listen(4000);

console.log('running on :4000')
