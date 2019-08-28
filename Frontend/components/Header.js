import Router from "next/router";
import NProgress from "nprogress";
import styled from "styled-components";
import LogoBox from "./LogoBox";
import MemberBox from "./MemberBox";
import StageBox from "./StageBox";
import Modal from "./Modal";

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
   margin-bottom: 3rem;
`;

const Header = () => (
   <StyledHeader>
      <LogoBox />
      <div>
         <StageBox />
         <MemberBox />
      </div>
      <Modal />
   </StyledHeader>
);

export default Header;
