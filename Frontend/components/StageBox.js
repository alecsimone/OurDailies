import React, { Component } from 'react';
import styled from 'styled-components';
import Link from 'next/link';

const StyledStageBox = styled.div`
    display: inline-block;
    a, a:visited {
        color: ${props => props.theme.white};
        font-size: 3rem;
        margin-right: 10rem;
    }
`;

const StageBox = () => (
    <StyledStageBox>
        <Link href="Scout">
            <a>Scout</a>
        </Link>
        <Link href="Prospects">
            <a>Prospects</a>
        </Link>
        <Link href="Finalists">
            <a>Finalists</a>
        </Link>
    </StyledStageBox>
)

export default StageBox;