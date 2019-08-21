import React, { Component } from 'react';
import { Query } from 'react-apollo';
import gql from 'graphql-tag';
import styled from 'styled-components';
import Thing from './Thing';
import LittleThing from './LittleThing';
import TinyThing from './TinyThing';

const ALL_THINGS_QUERY = gql`
    query ALL_THINGS_QUERY {
        things(orderBy:updatedAt_DESC) {
            id
            title
            author {
                displayName
            }
            featuredImage
            originalSource
            summary
            partOfNarratives {
                id
                title
            }
            createdAt
        }
    }
`;

const ThingContainer = styled.div`
    width: 96%;
    margin: auto;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
    grid-auto-rows: auto;
    /* @media screen and (min-width: 1400px) {
        grid-template-columns: 1fr 1fr 1fr;
    } */
    grid-gap: 6rem;
    justify-content: space-around;
    align-items: stretch;
`;

class Things extends Component {
    render() {
        return (
            <Query query={ALL_THINGS_QUERY}>
                {
                    ({ data, error, loading }) => {
                        if (loading) return <p>Loading...</p>
                        if (error) return <p>Error: {error.message}</p>
                        return <ThingContainer>
                            {data.things.map((thing, index) => index === 0 ? <Thing thing={thing} key={thing.id} /> : <LittleThing thing={thing} key={thing.id} />)}
                        </ThingContainer>
                    }
                }
            </Query>
        );
    }
}

export default Things;
export { ALL_THINGS_QUERY };