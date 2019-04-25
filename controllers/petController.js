const express = require('express');
const router = express.Router();
const Pet = require('../models/pet')
const User = require('../models/user')
const Schedule = require('../models/schedule')

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
	console.log(req.session + ' this is req. session');
	console.log(req.session.userDbId + " this is user db id");
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

			console.log("=====pet was updated========");
			console.log(petToUpdated);
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
			console.log(foundUser);
			foundUser.pets.push(petCreated._id)
			foundUser.save()
			console.log(foundUser);
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
		
		foundPet.schedule.push(createdSchedule)
		
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
			console.log(updatedSchedule, "<<< ===== schedule updated");
			res.redirect('/pets/' + updatedSchedule.pet)
		}
		else if (req.params.id === "b"){
			const deletedSchedule = await Schedule.findByIdAndDelete(req.body.scheduleId);
			console.log(deletedSchedule, "<<< ===== schedule deleted");

			const foundPet = await Pet.findOne({schedule:req.body.scheduleId});
			console.log(foundPet, "<<< ===== pet before splice");
			const index = foundPet.schedule.indexOf(req.body.scheduleId)
			foundPet.splice(index,1);
			foundPet.save()
			console.log(foundPet, "<<< ===== pet after splice");
		}

		res.redirect('/pets/' + foundPet._id)
	  		
	  }
	  catch(err){
	  		next(err)
	  }

})

module.exports = router;