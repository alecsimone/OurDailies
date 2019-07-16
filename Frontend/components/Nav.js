import Link from 'next/link';

const Nav = () => (
    <div>
        <Link href="/">
            <a>Home</a>
        </Link>
        <Link href="/second">
            <a>Second</a>
        </Link>
    </div>
)

export default Nav;