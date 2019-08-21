import React, { Component } from 'react';
import styled from 'styled-components';
import Link from 'next/link';
import Member from './Member';

const StyledMemberBox = styled.div`
  color: ${props => props.theme.secondaryAccent};
  display: inline-flex;
  align-items: center;
  font-size: 3rem;
  font-weight: 600;
  a,
  a:visited {
    color: ${props => props.theme.secondaryAccent};
    margin: 1rem;
  }
  img {
    width: 6rem;
    border-radius: 50%;
    margin-left: 3rem;
  }
`;

const MemberBox = () => (
  <Member>
    {({ data: { me } }) => {
      if (me) {
        let avatar;
        me.avatar === null
          ? (avatar =
              'https://dailies.gg/wp-content/uploads/2017/03/default_pic.jpg')
          : (avatar = me.avatar);
        return (
          <StyledMemberBox>
            <p>Your Rep: {me.rep}</p>
            <img src={avatar} alt="avatar" />
          </StyledMemberBox>
        );
      }
      return (
        <StyledMemberBox>
          <p>
            <Link href="/signup">
              <a>Sign up</a>
            </Link>
            or
            <Link href="/login">
              <a>Log in</a>
            </Link>
          </p>
        </StyledMemberBox>
      );
    }}
  </Member>
);

export default MemberBox;
