const express = require('express');
const router = express.Router();
const User   = require('../models/user');
const bcrypt = require('bcryptjs')


// login and register route
router.get('/new', (req, res) => {
	res.render('new.ejs', {
		message: req.session.message
	})		
})


// route to register a new user
router.post('/register', async (req, res, next) => {
  
  // first we must hash the password
  const password = req.body.password;
  // the password has is what we want to put in the database
  const passwordHash = bcrypt.hashSync(password, bcrypt.genSaltSync(10))

  // create and object for the db entry
  const userDbEntry = {};
  userDbEntry.username = req.body.username;
  userDbEntry.password = passwordHash;

  try {

    const createdUser = await User.create(userDbEntry)
    console.log(createdUser);

    req.session.logged = true;
    req.session.usersDbId = createdUser._id
    req.session.username = createdUser.username
    req.session.message = ''


    res.redirect('/users')
  } catch (err) {
    next(err)
  }


})


// logs in existing users
router.post('/new', async (req, res, next) => {

  try {
    const userExists = await User.findOne({'username': req.body.username})
    console.log(userExists);
    if (userExists) {
      if (bcrypt.compareSync(req.body.password, userExists.password)) {

        req.session.userDbId = userExists._id
        req.session.logged = true
        req.session.username = req.body.username
        req.session.message = ''
        req.session.special = ''
        res.redirect('/users')
        
      } else {
        req.session.message = 'username or password is incorrect'
        res.redirect('/users/new')

      }
    } else {
      console.log("here");
      req.session.message = "username or password does not exist"
      res.redirect('/users/new')
    }
    


  } catch (err) {

    console.log("catch");
    next(err)
  }

})  



module.exports = router