import React, { Component } from 'react';
import { Query } from 'react-apollo';
import gql from 'graphql-tag';
import styled from 'styled-components';
import Thing from './Thing';

const ALL_THINGS_QUERY = gql`
    query ALL_THINGS_QUERY {
        things {
            id
            title
            link
            createdAt
        }
    }
`;

const ThingContainer = styled.div`
    width: 96%;
    margin: auto;
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    grid-gap: 1rem;
    justify-content: space-around;
`;

class Things extends Component {
    render() {
        return (
            <div>
                <Query query={ALL_THINGS_QUERY}>
                    {
                        ({ data, error, loading }) => {
                            if (loading) return <p>Loading...</p>
                            if (error) return <p>Error: {error.message}</p>
                            return <ThingContainer>
                                {data.things.map(thing => <Thing thing={thing} key={thing.id} />)}
                            </ThingContainer>
                        }
                    }
                </Query>
            </div>
        );
    }
}

export default Things;