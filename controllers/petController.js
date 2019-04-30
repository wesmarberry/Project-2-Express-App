const express = require('express');
const router = express.Router();
const Pet = require('../models/pet')
const User = require('../models/user')
const Schedule = require('../models/schedule')
const nodemailer	 = require('nodemailer')
const multer = require('multer')
const upload = multer({ dest: 'uploads/'})
const fs = require('fs');


// mail notification set up




const mailer = async (senderEmail, senderUsername, receiverEmail, subject, message) => {

	// let testAccount = await nodemailer.createTestAccount()

	let transporter = nodemailer.createTransport({
	host: 'smtp.gmail.com',
	auth: {
		user: process.env.SOURCE_EMAIL,
		pass: process.env.SOURCE_PASSWORD
	},
	})

	let info = await transporter.sendMail({
		from: senderEmail,
		to: receiverEmail,
		subject: subject,
		text: senderUsername + message
	})
	console.log("Message sent: %s", info);
}

router.get('/', async(req,res)=>{
	  try{
	  		const allPets = await Pet.find({});
	  		res.render('pet/index.ejs',{
	  			logged: req.session.logged,
	  			id: req.session.userDbId,
	  			pets: allPets
	  		});
	  }
	  catch(err){
	  		res.send(err);
	  }
});

router.get('/new', async (req,res,next)=>{
	try {
		const foundUser = await User.findById(req.session.userDbId)
		res.render('pet/new.ejs',{
			user: foundUser,
			logged: req.session.logged,
			username: req.session.username,
			id: req.session.userDbId,
			API: process.env.API_KEY
		})
	} catch (err) {
		next(err)
	}
})

router.delete('/:id', async(req,res)=>{
	  try{
	  		const foundPet = await Pet.findById(req.params.id)
			const petRemoved = await Pet.deleteOne({_id:req.params.id});
			const foundUser = await User.findById(foundPet.owner)
			const index = foundUser.pets.indexOf(req.params.id)
			foundUser.pets.splice(index, 1)
			foundUser.save()
			// console.log(`Dog petRemoved ${petRemoved}`);
			//also we need to upate the user array
			res.redirect('/users')			
	  }
	  catch(err){
	  		res.send(err)
	  }
})


router.get('/:id/photo', async(req,res, next) => {
	
	  try{
	  		const foundPet = await Pet.findById(req.params.id);
			res.set('Content-Type', foundPet.photo.contentType)
			
			res.send(foundPet.photo.data)
	  }
	  catch(err){
	  		next(err)
	  }

})


router.get('/:id', async(req,res)=>{
	  try{
			const petFound = await Pet.findOne({_id:req.params.id}).populate('schedule')

			res.render('pet/show.ejs',{
				pet: petFound,
				loggedInUser: req.session.userDbId,
				loggedInUsername: req.session.username,
				logged: req.session.logged,
				username: req.session.username,
				id: req.session.userDbId,
				API: process.env.API_KEY
			})  				
	  }
	  catch(err){
	  		res.send(err)
	  }
})

router.post('/:id/edit', async(req,res)=>{
	  try{
			const petToUpdate = await Pet.findOne({_id:req.params.id});
			res.render('pet/edit.ejs',{
				pet: petToUpdate,
				logged: req.session.logged,
				username: req.session.username,
				id: req.session.userDbId,
				API: process.env.API_KEY
			})  				
	  }
	  catch(err){
	  		res.send(err)
	  }
})


router.put('/:id', upload.single('photo'),async(req,res)=>{
	  try{


	  		let filePath;
  			if (req.file){
  				filePath = './' + req.file.path;
  			}

			const petToUpdated = await Pet.findByIdAndUpdate(req.params.id, req.body);

			if (req.file){
 		    	petToUpdated.photo.data = fs.readFileSync(filePath);
 		    	petToUpdated.save();
		    	fs.unlink(filePath, (err) => {
		    		if(err) next(err);
				})
	    	}

			res.redirect('/users'); 				
	  }
	  catch(err){
	  		res.send(err)
	  }
})


router.post('/', upload.single('photo'), async(req,res,next)=>{
	  try{

		  	const filePath = './' + req.file.path
			
			const newPet = new Pet
			newPet.name = req.body.name
			newPet.breed = req.body.breed
			newPet.age = req.body.age
			newPet.petKind = req.body.petKind
			newPet.owner = req.body.owner
			newPet.lat = req.body.lat
			newPet.lng = req.body.lng
			newPet.photo.data = fs.readFileSync(filePath)

			await newPet.save();

			const foundUser = await User.findById(req.body.owner)
			
			foundUser.pets.push(newPet._id)
			foundUser.save()

			await fs.unlink(filePath, (err) => {
				if(err) next(err);
			})

			res.redirect(`pets/${newPet._id}`)
	  }
	  catch(err){
	  		next(err)
	  }
})


// create route for schedule 

router.post('/schedule', async (req, res, next) => {
	try {
		
		const createdSchedule = await Schedule.create(req.body)
		
		const foundPet = await Pet.findById(req.body.pet)
		
		const userSender = await User.findById(req.body.proposerId)
		console.log(userSender + '========= sender');
		const userReceiver = await User.findById(req.body.petOwnerId)
		console.log(userReceiver + '========= receiver');
		foundPet.schedule.push(createdSchedule)
		
		mailer(userSender.email, userSender.username, userReceiver.email, 'Pet Request',
		 ' would like to play with your pet! Send and email back to ' + userSender.email + ' and respond on the site!  Link: ')



		foundPet.save()
		res.redirect('/pets/' + req.body.pet)



	} catch (err) {
		next(err)
	}
})


router.put('/schedule/:id',async(req,res,next)=>{
	  try{
		if (req.params.id === "a"){
			const updatedSchedule = await Schedule.findByIdAndUpdate(req.body.scheduleId, {booked:true})
			const userSender = await User.findById(updatedSchedule.petOwnerId)
			const userReceiver = await User.findById(updatedSchedule.proposerId)
			console.log(updatedSchedule, "<<< ===== schedule updated");
			mailer(userSender.email, userSender.username, userReceiver.email, 'Pet Request',
		 ' ACCEPTED your request to play with their pet! Send and email back to ' + userSender.email + ' and get the details on where to meet!  Link: ')

			res.redirect('/pets/' + updatedSchedule.pet)
		}
		else if (req.params.id === "d"){
			console.log();
			const deletedSchedule = await Schedule.findByIdAndDelete(req.body.scheduleId);
			console.log(deletedSchedule, "<<< ===== schedule deleted");
			const userSender = await User.findById(deletedSchedule.petOwnerId)
			const userReceiver = await User.findById(deletedSchedule.proposerId)
			mailer(userSender.email, userSender.username, userReceiver.email, 'Pet Request',
		 ' DECLINED your request to play with their pet :( . Send and email back to ' + userSender.email + ' or return to the site to propose a new time!  Link: ')
			const foundPet = await Pet.findOne({schedule:req.body.scheduleId});
			console.log(foundPet, "<<< ===== pet before splice");
			const index = foundPet.schedule.indexOf(req.body.scheduleId)
			foundPet.schedule.splice(index,1);
			foundPet.save()
			console.log(foundPet, "<<< ===== pet after splice");
			res.redirect('/pets/' + foundPet._id)
		}
	  }
	  catch(err){
	  		next(err)
	  }

})

module.exports = router;