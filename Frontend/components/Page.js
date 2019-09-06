import React, { Component } from 'react';
import styled, { ThemeProvider, injectGlobal } from 'styled-components';
import Header from './Header';
import Meta from './Meta';
import Logout from './Logout';
import Member from './Member';

const theme = {
   tinyText: '1.25rem',
   smallText: '2rem',
   bigText: '2.5rem',
   smallHead: '4rem',
   bigHead: '5rem',

   // Collective
   background: 'hsl(216, 24%, 5%)',
   mainText: 'hsla(33, 17%, 88%, .9)',
   majorColor: 'hsl(210, 100%, 40%)',
   primaryAccent: 'hsl(120, 100%, 25%)',
   secondaryAccent: 'hsl(42, 79%, 64%)',
   highContrastSecondaryAccent: 'hsl(42, 100%, 100%, .1)',
   lowContrastGrey: 'hsl(30, 10%, 33%)',
   veryLowContrastGrey: 'hsla(30, 10%, 33%, .5)',
   lowContrastCoolGrey: 'hsl(210, 15%, 48%, .6)',
   veryLowContrastCoolGrey: 'hsl(210, 15%, 48%, .1)',
   superLowContrastCoolTint: 'hsla(210, 40%, 40%, 0.07)',
   highContrastGrey: 'hsl(28, 9%, 64%, .9)'

   // Elite
   // background: 'hsl(216, 24%, 4%)',
   // mainText: 'hsla(33, 17%, 88%, .9)',
   // majorColor: '#e6b545',
   // primaryAccent: '#0043bf',
   // secondaryAccent: '#99007d',
   // lowContrastGrey: '#4c5054',
   // highContrastGrey: '#9aa2ab',

   // Irreverent
   // background: '#e5e0da',
   // mainText: '#080A0D',
   // majorColor: '#991d99',
   // primaryAccent: '#0043bf',
   // secondaryAccent: '#99520f',
   // highContrastGrey: '#4c5054',
   // lowContrastGrey: '#9aa2ab',

   // Celebration
   // background: '#e5e0da',
   // mainText: '#080A0D',
   // majorColor: '#991d99',
   // primaryAccent: '#0043bf',
   // secondaryAccent: '#3d993d',
   // highContrastGrey: '#4c5054',
   // lowContrastGrey: '#9aa2ab',

   // Growth
   // background: '#080A0D',
   // mainText: '#e5e0da',
   // majorColor: '#004000',
   // primaryAccent: '#0043bf',
   // secondaryAccent: '#994c00',
   // highContrastGrey: '#9aa2ab',
   // lowContrastGrey: '#4c5054',

   // Saviors
   // background: '#e5e0da',
   // mainText: '#080A0D',
   // majorColor: '#991d99',
   // primaryAccent: '#0043bf',
   // secondaryAccent: '#d95757',
   // highContrastGrey: '#4c5054',
   // lowContrastGrey: '#9aa2ab',

   // Underground
   // background: '#080A0D',
   // mainText: '#e5e0da',
   // majorColor: '#992626',
   // primaryAccent: '#0043bf',
   // secondaryAccent: '#994c00',
   // highContrastGrey: '#9aa2ab',
   // lowContrastGrey: '#4c5054',
};

injectGlobal`
   html {
      background: ${theme.background};
      color: ${theme.mainText};
      font-family: "Proxima Nova", sans-serif;
      box-sizing: border-box;
      font-size: 8px;
      scrollbar-color: ${theme.lowContrastGrey} ${theme.background};
      scrollbar-width: thin;
      @media screen and (min-width: 800px) {
         font-size: 10px;
      }
      @media screen and (min-width: 1280px) {
         font-size: 12px;
      }
   }
   *, *:before, *:after {
      box-sizing: inherit;
   }
   body {
      padding: 0;
      margin: 0;
      font-size: ${theme.smallText};
      font-weight: 400;
   }
   body::-webkit-scrollbar {
      width: .5rem;
      background: ${theme.background};
   }
   body::-webkit-scrollbar-track {
      -webkit-box-shadow: inset 0 0 1px rgba(0,0,0,0.3);
   }
   body::-webkit-scrollbar-thumb {
      border-radius: 3px;
      -webkit-box-shadow: inset 0 0 1px rgba(0,0,0,0.5);
      background: ${theme.lowContrastGrey};
   }
   a {
      text-decoration: none;
      color: ${theme.mainText};
      :visited {
         color: ${theme.mainText};
      }
      :hover {
         text-decoration: underline;
      }
   }
   fieldset {
      border: none;
   }
   input {
      background: ${theme.veryLowContrastCoolGrey};
      color: ${theme.mainText};
      font-family: "Proxima Nova", sans-serif;
      border-radius: 3px;
      border: none;
      border-bottom: 1px solid ${theme.highContrastGrey};
      padding: .25rem 1rem;
      &:disabled {
         background: ${theme.veryLowContrastGrey};
      }
   }
   textarea {
      background: none;
      color: ${theme.mainText};
      border: none;
      border-radius: 3px;
      border-bottom: 1px solid ${theme.highContrastGrey};
      box-sizing: border-box;
      padding: 1rem 1rem calc(1rem - 1px) 1rem;
      font-family: "Proxima Nova", sans-serif;
      &:focus {
         border: 1px solid ${theme.lowContrastGrey};
         border-bottom: 1px solid ${theme.highContrastGrey};
         padding: calc(1rem - 1px) calc(1rem - 1px) calc(1rem - 1px) calc(1rem - 1px);
      }
   }
   button {
      background: none;
      border: 1px solid ${theme.highContrastGrey};
      border-radius: 3px;
      color: ${theme.mainText};
      font-family: "Proxima Nova", sans-serif;
      cursor: pointer;
      &:hover {
         background: ${theme.veryLowContrastCoolGrey};
      }
   }
`;

const StyledPage = styled.div`
   width: 100%;
   @media screen and (min-width: 800px) {
      width: 94%;
   }
   margin: 4rem auto;
`;

class Page extends Component {
   render() {
      return (
         <ThemeProvider theme={theme}>
            <StyledPage id="page">
               <Meta />
               <Header />
               {this.props.children}
               <Member>{({ data: { me } }) => me && <Logout />}</Member>
            </StyledPage>
         </ThemeProvider>
      );
   }
}

export default Page;
