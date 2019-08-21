const nodemailer = require('nodemailer');

const transport = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASSWORD,
    }
});

const basicEmailTemplate = text => `
    <div className="email" style="
        padding: 20px;
        font-family: sans-serif;
        line-height: 2;
        font-size: 20px;
    ">
        <h2>Hey.</h2>
        <p>${text}</p>
        <p>Cheers.</p>
    </div>
`;

exports.transport = transport;
exports.basicEmailTemplate = basicEmailTemplate;
