import Link from 'next/link';

const Home = props => (
    <div>
        <p>Hey hey you you I don't like your girlfriend!</p>
        <Link href="/second">
            <a>Next Line</a>
        </Link>
    </div>
);

export default Home;