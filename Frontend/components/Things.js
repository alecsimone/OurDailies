import React, { Component } from 'react';
import { Query } from 'react-apollo';
import gql from 'graphql-tag';
import styled from 'styled-components';
import Thing from './Thing';
import LittleThing from './LittleThing';
import TinyThing from './TinyThing';

const ALL_THINGS_QUERY = gql`
    query ALL_THINGS_QUERY {
        submissions {
            id
            title
            url
            author {
                displayName
            }
            description
            createdAt
        }
        stories(orderBy:updatedAt_DESC) {
            id
            title
            featuredImage
            createdAt
            partOfNarratives {
                id
                title
            }
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
                            {data.stories.map((story, index) => index === 0 ? <Thing thing={story} key={story.id} /> : <LittleThing thing={story} key={story.id} />)}
                        </ThingContainer>
                    }
                }
            </Query>
        );
    }
}

export default Things;
export { ALL_THINGS_QUERY };