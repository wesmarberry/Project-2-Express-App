const express = require('express');
const router = express.Router();
const Pet = require('../models/pet')
const User = require('../models/user')
const Schedule = require('../models/schedule')
const nodemailer	 = require('nodemailer')


// smtp setup

const mailer = async (senderEmail, senderUsername, receiverEmail, subject, message) => {

	// let testAccount = await nodemailer.createTestAccount()

	let transporter = nodemailer.createTransport({
	host: 'smtp.gmail.com',
	auth: {
		user: "pupfinder12345@gmail.com",
		pass: "?pup12345"
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
	  			pets: allPets
	  		});
	  }
	  catch(err){
	  		res.send(err);
	  }
});

router.get('/new', (req,res)=>{

	res.render('pet/new.ejs',{
		user: req.session.userDbId
	})
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


router.get('/:id', async(req,res)=>{
	  try{
			const petFound = await Pet.findOne({_id:req.params.id}).populate('schedule')
			res.render('pet/show.ejs',{
				pet: petFound,
				loggedInUser: req.session.userDbId,
				loggedInUsername: req.session.username
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
				pet: petToUpdate
			})  				
	  }
	  catch(err){
	  		res.send(err)
	  }
})


router.put('/:id', async(req,res)=>{
	  try{
			const petToUpdated = await Pet.findByIdAndUpdate(req.params.id, req.body);

			res.redirect('/pets'); 				
	  }
	  catch(err){
	  		res.send(err)
	  }
})


router.post('/', async(req,res)=>{
	  try{
	  		console.log(req.body);
			const petCreated = await Pet.create(req.body)
			const foundUser = await User.findById(req.body.owner)
			
			foundUser.pets.push(petCreated._id)
			foundUser.save()
			
			res.redirect(`pets/${petCreated._id}`)
	  }
	  catch(err){
	  		res.send(err)
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