const express = require('express');
const path = require('path');
const utils = require('./lib/hashUtils');
const partials = require('express-partials');
const bodyParser = require('body-parser');
const Auth = require('./middleware/auth');
const models = require('./models');

const app = express();

app.set('views', `${__dirname}/views`);
app.set('view engine', 'ejs');
app.use(partials());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public')));



app.get('/',
(req, res) => {
  res.render('index');
});

app.get('/create',
(req, res) => {
  res.render('index');
});

app.get('/links',
(req, res, next) => {
  models.Links.getAll()
    .then(links => {
      res.status(200).send(links);
    })
    .error(error => {
      res.status(500).send(error);
    });
});

app.post('/links',
(req, res, next) => {
  var url = req.body.url;
  if (!models.Links.isValidUrl(url)) {
    // send back a 404 if link is not valid
    return res.sendStatus(404);
  }

  return models.Links.get({ url })
    .then(link => {
      if (link) {
        throw link;
      }
      return models.Links.getUrlTitle(url);
    })
    .then(title => {
      return models.Links.create({
        url: url,
        title: title,
        baseUrl: req.headers.origin
      });
    })
    .then(results => {
      return models.Links.get({ id: results.insertId });
    })
    .then(link => {
      throw link;
    })
    .error(error => {
      res.status(500).send(error);
    })
    .catch(link => {
      res.status(200).send(link);
    });
});

/************************************************************/
// Write your authentication routes here
/************************************************************/

// add handling for a GET request on "/login" (get the log in page)
app.get('/login',
  (req, res, next) => {
    res.render('login');
  }
);

//add handling for a POST request on "/login" (logging into the server)
//site defines username and password as the keys
app.post('/login',
  (req, res, next) => {
    let username = req.body.username;
    let password = req.body.password;
    // check user database to see if username already exists
    models.Users.get({username})
    .then(user => {
      // if user does not exist or the password is not match, then redirect to login
      if (!user || !models.Users.compare(password, user.password, user.salt)) {
        throw user;
      // if user exist, then redirect to index page
      } else {
        res.redirect('/');
      }
    })
    .catch(user => {
      res.redirect('/login');
    });

  }
);

// add handling for a GET request on "/signup" (get the sign up page)
app.get('/signup',
  (req, res, next) => {
    res.render('signup');
  }
);

//add handling for a POST request on "/signup" (creating a new account)
app.post('/signup',
  (req, res, next) => {
    let username = req.body.username;
    let password = req.body.password;
    // check user database to see if username already exists
    models.Users.create({username, password})
      .then(user => {
        // if user didn't exist and insert is successful, redirect to index page
        res.redirect('/');
      })
      //if user already exists, redirect to signup page
      .catch(user => {
        res.redirect('/signup');
      });
    //generate hash info using create() in user.js, which should add record to database
  });

/************************************************************/
// Handle the code parameter route last - if all other routes fail
// assume the route is a short code and try and handle it here.
// If the short-code doesn't exist, send the user to '/'
/************************************************************/

app.get('/:code', (req, res, next) => {

  return models.Links.get({ code: req.params.code })
    .tap(link => {

      if (!link) {
        throw new Error('Link does not exist');
      }
      return models.Clicks.create({ linkId: link.id });
    })
    .tap(link => {
      return models.Links.update(link, { visits: link.visits + 1 });
    })
    .then(({ url }) => {
      res.redirect(url);
    })
    .error(error => {
      res.status(500).send(error);
    })
    .catch(() => {
      res.redirect('/');
    });
});

module.exports = app;
