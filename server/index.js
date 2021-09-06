"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var graphql_yoga_1 = require("graphql-yoga");
var CHAT_CHANNEL = "CHAT_CHANNEL";
var pubsub = new graphql_yoga_1.PubSub();
var messages = [];
var typeDefs = "\n  type ChatMessage {\n    id: ID!\n    from: String!\n    text: String!\n  }\n  type Query {\n    messages: [ChatMessage]!\n  }\n  type Mutation {\n    add(text: String!, from: String!): ChatMessage\n  }\n  type Subscription {\n    messages: [ChatMessage]!\n  }\n";
var resolvers = {
    Query: {
        messages: function () {
            return messages;
        },
    },
    Mutation: {
        add: function (_, _a, _b) {
            var text = _a.text, from = _a.from;
            var pubsub = _b.pubsub;
            var newMessage = {
                id: String(messages.length + 1),
                text: text,
                from: from,
            };
            messages.push(newMessage);
            pubsub.publish(CHAT_CHANNEL, { messages: messages });
            return newMessage;
        },
    },
    Subscription: {
        messages: {
            subscribe: function () {
                var iterator = pubsub.asyncIterator(CHAT_CHANNEL);
                pubsub.publish(CHAT_CHANNEL, { messages: messages });
                return iterator;
            },
        },
    },
};
var server = new graphql_yoga_1.GraphQLServer({
    typeDefs: typeDefs,
    resolvers: resolvers,
    context: { pubsub: pubsub },
});
server.start(function () { return console.log("Server is running on http://localhost:4000"); });
