import React, { Component } from "react";
import styled from "styled-components";
import { Mutation } from "react-apollo";
import gql from "graphql-tag";
import { ALL_THINGS_QUERY } from "../pages/index";

const StyledAdminBar = styled.div`
   display: flex;
   justify-content: flex-end;
   img {
      width: 2rem;
      opacity: 0.4;
      padding: 0.25rem 0;
      cursor: pointer;
      :first-of-type {
         margin-right: 1.25rem;
      }
   }
`;

const DELETE_THING_MUTATION = gql`
   mutation DELETE_THING_MUTATION($id: ID!) {
      deleteThing(id: $id) {
         id
      }
   }
`;

class AdminBar extends Component {
   update = (cache, payload) => {
      const data = cache.readQuery({ query: ALL_THINGS_QUERY });
      data.things = data.things.filter(
         thing => thing.id !== payload.data.deleteThing.id
      );
      cache.writeQuery({ query: ALL_THINGS_QUERY, data });
   };

   render() {
      return (
         <StyledAdminBar>
            <Mutation
               mutation={DELETE_THING_MUTATION}
               variables={{ id: this.props.thingID }}
               update={this.update}
            >
               {(deleteThing, { error }) => (
                  <img
                     onClick={() => {
                        if (
                           confirm(
                              `Are you sure you want to delete thing "${
                                 this.props.thingTitle
                              }?"`
                           )
                        ) {
                           deleteThing();
                        }
                     }}
                     src="/static/red-x.png"
                  />
               )}
            </Mutation>
            <img src="/static/edit-this.png" onClick={this.props.edit} />
         </StyledAdminBar>
      );
   }
}

export default AdminBar;
