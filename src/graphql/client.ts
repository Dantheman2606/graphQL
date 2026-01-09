import { ApolloClient, InMemoryCache, ApolloLink, HttpLink } from '@apollo/client';

const httpLink = new HttpLink({
    uri: 'http://13.200.172.225:1337/graphql',
});

const authMiddleware = new ApolloLink((operation, forward) => {
    const token = localStorage.getItem('token');
    operation.setContext({
        headers: {
            authorization: token ? `Bearer ${token}` : '',
        },
    });
    return forward(operation);
});

export const client = new ApolloClient({
    link: ApolloLink.from([authMiddleware, httpLink]),
    cache: new InMemoryCache(),
});
