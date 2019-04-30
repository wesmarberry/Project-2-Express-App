require('dotenv').config()

const express = require('express');
const router = express.Router();
const User   = require('../models/user');
const Pet = require('../models/pet');
const Review = require('../models/review');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const fs = require('fs');
const App = require('../public/js/app.js')
// const x = require('../public/js/app');

//path is a core node.js module that provides utilities for working with file and directory paths
// in our case we will use this module to catch the extension from the uploaded file
//using the method path.extname().
const path = require('path');

// console.log(x);
//setting storage engine
const storageEngine = multer.diskStorage({
	destination: './uploads/',
	filename: (req,file,cb)=>{
		cb(null,file.fieldname + "-" +Date.now() + path.extname(file.originalname))
	}
});

//init upload
const upload = multer({
	storage: storageEngine,
	limits: {fileSize: 1000000},
	fileFilter:(req,file,cb)=>{
	
			// setting a expression of allowed extensions
			const fileTypes = /jpeg|jpg|png|gif/;

			const extName = fileTypes.test(path.extname(file.originalname).toLowerCase());

			const mimeType = fileTypes.test(file.mimetype)

			if (extName && mimeType){
				return cb(null,true)
			}
			else{
				console.log("ERRRRORRRRRR");
				cb('Error: File is not a image')
			}
		
	}
})//.single('photo');

console.log(App);

let message;
// login and register route
router.get('/new', (req, res) => {
	res.render('user/new.ejs', {
		message: req.session.message,
		logged: req.session.logged,
		username: req.session.username,
		id: req.session.userDbId,
		msg: message,
		API: process.env.API_KEY
	})		
})


// geocode fucnction


// const latLongFinder = (zipcode) => {
	// const lat = '';
 //    const lng = '';
 //    const address = zipcode;
	// var platform = new H.service.Platform({
	//   'app_id': '{9Jfnwd59kOCF5Ej3Gf5C}',
	//   'app_code': '{1lglqwoyeqDmQ_kweOKABw}'
	// });

 //    geocoder.geocode( { 'address': address}, function(results, status) {
 //      if (status == google.maps.GeocoderStatus.OK) {
 //         lat = results[0].geometry.location.lat();
 //         lng = results[0].geometry.location.lng();
 //        } else {
 //        console.log("Geocode was not successful for the following reason: " + status);
 //      }
 //    });
	// console.log(lat + 'is the latitiude');
	// console.log(lng + 'is the latitiude');


// 	var Ireland = "Dublin";

// function initialize() 
// {
//   geocoder = new google.maps.Geocoder();
//   var latlng = new google.maps.LatLng(53.3496, -6.3263);
//   var mapOptions = 
//   {
//     zoom: 8,
//     center: latlng
//   }
//   map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
//   codeAddress(Ireland);//call the function
// }

// function codeAddress(zipcode) 
// {
//   geocoder.geocode( {address:address}, function(results, status) 
//   {
//     if (status == google.maps.GeocoderStatus.OK) 
//     {
//       map.setCenter(results[0].geometry.location);//center the map over the result
//       //place a marker at the location
//       var marker = new google.maps.Marker(
//       {
//           map: map,
//           position: results[0].geometry.location
//       });
//     } else {
//       alert('Geocode was not successful for the following reason: ' + status);
//    }
//   });
// }
// }


// route to register a new user
router.post('/register', upload.single('photo'), async(req, res, next) => {

	
	console.log('req.body=======');
	console.log(req.body);
	console.log('req.file=======');
	console.log(req.file);


	

  // first we must hash the password
  const password = req.body.password;
  // the password has is what we want to put in the database
  
  const passwordHash = bcrypt.hashSync(password, bcrypt.genSaltSync(10))

  // setting the filePath for the users photo
  let filePath;
  if (req.file){
  	filePath = './' + req.file.path;
  }
  else{
  	filePath = './public/images/no-profile-picture-icon.jpg';
  	console.log(filePath);
  }
  console.log("====filename=====", filePath);


  // create and object for the db entry
  const userDbEntry = {};
  userDbEntry.username = req.body.username;
  userDbEntry.password = passwordHash;
  userDbEntry.name = req.body.name;
  userDbEntry.email = req.body.email;
  userDbEntry.phone = req.body.phone;
  userDbEntry.zipcode = req.body.zipcode;
  userDbEntry.lat = req.body.lat
  userDbEntry.lng = req.body.lng

  // userDbEntry.photo = req.body.photo;
  

  try {

  // 		upload(req, res, (err)=>{
		// 	if (err){
		// 		console.log(err);
		// 		message = err
		// 		res.rendirect('/users/new')
		// 	}
		// 	else{
		// 		console.log(req.file);
		// 	}
		// })


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
	    req.session.lat = createdUser.lat
	    req.session.lng = createdUser.lng
	    // req.session.latLng = latLongFinder(createdUser.zipcode)

	    if (filePath !== './public/images/no-profile-picture-icon.jpg'){
		    fs.unlink(filePath, (err) => {
		    	if(err) next(err);
			})
	    }
	    console.log(createdUser + ' ============== is the created user');
	    res.redirect('/users')
  
  } catch (err) {

    	message = err
    	console.log(message);
		res.rendirect('/users/new')
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
        req.session.lat = userExists.lat
	    req.session.lng = userExists.lng
        // req.session.latLng = latLongFinder(userExists.zipcode)
        console.log(req.session.latLng);
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
		console.log(req.session.lat + ' ========= is user Lat');
		console.log(req.session.lng + ' =========== is user lng');
		// console.log("x");
		// console.log(x);
		console.log(process.env.API_KEY);
		console.log(process.env.SOURCE_EMAIL)
		const foundPets = await Pet.find({})
		res.render('user/index.ejs', {
			pets: foundPets,
			logged: req.session.logged,
			username: req.session.username,
			id: req.session.userDbId,
			API: process.env.API_KEY,
			userLat: req.session.lat,
			userLng: req.session.lng,
			i: 0
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
				updated: req.session.updated,
				API: process.env.API_KEY
			})
		} catch (err) {
			next(err)
		}
	}
})


// edit route

router.get('/:id/edit', async (req, res, next) => {
	if (req.session.updated === true) {
		req.session.updatedMsg = req.session.username + ' was updated!'
		req.session.updated = false
	} else {
		req.session.updatedMsg = ''
	}

	try {
		const foundUser = await User.findById(req.params.id).populate('pets').populate('reviews')
		console.log(foundUser);
		res.render('user/edit.ejs', {
			user: foundUser,
			logged: req.session.logged,
			id: req.session.userDbId,
			username: req.session.username,
			updated: req.session.updatedMsg,
			API: process.env.API_KEY
		})
	} catch (err) {
		next(err)
	}
})

// update route

router.put('/:id', upload.single('photo'), async (req, res, next) => {
	try {



		console.log('======req.body==== : ',req.body);

		let filePath;
  		if (req.file){
  			filePath = './' + req.file.path;
  		    console.log("====filename=====", filePath);
  		}
  		

		const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, {new: true})


		if (req.file){
 		    updatedUser.photo.data = fs.readFileSync(filePath);
 		    updatedUser.save();
		    fs.unlink(filePath, (err) => {
		    	if(err) next(err);
			})
	    }

	    req.session.updated = true
		console.log(req.session.updated);
		res.redirect('/users/' + req.params.id + '/edit')
		console.log(req.session.updated);

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