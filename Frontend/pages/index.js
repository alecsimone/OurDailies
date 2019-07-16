import Link from 'next/link';
import styled from 'styled-components';

const HomeText = styled.p`
    color: ${props => props.theme.white};
`;

const Home = () => (
    <div>
        <HomeText>This is the home page</HomeText>
    </div>
);

export default Home;