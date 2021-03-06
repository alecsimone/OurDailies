import Router from 'next/router';
import NProgress from 'nprogress';
import styled from 'styled-components';
import LogoBox from './LogoBox';
import MemberBox from './MemberBox';
import StageBox from './StageBox';
import Modal from './Modal';

Router.onRouteChangeStart = () => {
   NProgress.start();
};
Router.onRouteChangeComplete = () => {
   NProgress.done();
};
Router.onRouteChangeError = () => {
   NProgress.done();
};

const StyledHeader = styled.div`
   display: flex;
   align-items: center;
   justify-content: space-between;
   flex-wrap: wrap;
   width: 94%;
   margin: auto;
   @media screen and (min-width: 800px) {
      width: 100%;
   }
   .logoBox {
      margin-right: 2rem;
   }
   .stageBox {
      flex-grow: 1;
      order: 3;
      padding: 4rem 0;
      width: 100%;
      display: flex;
      justify-content: space-around;
      @media screen and (min-width: 800px) {
         max-width: 800px;
         width: auto;
         order: 0;
         text-align: right;
      }
      @media screen and (min-width: 1480px) {
         display: inline-block;
         max-width: none;
         a,
         a:visited {
            margin-right: 8rem;
         }
      }
      a,
      a:visited {
         color: ${props => props.theme.mainText};
         font-size: ${props => props.theme.bigText};
         cursor: pointer;
         @media screen and (min-width: 800px) {
            /* margin-right: 8rem; */
            position: relative;
         }
      }
   }
   .memberBox {
   }
`;

const Header = () => (
   <StyledHeader id="header">
      <LogoBox />
      <StageBox />
      <MemberBox />
      <Modal />
   </StyledHeader>
);

export default Header;
