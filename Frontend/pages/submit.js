import SubmitForm from '../components/SubmitForm';
import MustSignIn from '../components/MustSignIn';

const Submit = props => (
   <div>
      <MustSignIn>
         <SubmitForm />
      </MustSignIn>
   </div>
);

export default Submit;
