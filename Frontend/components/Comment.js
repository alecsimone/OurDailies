import React, { Component } from 'react';
import styled from 'styled-components';

const StyledComment = styled.div`
    max-width: 800px;
    margin: .75rem 0;
    font-size: 1.6rem;
    line-height: 1.5;
    background: hsla(0, 0%, 15%, .1);
    padding: .75em;
    span.commenter {
        color: ${props => props.theme.blue};
        margin-right: .5rem;
    }
    .commentMeta {
        font-size: .75em;
        margin-top: .25em;
        color: ${props => props.theme.lightGrey};
        opacity: .6;
    }
`;

class Comment extends Component {
    render() {
        const data = this.props.data.node;
        return (
            <StyledComment>
                <div className="commentContent">
                    <span className="commenter">{data.author.displayName}</span>
                    {data.comment}
                </div>
                <div className="commentMeta">
                    {data.createdAt}
                </div>
            </StyledComment>
        );
    }
}

export default Comment;