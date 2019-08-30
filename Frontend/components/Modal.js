import React, { Component } from "react";
import styled from "styled-components";
import { Query, Mutation } from "react-apollo";
import gql from "graphql-tag";
import Signup from './Signup';
import Login from './Login';
import SubmitForm from './SubmitForm';
import MustSignIn from './MustSignIn';

const LOCAL_STATE_QUERY = gql`
   query {
      modalOpen @client
      modalContent @client
   }
`;

const TOGGLE_MODAL_MUTATION = gql`
   mutation TOGGLE_MODAL_MUTATION($modalContent: String!) {
      toggleModal(modalContent: $modalContent) @client
   }
`;

const StyledModal = styled.div`
   display: ${props => (props.open ? 'block' : 'none')};
   background: ${props => props.theme.lowContrastCoolGrey};
   position: fixed;
   left: 0;
   right: 0;
   top: 0;
   bottom: 0;
   z-index: 3;
   .modalContent {
      background: ${props => props.theme.background};
      position: absolute;
      width: 50%;
      height: 50%;
      left: 25%;
      top: 25%;
      text-align: center;
      border-radius: 4px;
      padding: 2rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      button.closeModal {
         border: none;
         font-size: ${props => props.theme.smallHead};
         font-weight: 600;
         position: absolute;
         top: 0;
         right: 0;
      }
   }
`;

class Modal extends Component {
   render() {
      return (
         <Mutation
            mutation={TOGGLE_MODAL_MUTATION}
            variables={{ modalContent: false }}
         >
            {toggleModal => (
               <Query query={LOCAL_STATE_QUERY}>
                  {({ data }) => (
                     <StyledModal open={data.modalOpen} onClick={toggleModal}>
                        <div
                           className="modalContent"
                           onClick={e => e.stopPropagation()}
                        >
                           {data.modalContent === 'Signup' ? (
                              <Signup callBack={toggleModal} />
                           ) : (
                              ''
                           )}
                           {data.modalContent === 'Login' ? (
                              <Login callBack={toggleModal} redirect={false} />
                           ) : (
                              ''
                           )}
                           {data.modalContent === 'Submit' ? (
                              <MustSignIn>
                                 <SubmitForm callBack={toggleModal} />
                              </MustSignIn>
                           ) : (
                              ""
                           )}
                           <button className="closeModal" onClick={toggleModal}>
                              &times;
                           </button>
                        </div>
                     </StyledModal>
                  )}
               </Query>
            )}
         </Mutation>
      );
   }
}

export default Modal;
export { LOCAL_STATE_QUERY, TOGGLE_MODAL_MUTATION };
