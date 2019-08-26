import styled from "styled-components";
import gql from "graphql-tag";
import { Query } from "react-apollo";
import Head from "next/head";
import Error from "../components/ErrorMessage";
import Thing from "../components/Thing";
import LittleThing from "../components/LittleThing";
import TinyThing from "../components/TinyThing";

const NARRATIVE_THINGS_QUERY = gql`
   query NARRATIVE_THINGS_QUERY($id: ID!) {
      narrative(where: { id: $id }) {
         title
      }
      storiesConnection(where: { partOfNarratives_some: { id: $id } }) {
         edges {
            node {
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
      }
      submissionsConnection(where: { partOfNarratives_some: { id: $id } }) {
         edges {
            node {
               id
               title
               url
               author {
                  displayName
               }
               createdAt
            }
         }
      }
   }
`;

const NarrativeContainer = styled.div`
   width: 96%;
   margin: auto;
   h2 {
      text-align: center;
      font-size: ${props => props.theme.smallHead};
      font-weight: 500;
      margin: 4rem 0;
      span {
         color: ${props => props.theme.green};
      }
   }
   div.thingGrid {
      display: grid;
      grid-template-columns: 1fr;
      grid-auto-rows: auto;
      @media screen and (min-width: 1400px) {
         grid-template-columns: 1fr 1fr 1fr;
      }
      grid-gap: 6rem;
      justify-content: space-around;
      align-items: stretch;
   }
   p.nothing {
      grid-column: 1 / -1;
      font-size: ${props => props.theme.bigText};
      text-align: center;
   }
`;

const NarrativeFeed = props => (
        <Query query={NARRATIVE_THINGS_QUERY} variables={{
            id: props.query.id,
        }}>
            {
                ({error, loading, data}) => {
                    if (error) return <Error error={error} />
                    if (loading) return <p>Loading...</p>
                    console.log(data.storiesConnection.edges);
                    if (data.storiesConnection.edges.length === 0 && data.submissionsConnection.edges.length === 0) {
                        return (
                            <NarrativeContainer>
                                <Head>
                                    <title>{data.narrative.title} - Our Dailies</title>
                                </Head>
                                <h2><span>NARRATIVE:</span> {data.narrative.title}</h2>
                                <div className="thingGrid">
                                    <p className="nothing">No things found for that Narrative</p>
                                </div>
                            </NarrativeContainer>
                        )
                    }

                    const stories = data.storiesConnection.edges.map((story, index) => index === 0 ? <Thing thing={story.node} key={story.node.id} /> : <LittleThing thing={story.node} key={story.node.id} />);
                    const submissions = data.submissionsConnection.edges.map(submission => <TinyThing thing={submission.node} key={submission.node.id} />);

                    return (
                        <NarrativeContainer>
                            <Head>
                                <title>{data.narrative.title} - Our Dailies</title>
                            </Head>
                            <h2><span>NARRATIVE:</span> {data.narrative.title}</h2>
                            <div className="thingGrid">
                                {stories}
                                {submissions}
                            </div>
                        </NarrativeContainer>
                    )
                }
            }
        </Query>
    );

export default NarrativeFeed;
