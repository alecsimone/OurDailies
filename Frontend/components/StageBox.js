import React, { Component } from 'react';
import styled from 'styled-components';
import Link from 'next/link';

const StyledStageBox = styled.div`
    display: inline-block;
    a, a:visited {
        color: ${props => props.theme.white};
        font-size: 3rem;
        margin-right: 8rem;
    }
`;

function openSubmitBox(e) {
    
}

const StageBox = () => (
    <StyledStageBox>
       <Link href="/submit">
            <a>Submit</a>
        </Link>
        <Link href="/scout">
            <a>Scout</a>
        </Link>
        <Link href="/prospects">
            <a>Prospects</a>
        </Link>
        <Link href="/finalists">
            <a>Finalists</a>
        </Link>
    </StyledStageBox>
)

export default StageBox;