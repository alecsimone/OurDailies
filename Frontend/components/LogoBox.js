import React, { Component } from "react";
import Link from "next/link";
import styled from "styled-components";

const StyledLogoBox = styled.div`
   display: inline-flex;
   align-items: center;
   img {
      width: 7rem;
      margin-top: -4px;
   }
   a,
   a:visited {
      font-size: ${props => props.theme.smallHead};
      font-weight: 300;
      opacity: 0.9;
      margin-left: 2rem;
      color: ${props => props.theme.secondaryAccent};
      :hover {
         text-decoration: none;
      }
   }
`;

const LogoBox = () => (
   <StyledLogoBox>
      <img src="/static/logo.png" />
      <Link href="/">
         <a>Our Dailies</a>
      </Link>
   </StyledLogoBox>
);

export default LogoBox;
