import React, { Component } from 'react';
import { Mutation } from 'react-apollo';
import gql from 'graphql-tag';

class SubmitThing extends Component {
    render() {
        return (
            <form>
                <h2>Submit a Thing</h2>
            </form>
        );
    }
}

export default SubmitThing;