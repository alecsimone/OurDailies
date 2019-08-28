import React, { Component } from 'react';
import styled from 'styled-components';
import Link from 'next/link';
import { Mutation } from 'react-apollo';
import { TOGGLE_MODAL_MUTATION } from "./Modal";

const StyledStageBox = styled.div`
   display: inline-block;
   a,
   a:visited {
      color: ${props => props.theme.mainText};
      font-size: ${props => props.theme.bigText};
      margin-right: 8rem;
      position: relative;
      cursor: pointer;
   }
`;

function openSubmitBox(e) {}

const StageBox = () => (
   <StyledStageBox>
      <Mutation
         mutation={TOGGLE_MODAL_MUTATION}
         variables={{ modalContent: 'Submit' }}
      >
         {toggleModal => <a onClick={toggleModal}>Submit</a>}
      </Mutation>
      <Link href="/new">
         <a>New</a>
      </Link>
      <Link href="/curate">
         <a>Curate</a>
      </Link>
      <Link href="/finalists">
         <a>Finalists</a>
      </Link>
   </StyledStageBox>
);

export default StageBox;
