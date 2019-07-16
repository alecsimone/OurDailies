import React, { Component } from 'react';
import Link from 'next/link';
import styled from 'styled-components';

const StyledLogoBox = styled.div`
    display: inline-flex;
    align-items: center;
    img {
        width: 6rem;
    }
    a, a:visited {
        font-size: 4rem;
        opacity: .9;
        margin-left: 1.5rem;
        margin-top: 4px;
        color: ${props => props.theme.gold};
    }
`;

const LogoBox = () => (
    <StyledLogoBox>
        <img src="/static/logo.png" />
        <Link href="/">
            <a>
                Our Dailies
            </a>
        </Link>
    </StyledLogoBox>
)

export default LogoBox;