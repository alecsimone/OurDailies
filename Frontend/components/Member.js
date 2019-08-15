import { Query } from 'react-apollo';
import gql from 'graphql-tag';
import propTypes from 'prop-types';

const CURRENT_MEMBER_QUERY = gql`
    query {
        me {
            id
            email
            displayName
            roles
            avatar
            rep
            points
        }
    }
`;

const Member = props => (
    <Query {...props} query={CURRENT_MEMBER_QUERY}>
        {payload => props.children(payload)}
    </Query>
)

Member.PropTypes = {
    children: propTypes.func.isRequired,
}

export {CURRENT_MEMBER_QUERY};
export default Member;