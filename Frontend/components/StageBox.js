import React, { Component } from 'react';
import styled from 'styled-components';
import Link from 'next/link';
import { Mutation } from 'react-apollo';
import { TOGGLE_MODAL_MUTATION } from './Modal';

const StyledStageBox = styled.div``;

const StageBox = () => (
   <StyledStageBox className="stageBox">
      <Mutation
         mutation={TOGGLE_MODAL_MUTATION}
         variables={{ modalContent: 'Submit' }}
      >
         {toggleModal => <a onClick={toggleModal}>Submit</a>}
      </Mutation>
      <Link href="/new">
         <a>New</a>
      </Link>
      <Link href="/filter">
         <a>Filter</a>
      </Link>
      <Link href="/finalists">
         <a>Finalists</a>
      </Link>
   </StyledStageBox>
);

export default StageBox;
