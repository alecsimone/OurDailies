import React, { Component } from "react";
import { Mutation } from 'react-apollo';
import styled from "styled-components";
import Link from "next/link";
import Member from "./Member";
import { TOGGLE_MODAL_MUTATION } from "./Modal";

const StyledMemberBox = styled.div`
   color: ${props => props.theme.secondaryAccent};
   display: inline-flex;
   align-items: center;
   font-size: ${props => props.theme.bigText};
   font-weight: 600;
   a,
   a:visited {
      color: ${props => props.theme.secondaryAccent};
      margin: 1rem;
      cursor: pointer;
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
                    "https://dailies.gg/wp-content/uploads/2017/03/default_pic.jpg")
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
                  <Mutation
                     mutation={TOGGLE_MODAL_MUTATION}
                     variables={{ modalContent: 'Signup' }}
                  >
                     {toggleModal => <a onClick={toggleModal}>Sign up</a>}
                  </Mutation>
                  or
                  <Mutation
                     mutation={TOGGLE_MODAL_MUTATION}
                     variables={{ modalContent: 'Login' }}
                  >
                     {toggleModal => <a onClick={toggleModal}>Log in</a>}
                  </Mutation>
               </p>
            </StyledMemberBox>
         );
      }}
   </Member>
);

export default MemberBox;
