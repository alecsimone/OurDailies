import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import Link from 'next/link';

const StyledThing = styled.article`
    position: relative;
    margin: .5rem;
    background: hsla(0, 0%, 50%, .1);
    padding: .5rem 1.25rem;
    border-radius: 0 2px 2px 0;
    :before {
        content: '';
        background: ${props => props.theme.blue};
        width: .5rem;
        height: 100%;
        position: absolute;
        left: 0;
        top: 0;
        opacity: .8
    }
    h3 {
        font-size: 2.5rem;
        cursor: pointer;
        margin: 0 0 .5rem;
        line-height: 1;
    }
    p, a.SubTitleLink {
        color: ${props => props.theme.lightGrey};
        font-size: 1.25rem;
        line-height: 1;
        opacity: .6;
    }
    a.SubTitleLink {
        font-style: italic;
        text-overflow: ellipsis;
        white-space: nowrap;
        overflow: hidden;
        text-decoration: underline;
    }
    p {
        margin: .25rem 0 0 0;
    }
`;


class Thing extends Component {
    render() {
        const { thing } = this.props;
        return (
            <StyledThing>
                <Link href={{
                    pathname: '/thing',
                    query: { id: thing.id },
                }}>
                    <h3>
                        <a>{thing.title}</a>
                    </h3>
                </Link>
                <a className="SubTitleLink" href={thing.link} target="_blank">{thing.link}</a>
                <p>Created at: {thing.createdAt}</p>
            </StyledThing>
        );
    }
}

Thing.propTypes = {
    thing: PropTypes.object.isRequired,
};

export default Thing;