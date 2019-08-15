const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
require('dotenv').config({ path: 'variables.env'});
const createServer = require('./createServer');
const db = require('./db');

const server = createServer();

server.express.use(cookieParser());

server.express.use((req, res, next) => {
    const {token} = req.cookies;
    if (token) {
        const {memberId} = jwt.verify(token, process.env.APP_SECRET);        
        req.memberId = memberId;
    }
    next();
});

server.start({
    cors: {
        credentials: true,
        origin: process.env.FRONTEND_URL,
    },
}, serverDetails => {
        console.log(`Server is now running on port http://localhost:${serverDetails.port}`)
    }
);