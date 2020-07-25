const models = require('../models');
const Promise = require('bluebird');
const parseCookies = require('./cookieParser.js');

// test spec expects 'shortlyid' as session key
// session object should contain shortlyid, username, userid
module.exports.createSession = (req, res, next) => {
  // run parseCookies on request
  parseCookies(req, res, () => 1);
  // access cookie object in request
  Promise.resolve(req.cookies.shortlyid)
    .then(hash => {
      // get session from the database
      return models.Sessions.get({hash});
    })
    .then(session => {
      console.log("line 17", session);
      if (!session || session.hash === undefined) {
        //create a new session
        return models.Sessions.create()
          .then((insertResults) => {
            return models.Sessions.get({id: insertResults.insertId});
          });
      } else {
        return session;
      }
    })
    //assign session to response
    .then(session => {
      console.log("line 30", session);
      res.cookie('shortlyid', session.hash);
      res.cookie('userid', session.userId);
      res.cookie('username', session.user);
      req.session = session;
    });
  next();

  // if shortlyid is undefined or does not exist in sessions table, create a new cookie

  // if shortlyid does match an existing session...
  // create a new session
  // assign a session object to the request
};

/************************************************************/
// Add additional authentication middleware functions below
/************************************************************/

// initializes a new session when there are no cookies on the request
// clears and reassigns a new cookie if there is no session assigned to the cookie
// sets a new cookie on the response when a session is initialized
// assigns a session object to the request if a session already exists
// creates a new hash for each new session
// assigns a username and userId property to the session object if the session is assigned to a user



// get the hash by shortlyid of cookies in request
// if hash does not exist
  // create a new session
  // get the session by hash
  // update the hash in session to cookie
// else if hash exist
  // get session by hash
  // if session not exist
    // create a new session
    // get the session by hash
    // update the hash in session to cookie
// assigns a session object to the request
// next()