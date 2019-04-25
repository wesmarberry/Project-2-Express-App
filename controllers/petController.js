const express = require('express');
const router = express.Router();
const Pet = require('../models/pet')
const User = require('../models/user')

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
			const petRemoved = await Pet.deleteOne({_id:req.params.id});
			console.log(`Dog petRemoved ${petRemoved}`);
			//also we need to upate the user array
			res.redirect('/pets')			
	  }
	  catch(err){
	  		res.send(err)
	  }
})


router.get('/:id', async(req,res)=>{
	  try{
			const petFound = await Pet.findOne({_id:req.params.id});
			res.render('pet/show.ejs',{
				pet: petFound
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
module.exports = router;