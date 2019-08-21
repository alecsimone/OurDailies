import { Query } from 'react-apollo';
import { CURRENT_MEMBER_QUERY } from './Member';
import Login from './Login';

const MustSignIn = props => <Query query={CURRENT_MEMBER_QUERY}>
    {({data, loading}) => {
        if (loading) return <p>Loading...</p>;
        if (!data.me) {
            return (
                <div>
                    <p>You must be logged in to do that</p>
                    <Login />
                </div>
            )
        }
        return props.children;
    }}
</Query> 

export default MustSignIn;