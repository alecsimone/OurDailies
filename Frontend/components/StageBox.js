import React, { Component } from 'react';
import styled from 'styled-components';
import Link from 'next/link';

const StyledStageBox = styled.div`
   display: inline-block;
   a,
   a:visited {
      color: ${props => props.theme.mainText};
      font-size: ${props => props.theme.bigText};
      margin-right: 8rem;
      position: relative;
   }
`;

function openSubmitBox(e) {}

const StageBox = () => (
   <StyledStageBox>
      <Link href="/submit">
         <a>Submit</a>
      </Link>
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
