const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
require('dotenv').config({ path: 'variables.env' });
const bodyParser = require('body-parser-graphql');
const createServer = require('./createServer');
const db = require('./db');

const server = createServer();

server.express.use(cookieParser());
// server.express.use(bodyParser.graphql());

server.express.use((req, res, next) => {
   const { token } = req.cookies;
   if (token) {
      const { memberId } = jwt.verify(token, process.env.APP_SECRET);
      req.memberId = memberId;
   }
   next();
});

server.express.use(async (req, res, next) => {
   if (!req.memberId) return next();
   const member = await db.query.member(
      { where: { id: req.memberId } },
      '{id, displayName, avatar, rep, points, giveableRep, email, roles}'
   );
   req.member = member;
   next();
});

// process.env.FRONTEND_URL,
// "moz-extension://*",
// "https://www.twitch.tv/popout/ourdailies/chat?popout="
// subscriptions: '/subscriptions'
server.start(
   {
      cors: {
         credentials: true,
         origin: ['http://localhost:*', 'https://www.twitch.tv/popout/ourdailies/chat?popout=', 'http*://ourdailies.org']
      }
   },
   serverDetails => {
      console.log(
         `Server is now running on port http://localhost:${serverDetails.port}`
      );
   }
);
