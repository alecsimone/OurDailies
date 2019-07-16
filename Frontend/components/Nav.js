import Link from 'next/link';
import styled from 'styled-components';

const NavBar = styled.div`
    font-size: 2rem;
    a {
        margin: 0 .5rem;
        color: ${props => props.theme.white};
        :visited {
            color: ${props => props.theme.white};
        }
    }
`;

const Nav = () => (
    <NavBar>
        <Link href="/">
            <a>Home</a>
        </Link>
        <Link href="/second">
            <a>Second</a>
        </Link>
    </NavBar>
)

export default Nav;