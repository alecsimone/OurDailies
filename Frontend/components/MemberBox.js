import React, { Component } from 'react';
import styled from 'styled-components';
import Member from './Member';

const StyledMemberBox = styled.div`
    color: ${props => props.theme.secondaryAccent};
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

const MemberBox = () => (
        <Member>
            {({data: { me }}) => {
                console.log(me);
                if (me) {
                    let avatar;
                    me.avatar === null ? avatar = "https://dailies.gg/wp-content/uploads/2017/03/default_pic.jpg" : avatar = me.avatar; 
                    return (<StyledMemberBox>
                        <p>Your Rep: {me.rep}</p>
                        <img src={avatar} />
                    </StyledMemberBox>)
                } else {
                    return (<StyledMemberBox>
                        <p>Sign up or Log in</p>
                    </StyledMemberBox>)
                }
            }}
        </Member>
)

export default MemberBox;