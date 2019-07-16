import React, { Component } from 'react';
import styled from 'styled-components';

const StyledUserBox = styled.div`
    color: ${props => props.theme.gold};
    display: inline-flex;
    align-items: center;
    font-size: 3rem;
    font-weight: 600;
    img {
        width: 6rem;
        border-radius: 50%;
        margin-left: 3rem;
    }
`;

const UserBox = () => (
    <StyledUserBox>
        Your Rep: 20
        <img src="/static/temp/me.jpg" />
    </StyledUserBox>
)

export default UserBox;