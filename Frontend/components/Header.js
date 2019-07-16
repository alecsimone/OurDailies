import Router from 'next/router';
import NProgress from 'nprogress';
import LogoBox from './LogoBox';

Router.onRouteChangeStart = () => {
    NProgress.start();
};
Router.onRouteChangeComplete = () => {
    NProgress.done();
};
Router.onRouteChangeError = () => {
    NProgress.done();
};

const Header = () => (
    <div>
        <LogoBox />
    </div>
)

export default Header;