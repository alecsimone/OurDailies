import Router from 'next/router';
import NProgress from 'nprogress';
import styled from 'styled-components';
import LogoBox from './LogoBox';
import UserBox from './UserBox';
import StageBox from './StageBox';

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
            <UserBox />
        </div>
    </StyledHeader>
)

export default Header;