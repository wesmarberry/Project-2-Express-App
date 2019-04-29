const express = require('express');
const router = express.Router();
const User   = require('../models/user');
const Pet = require('../models/pet');
const Review = require('../models/review');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const upload = multer({ dest: 'uploads/'})
const fs = require('fs');


// login and register route
router.get('/new', (req, res) => {
	res.render('user/new.ejs', {
		message: req.session.message,
		logged: req.session.logged,
		username: req.session.username,
		id: req.session.userDbId
	})		
})


// route to register a new user
router.post('/register', upload.single('photo'), async (req, res, next) => {
  console.log(req.body);
  console.log(req.file)
  // first we must hash the password
  const password = req.body.password;
  // the password has is what we want to put in the database
  console.log('bcrypt=========before');
  console.log(req.body);
  
  const passwordHash = bcrypt.hashSync(password, bcrypt.genSaltSync(10))

  console.log('bcrypt=========after');
  // setting the filePath for the users photo
  const filePath = './' + req.file.path

  // create and object for the db entry
  const userDbEntry = {};
  userDbEntry.username = req.body.username;
  userDbEntry.password = passwordHash;
  userDbEntry.name = req.body.name;
  userDbEntry.email = req.body.email;
  userDbEntry.phone = req.body.phone;
  userDbEntry.zipcode = req.body.zipcode;
  // userDbEntry.photo = req.body.photo;
  

  try {

    const createdUser = await User.create(userDbEntry)
     createdUser.photo.data = fs.readFileSync(filePath);
     createdUser.save()

    console.log('createdUser==================');
    console.log(createdUser);

    req.session.logged = true;
    req.session.userDbId = createdUser._id
    req.session.username = createdUser.username
    req.session.message = ''
    req.session.updated = ''

    fs.unlink(filePath, (err) => {
    	if(err) next(err);
	})

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
        req.session.updated = ''
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

// log out 

router.get('/logout', (req, res) => {
	req.session.destroy((err) => {
		if (err) {
			res.send(err)
		} else {
			res.redirect('/users')
		}
	})		
})


//index route

router.get('/', async (req, res, next) => {
	try {
		const foundPets = await Pet.find({})
		res.render('user/index.ejs', {
			pets: foundPets,
			logged: req.session.logged,
			username: req.session.username,
			id: req.session.userDbId
		})
	} catch (err) {
		next(err)
	}				
})

//User serving photo

router.get('/:id/photo', async(req,res, next) => {
	
	try{

	  	console.log('===== hit the photo route ========');

	  	
	  		const foundUser = await User.findById(req.params.id);
			console.log('foundUser');
			console.log(foundUser);
			res.set('Content-Type', foundUser.photo.contentType)		
			res.send(foundUser.photo.data)
	}
	catch(err){
	 	next(err)
	}
})

// show route

router.get('/:id', async (req, res, next) => {
	if (req.session.logged === false || req.session.logged === undefined) {
		res.redirect('/users/new')
	}
	if (req.session.userDbId === req.params.id) {
		res.redirect('/users/' + req.params.id + '/edit')
	} else {
		try {
			const foundUser = await User.findById(req.params.id).populate('pets').populate('reviews')
			res.render('user/show.ejs', {
				user: foundUser,
				logged: req.session.logged,
				id: req.session.userDbId,
				username: req.session.username,
				updated: req.session.updated
			})
		} catch (err) {
			next(err)
		}
	}
})


// edit route

router.get('/:id/edit', async (req, res, next) => {
	try {
		const foundUser = await User.findById(req.params.id).populate('pets').populate('reviews')
		console.log(foundUser);
		res.render('user/edit.ejs', {
			user: foundUser,
			logged: req.session.logged,
			id: req.session.userDbId,
			username: req.session.username,
			updated: req.session.updated
		})
	} catch (err) {
		next(err)
	}
})

// update route

router.put('/:id', async (req, res, next) => {
	try {
		const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, {new: true})
		req.session.updated = req.session.username + ' was updated!'
		res.redirect('/users/' + req.params.id + '/edit')
		req.session.updated = ''
	} catch (err) {
		next(err)
	}	
})

// delete route

router.delete('/:id', async (req, res, next) => {
	try {
		const foundUser = await User.findByIdAndRemove(req.params.id)
		const foundPets = await Pet.deleteMany({
	        _id: {
	          $in: foundUser.pets 
	        }
		})
		req.session.destroy()
		res.redirect('/users')
	} catch (err) {
		next(err)
	}		
})

// review post route

router.post('/review', async (req, res, next) => {
	console.log('entering post route');
	try	{
		console.log(req.body);
		const createdReview = await Review.create(req.body)
		console.log(createdReview + ' is the created review');
		const foundUser = await User.findById(req.body.userReviewed)
		console.log(foundUser + ' is the found user');
		foundUser.reviews.push(createdReview)
		foundUser.save()
		res.redirect('/users/' + foundUser._id)
	} catch (err) {
		next(err)
	}
})




module.exports = router