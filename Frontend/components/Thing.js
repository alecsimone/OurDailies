import React, { Component } from 'react';
import styled from 'styled-components';
import Link from 'next/link';
import VoteBar from './VoteBar';

const StyledThing = styled.article`
    position: relative;
    padding: 0 1rem;
    grid-column: 1 / -1;
    div.body {
        position: relative;
        height: calc(720px + 2rem);
        :before {
            content: '';
            background: ${props => props.theme.blue};
            z-index: -1;
            width: 5rem;
            height: 100%;
            position: absolute;
            right: -1.5rem;
            top: 0;
            opacity: .8;
            border-radius; 2px;
        }
        .imageWrapper {
            width: 1280px;
            max-width: 77%;
            height: 720px;
            position: absolute;
            right: 0;
            top: 1rem;
            z-index: -1;
            img.featuredImage {
                object-fit: cover;
                width: 100%;
                height: 100%;
            }
            :after {
                content: ' ';
                z-index: 0;
                display: block;
                position: absolute;
                top: -20;
                bottom: 0;
                left: 0;
                right: 0;
                width: 1280px;
                height: 720px;
                background: hsla(0, 0%, 0%, .4);
            }
        }
        .TopInfo {
            padding: 6rem 3rem;
            width: 60%;
            z-index: 1;
            h3 {
                font-size: 6rem;
                text-shadow: 0px 3px 6px black;
                margin: 0;
                background: hsla(0, 0%, 0%, .75);
                border-radius: 4px;
                padding: 0 1rem;
            }
            p {
                color: ${props => props.theme.darkGrey};
                font-style: italic;
            }
        }
        .BottomInfo {
            width: 20%;
            position: absolute;
            left: 3rem;
            bottom: 6rem;
            h5 {
                color: ${props => props.theme.green};
                font-size: 2.75rem;
                font-weight: 400;
                margin: 0 0 1rem;
            }
            span {
                margin-right: .5rem;
            }
            a {
                color: ${props => props.theme.lightGrey};
                font-size: 2rem;
                font-weight: 300;
            }
        }
    }
    .VoteBarWrapper {
        width: calc(100% + 2rem);
    }
`;

const HalfSizedThing = styled.article`
    width: 600px;
    position: relative;
    padding: 0 1rem;
    margin-bottom: 4rem;
    div.body {
        position: relative;
        :before {
            content: '';
            background: ${props => props.theme.blue};
            z-index: -1;
            width: 100%;
            height: 2.75rem;
            position: absolute;
            top: -1.25rem;
            left: 0;
            opacity: .8;
            border-radius; 2px;
        }
        .TopInfo {
            padding-top: 56.25%;
        }
        .imageWrapper {
            width: calc(100% - 1.5rem);
            height: 300px;
            padding-bottom: 56.25%;
            position: absolute;
            top: 0;
            left: .75rem;
            z-index: -1;
            overflow: hidden;
            img.featuredImage{
                width: 100%;
                object-fit: cover;
            }
            :after {
                content: ' ';
                background: hsla(0, 0%, 0%, .4);
                z-index: 2;
                position: absolute;
                display: block;
                top: 0;
                bottom: 0;
                left: 0;
                right: 0;
            }
        }
    }
`;

class Thing extends Component {
    render() {
        const data = this.props.thing;

        const narrativeLinks = data.partOfNarratives.map((narrative, index) => {
            if(index < data.partOfNarratives.length - 1) {
                return (
                    <span>
                        <Link href={{
                            pathname: '/narrative',
                            query: {
                                id: narrative.id
                            }
                        }}>
                            <a>{narrative.title}</a>
                        </Link>, 
                    </span>
                )
            } else {
                return (
                    <span>
                        <Link href={{
                            pathname: '/narrative',
                            query: {
                                id: narrative.id
                            }
                        }}>
                            <a>{narrative.title}</a>
                        </Link>
                    </span>
                )
            }
        });
        const narratives = <div><h5>PART OF</h5>{narrativeLinks}</div>

        return (
            <StyledThing>
                <div className="body">
                    <div className="TopInfo">
                        <h3>
                            <Link href={{
                                pathname: '/thing',
                                query: {
                                    id: data.id,
                                    type: "story",
                                }
                            }}>
                                <a>{data.title}</a>
                            </Link>
                        </h3>
                        <p>{data.createdAt}</p>
                    </div>
                    <div className="BottomInfo">
                        {narratives}
                    </div>
                    <div className="imageWrapper">
                        <img className="featuredImage" src={data.featuredImage} />
                    </div>
                </div>
                <div className="VoteBarWrapper"><VoteBar /></div>
            </StyledThing>
        );
    }
}

export default Thing;