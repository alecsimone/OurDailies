import React, { Component } from 'react';
import styled from 'styled-components';
import Link from 'next/link';
import VoteBar from './VoteBar';

const StyledLittleThing = styled.article`
    max-width: 600px;
    width: 100%;
    position: relative;
    padding: 0 1rem;
    margin-bottom: 4rem;
    justify-self: center;
    background: hsla(210, 40%, 40%, .07);
    :before {
        content: '';
        background: ${props => props.theme.majorColor};
        z-index: -1;
        width: 100%;
        height: 2.75rem;
        position: absolute;
        top: -1.25rem;
        left: 0;
        opacity: .8;
        border-radius; 2px;
    }
    div.lede {
        width: calc(100% - 2rem;);
        height: 400px;
        position: relative;
        h3 {
            position: absolute;
            bottom: 0;
            left: 0;
            margin: 0;
            width: 100%;
            font-size: 3.5rem;
            text-shadow: 0 3px 6px black;
            z-index: 2;
            padding: 6rem 1.5rem 1.5rem;
            background: -moz-linear-gradient(top,  rgba(0,0,0,0) 0%, rgba(0,0,0,.8) 10rem, rgba(0,0,0,1) 100%); /* FF3.6-15 */
            background: -webkit-linear-gradient(top,  rgba(0,0,0,0) 0%,rgba(0,0,0,.8) 10rem,rgba(0,0,0,1) 100%); /* Chrome10-25,Safari5.1-6 */
            background: linear-gradient(to bottom,  rgba(0,0,0,0) 0%,rgba(0,0,0,.8) 10rem,rgba(0,0,0,1) 100%); /* W3C, IE10+, FF16+, Chrome26+, Opera12+, Safari7+ */
            filter: progid:DXImageTransform.Microsoft.gradient( startColorstr='#00000000', endColorstr='#000000',GradientType=0 ); /* IE6-9 */
        }
        img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            z-index: -2;
        }
    }
    p.meta {
        color: ${props => props.theme.darkGrey};
        font-style: italic;
        margin: .5rem 1.5rem;
    }
    div.narratives {
        margin: 6rem 1.5rem 3rem;
        h5 {
            color: ${props => props.theme.primaryAccent};
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
    .VoteBarWrapper {
        width: calc(100% + 2rem);
        margin-left: -1rem;
    }
`;

class LittleThing extends Component {
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
        const narratives = <div className="narratives"><h5>PART OF</h5>{narrativeLinks}</div>

        return( 
            <StyledLittleThing>
                <div className="lede">
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
                    <img src={data.featuredImage} />
                </div>
                <p className="meta">{data.createdAt}</p>
                {narratives}
                <div className="VoteBarWrapper"><VoteBar /></div>
            </StyledLittleThing>
        )
    }
}

export default LittleThing