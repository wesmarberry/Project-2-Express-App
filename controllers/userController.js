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
router.post('/register', async (req, res) => {
  
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
    res.send(err)
  }


})





module.exports = router