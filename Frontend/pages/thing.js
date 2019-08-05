import styled from 'styled-components';
import gql from 'graphql-tag';
import { Query } from 'react-apollo';
import Head from 'next/head';
import FullStory from '../components/FullStory';
import FullSubmission from '../components/FullSubmission';
import Error from '../components/ErrorMessage';


const SINGLE_SUBMISSION_QUERY = gql`
    query SINGLE_SUBMISSION_QUERY($id: ID!) {
        submission(where: { id: $id }) {
            id
            title
            url
            description
            author {
                displayName
            }
            partOfNarratives {
                id
                title
            }
            createdAt
        }
        commentsConnection(where:{onSubmission:{id: $id}}) {
            edges {
                node {
                    id
                    author {
                        displayName
                    }
                    comment
                    createdAt
                    updatedAt
                }
            }
        }
    }
`;
const SINGLE_STORY_QUERY = gql`
    query SINGLE_STORY_QUERY($id: ID!) {
        story(where: { id: $id }) {
            id
            title
            createdAt
            featuredImage
            summary
            partOfNarratives {
                id
                title
            }
            includedSubmissions {
                id
                title
                url
                author {
                    displayName
                }
                createdAt
            }
            includedLinks {
                title
                url
            }
            createdAt
            updatedAt
        }
        commentsConnection(where:{onStory:{id: $id}}) {
            edges {
                node {
                    id
                    author {
                        displayName
                    }
                    comment
                    createdAt
                    updatedAt
                }
            }
        }
    }
`;

const SingleThingContainer = styled.div`
    display: flex;
    justify-content: center;
    article {
        flex-grow: 1;
    }
`;

const SingleThing = props => {
    let queryType;
    if(props.query.type === "submission") {
        queryType = SINGLE_SUBMISSION_QUERY
    } else if(props.query.type === "story") {
        queryType = SINGLE_STORY_QUERY
    };
    return (<Query query={queryType} variables={{
        id: props.query.id,
    }}>
        {({error, loading, data}) => {
            if (error) return <Error error={error} />
            if (loading) return <p>Loading...</p>
            let thingComponent;
            let title;
            if (!data.submission && !data.story) {
                return <p>No thing found</p>
            } else {
                if (data.submission) {
                    data.submission.comments = data.commentsConnection.edges;
                    thingComponent = <FullSubmission thing={data.submission} />
                    title = data.submission.title;
                }
                else if(data.story) {
                    data.story.comments = data.commentsConnection.edges;
                    thingComponent = <FullStory thing={data.story} />
                    title = data.story.title;
                }
            }
            
            return (
                <SingleThingContainer>
                    <Head>
                        <title>{title} - Our Dailies</title>
                    </Head>
                    {thingComponent}
                </SingleThingContainer>
            )
        }}
    </Query>)
};

export default SingleThing;