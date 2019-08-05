import React, { Component } from 'react';
import styled from 'styled-components';
import Comment from './Comment';
import Link from "next/link";

const StyledFullSubmission = styled.article`
    position: relative;
    margin: .5rem;
    border-radius: 0 2px 2px 0;
    width: 100%;
    padding: .5rem 1.25rem;
    max-width: 1000px;
    overflow: hidden;
    overflow-wrap: break-word;
    word-wrap: break-word;
    text-overflow: ellipsis;
    white-space: nowrap;
    :before {
        content: '';
        background: ${props => props.theme.blue};
        z-index: -1;
        width: .5rem;
        height: 100%;
        position: absolute;
        left: 0;
        top: 0;
        opacity: .8
    }
    h3 {
        font-size: 3rem;
        cursor: pointer;
        margin: 0rem;
        line-height: 1;
        color: ${props => props.theme.white};
    }
    div.meta {
        color: ${props => props.theme.lightGrey};
    }
    p.meta, a.SubTitleLink {
        /* color: ${props => props.theme.lightGrey}; */
        font-size: 1.25rem;
        line-height: 1;
        opacity: .6;
        margin: 0;
    }
    a.SubTitleLink {
        font-style: italic;
        text-decoration: underline;
        margin-right: .5rem;
    }
    p {
        margin: 1rem 0;
        font-size: 1.5rem;
        color: ${props => props.theme.white};
    }
    h5 {
        font-size: 2rem;
        margin: 0 0 1.5rem;
        text-align: center;
    }
    .narratives {
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.25rem;
        margin: 3rem auto;
        text-align: center;
        border-top: 1px solid hsla(0, 0%, 80%, .1);
        border-bottom: 1px solid hsla(0, 0%, 80%, .1);
        padding: 1rem 0;
        h5 {
            color: ${props => props.theme.green};
            font-size: 1.5rem;
            font-weight: 500;
            display: inline;
            margin: 0 .5rem 0 0;
        }
        span {
            margin: 0 .25rem;
        }
    }
    .commentsContainer {
        margin-top: 3rem;
    }
`;

class FullSubmission extends Component {
    render() {      
        const {thing} = this.props;

        let narratives;
        if (thing.partOfNarratives) {
            const narrativeLinks = thing.partOfNarratives.map((narrative, index) => {
                if(index < thing.partOfNarratives.length - 1) {
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
            narratives = <div className="narratives"><h5>PART OF:</h5> {narrativeLinks}</div>
        }

        let comments;
        if (thing.comments.length > 0) {
            const commentItems = thing.comments.map(comment => <Comment data={comment} />);
            comments = <div className="commentsContainer"><h5 className="comments">COMMENTS</h5>{commentItems}</div>;
        }

        return (
            <StyledFullSubmission>
                <h3>{thing.title}</h3>
                <div className="meta">
                    <a className="SubTitleLink" href={thing.url}>{thing.url}</a>
                    <p className="meta">Created at {thing.createdAt} by {thing.author.displayName}</p>
                </div>
                <p>{thing.description}</p>
                {narratives}
                {comments}
            </StyledFullSubmission>
        );
    }
}

export default FullSubmission;