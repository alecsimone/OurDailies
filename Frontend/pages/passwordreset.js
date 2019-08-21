import Reset from '../components/Reset.js'

const PasswordReset = props => (
    <div>
        <Reset resetToken={props.query.resetToken} />
    </div>
)

export default PasswordReset