import React, { Component } from 'react';
import { Query } from 'react-apollo';
import gql from 'graphql-tag';
import styled from 'styled-components';
import Link from 'next/link';

const ALL_NARRATIVES_QUERY = gql`
    query ALL_NARRATIVES_QUERY {
        narratives(last:12) {
            id
            title
        }
    }
`;

const StyledNarrativesBar = styled.div`
    width: 97.5%;
    margin: 8rem auto 0rem;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-wrap: wrap;
    line-height: 1.4;
    h5 {
        color: ${props => props.theme.primaryAccent};
        display: inline;
        font-size: 2.5rem;
        margin: 0 .5rem 0 0;
        font-weight: 500;
    }
    span {
        margin: 0 .5rem 0 0;
    }
    a {
        font-size: 2.25rem;
        color: ${props => props.theme.highContrastGrey};
        &:hover {
            color: ${props => props.theme.mainText};
        }
        &:visited {
            color: ${props => props.theme.highContrastGrey};
        }
    }
`;

class NarrativesBar extends Component {
    render() {
        return (
            <Query query={ALL_NARRATIVES_QUERY}>
                {
                    ({ data, error, loading }) => {
                        if (loading) return <p>Loading...</p>
                        if (error) return <p>Error: {error.message}</p>
                        return <StyledNarrativesBar>
                            <h5>NARRATIVES: </h5>
                            {
                                data.narratives.map((narrative, index) => {
                                    if(index < data.narratives.length - 1) {
                                        return (
                                            <span key={narrative.title}>
                                                <Link 
                                                    href={{
                                                        pathname: '/narrative',
                                                        query: {
                                                            id: narrative.id
                                                        }
                                                        
                                                    }}
                                                    
                                                >
                                                    <a>{narrative.title}</a>
                                                </Link>, 
                                            </span>
                                        )
                                    } else {
                                        return (
                                            <span key={narrative.title}>
                                                <Link 
                                                    href={{
                                                        pathname: '/narrative',
                                                        query: {
                                                            id: narrative.id
                                                        }
                                                    }}
                                                    
                                                >
                                                    <a>{narrative.title}</a>
                                                </Link>
                                            </span>
                                        )
                                    } 
                                })
                            }
                        </StyledNarrativesBar>
                    }
                }
            </Query>
        );
    }
}

export default NarrativesBar;