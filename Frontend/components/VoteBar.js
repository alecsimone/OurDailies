import React, { Component } from 'react';
import styled from 'styled-components';

const StyledVoteBar = styled.div`
    background: hsla(210, 5%, 31%, .34);
    width: 100%;
    height: 5rem;
    border-radius: 5px;
    margin: 3rem 0 0;
    text-align: center;
    font-size: 2rem;
    line-height: 5rem;
    color: ${props => props.theme.white};
`;

class VoteBar extends Component {
    render() {
        return (
            <StyledVoteBar>
                Vote Bar
            </StyledVoteBar>
        );
    }
}

export default VoteBar;