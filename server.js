const express        = require('express');
const app            = express();
const bodyParser     = require('body-parser');
const methodOverride = require('method-override');
const session        = require('express-session');
require('./db/db')

const userController = require('./controllers/userController')

// middleware
app.use(bodyParser.urlencoded({extended: false}));
app.use(methodOverride('_method'));

// before our controllers
app.use(session({
  secret: 'qlk3j24t908998qu34bouv87iuoqbfakbva;lsekjg98phiqu',
  resave: false, // says only save the cookie if there has been a change to one of properties
  saveUninitialized: false // only save when we have mutated the session,
  //this is what should be done for logins, many laws make you do this as well
}))

app.use('/users', userController)


app.listen(3000, () => {
  console.log('listening... on port: ', 3000);
});
